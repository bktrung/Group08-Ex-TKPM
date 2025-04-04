import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import csv from "csv-parser";
import { XMLParser } from 'fast-xml-parser';
import * as xlsx from 'xlsx';
import { BadRequestError } from "../responses/error.responses";
import { importStudentSchema } from "../validators/student/import-student.validator";
import { findDepartmentByName } from "../models/repositories/department.repo";
import { findProgramByName } from "../models/repositories/program.repo";
import { addStudent, findStudent, findStudentStatus } from "../models/repositories/student.repo";

const MAX_DETAILED_ERRORS = 50;

interface ValidationResult {
	isValid: boolean;
	validatedData?: any;
	errors?: string[];
}

interface ImportDataResult {
	totalRecords: number;
	successCount: number;
	failedCount: number;
	errors: string[];
	errorSummary?: string;
}

interface ImportStrategy {
	fileType: string;
	importData(filePath: string): Promise<ImportDataResult>;
}

abstract class BaseImportStrategy implements ImportStrategy {
	fileType: string;
	protected validRecords: any[] = [];

	constructor(fileType: string) {
		this.fileType = fileType;
	}

	abstract importData(filePath: string): Promise<ImportDataResult>;

	protected async validateData(data: any): Promise<ValidationResult> {
		try {
			const processedData = this.preprocessData(data);

			const { error, value } = importStudentSchema.validate(processedData, {
				abortEarly: false,
				stripUnknown: true,
			});

			if (error) {
				const errors = error.details.map(detail => detail.message);
				return { isValid: false, errors };
			}

			try {
				const existingStudent = await findStudent({
					$or: [
						{ studentId: value.studentId },
						{ email: value.email },
						{ phoneNumber: value.phoneNumber },
						{ 'identityDocument.number': value.identityDocument.number }
					]
				})

				if (existingStudent) {
					const errors = [];
					if (existingStudent.studentId === value.studentId) {
						errors.push('Student ID already exists');
					}
					if (existingStudent.email === value.email) {
						errors.push('Email already exists');
					}
					if (existingStudent.phoneNumber === value.phoneNumber) {
						errors.push('Phone number already exists');
					}
					if (existingStudent.identityDocument.number === value.identityDocument.number) {
						errors.push('Identity document number already exists');
					}

					return {
						isValid: false,
						errors
					};
				}

				const department = await findDepartmentByName(value.department);
				if (!department) {
					return {
						isValid: false,
						errors: [`Department '${value.department}' not found`]
					};
				}

				value.department = department._id;

				const program = await findProgramByName(value.program);
				if (!program) {
					return {
						isValid: false,
						errors: [`Program '${value.program}' not found`]
					};
				}

				value.program = program._id;

				const studentStatus = await findStudentStatus(value.status);
				if (!studentStatus) {
					return {
						isValid: false,
						errors: [`Student status '${value.status}' not found`]
					};
				}

				value.status = studentStatus._id;

				return {
					isValid: true,
					validatedData: value
				};
			} catch (error) {
				return {
					isValid: false,
					errors: [`Error resolving references: ${(error as Error).message}`]
				};
			}
		} catch (error) {
			return {
				isValid: false,
				errors: [(error as Error).message]
			};
		}


	}
	protected preprocessData(data: any): any {
		return data;
	}

	protected async saveData(data: any): Promise<void> {
		await addStudent(data);
	}

	// Helper method to manage errors efficiently
	protected addError(result: ImportDataResult, errorMessage: string, recordIndex: number): void {
		result.failedCount++;

		// Only add detailed errors up to the maximum limit
		if (result.errors.length < MAX_DETAILED_ERRORS) {
			result.errors.push(`Record #${recordIndex}: ${errorMessage}`);
		}

		// If this is the error that exceeds our limit, add a summary message
		if (result.errors.length === MAX_DETAILED_ERRORS) {
			result.errorSummary = `Too many errors to display completely. Showing first ${MAX_DETAILED_ERRORS} errors.`;
		}
	}
}

class JsonImportStrategy extends BaseImportStrategy {
	constructor() {
		super('application/json');
	}

	async importData(filePath: string): Promise<ImportDataResult> {
		const result: ImportDataResult = {
			totalRecords: 0,
			successCount: 0,
			failedCount: 0,
			errors: []
		};

		const fileData = await fs.readFile(filePath, 'utf-8');
		const jsonData = JSON.parse(fileData);
		const students = Array.isArray(jsonData) ? jsonData : [jsonData];
		result.totalRecords = students.length;

		// Process each student record
		for (let i = 0; i < students.length; i++) {
			try {
				const processedData = this.preprocessData(students[i]);
				const validation = await this.validateData(processedData);

				if (validation.isValid && validation.validatedData) {
					await this.saveData(validation.validatedData);
					result.successCount++;
				} else if (validation.errors) {
					this.addError(result, validation.errors.join(', '), i + 1);
				}
			} catch (error) {
				this.addError(result, (error as Error).message, i + 1);
			}
		}

		return result;
	}

	protected preprocessData(data: any): any {
		// Make a deep copy to avoid modifying the original
		const processed = JSON.parse(JSON.stringify(data));

		// Convert string booleans to actual booleans
		if (processed.identityDocument && processed.identityDocument.hasChip !== undefined) {
			if (processed.identityDocument.hasChip === "true") {
				processed.identityDocument.hasChip = true;
			} else if (processed.identityDocument.hasChip === "false") {
				processed.identityDocument.hasChip = false;
			}
		}

		// Handle schoolYear as number
		if (processed.schoolYear && typeof processed.schoolYear === 'string') {
			processed.schoolYear = parseInt(processed.schoolYear, 10);
		}

		return processed;
	}
}

class CsvImportStrategy extends BaseImportStrategy {
	constructor() {
		super('text/csv');
	}

	async importData(filePath: string): Promise<ImportDataResult> {
		const result: ImportDataResult = {
			totalRecords: 0,
			successCount: 0,
			failedCount: 0,
			errors: []
		};

		// Use stream processing for better memory efficiency with large files
		return new Promise((resolve, reject) => {
			const students: any[] = [];

			createReadStream(filePath)
				.pipe(csv({
					// Set CSV options for parsing
					mapValues: ({ header, value }) => {
						// Handle empty values
						if (value === '' || value === 'null' || value === 'undefined') {
							return null;
						}
						return value;
					}
				}))
				.on('data', (row) => {
					students.push(row);
				})
				.on('end', async () => {
					try {
						result.totalRecords = students.length;

						// Process each student record
						for (let i = 0; i < students.length; i++) {
							try {
								// Transform CSV record to proper object structure
								const transformedRecord = this.transformCsvRecord(students[i]);
								// Process the record
								const processedData = this.preprocessData(transformedRecord);
								const validation = await this.validateData(processedData);

								if (validation.isValid && validation.validatedData) {
									await this.saveData(validation.validatedData);
									result.successCount++;
								} else if (validation.errors) {
									this.addError(result, validation.errors.join(', '), i + 1);
								}
							} catch (error) {
								this.addError(result, (error as Error).message, i + 1);
							}
						}

						resolve(result);
					} catch (error) {
						reject(new Error(`Error processing CSV records: ${(error as Error).message}`));
					}
				})
				.on('error', (error) => {
					reject(new Error(`Error reading CSV file: ${error.message}`));
				});
		});
	}

	protected transformCsvRecord(record: any): any {
		const transformed: any = {};

		// Process each field
		Object.keys(record).forEach(key => {
			// Handle nested fields (with dot notation)
			if (key.includes('.')) {
				const parts = key.split('.');
				let current = transformed;

				// Create nested structure
				for (let i = 0; i < parts.length - 1; i++) {
					const part = parts[i];
					if (!current[part]) {
						current[part] = {};
					}
					current = current[part];
				}

				// Set the final value
				current[parts[parts.length - 1]] = record[key];
			} else {
				// Handle simple fields
				transformed[key] = record[key];
			}
		});

		return transformed;
	}

	protected preprocessData(data: any): any {
		// Make a deep copy to avoid modifying the original
		const processed = JSON.parse(JSON.stringify(data));

		// Handle dates
		const dateFields = [
			'dateOfBirth',
			'identityDocument.issueDate',
			'identityDocument.expiryDate'
		];

		dateFields.forEach(field => {
			const parts = field.split('.');
			let obj = processed;

			// Navigate to the object containing the date field
			for (let i = 0; i < parts.length - 1; i++) {
				if (!obj || !obj[parts[i]]) return;
				obj = obj[parts[i]];
			}

			// Get the actual field name (last part)
			const dateField = parts[parts.length - 1];

			// Convert to Date object if it exists
			if (obj && obj[dateField]) {
				try {
					// Handle different date formats
					if (obj[dateField].includes('T')) {
						// ISO date format
						obj[dateField] = new Date(obj[dateField]);
					} else {
						// Simple date format (YYYY-MM-DD)
						obj[dateField] = new Date(obj[dateField]);
					}
				} catch (e) {
					console.warn(`Failed to parse date: ${obj[dateField]}`);
				}
			}
		});

		// Convert string booleans to actual booleans
		if (processed.identityDocument && processed.identityDocument.hasChip !== undefined) {
			if (processed.identityDocument.hasChip === "true") {
				processed.identityDocument.hasChip = true;
			} else if (processed.identityDocument.hasChip === "false") {
				processed.identityDocument.hasChip = false;
			}
		}

		// Handle schoolYear as number
		if (processed.schoolYear && typeof processed.schoolYear === 'string') {
			processed.schoolYear = parseInt(processed.schoolYear, 10);
		}

		return processed;
	}
}

class XmlImportStrategy extends BaseImportStrategy {
	constructor() {
		super('application/xml');
	}

	async importData(filePath: string): Promise<ImportDataResult> {
		const result: ImportDataResult = {
			totalRecords: 0,
			successCount: 0,
			failedCount: 0,
			errors: []
		};

		try {
			// Read the XML file
			const xmlData = await fs.readFile(filePath, 'utf-8');

			// Parse XML to JS object
			const parser = new XMLParser({
				ignoreAttributes: false,
				attributeNamePrefix: "_",
				isArray: (name) => name === 'record'
			});
			const parsedData = parser.parse(xmlData);

			if (!parsedData.data || !parsedData.data.record) {
				throw new Error('Invalid XML structure: missing data or records');
			}

			const records = Array.isArray(parsedData.data.record)
				? parsedData.data.record
				: [parsedData.data.record];

			result.totalRecords = records.length;

			// Process each record
			for (let i = 0; i < records.length; i++) {
				try {
					const transformedRecord = this.transformXmlRecord(records[i]);
					const processedData = this.preprocessData(transformedRecord);
					const validation = await this.validateData(processedData);

					if (validation.isValid && validation.validatedData) {
						await this.saveData(validation.validatedData);
						result.successCount++;
					} else if (validation.errors) {
						this.addError(result, validation.errors.join(', '), i + 1);
					}
				} catch (error) {
					this.addError(result, (error as Error).message, i + 1);
				}
			}

			return result;
		} catch (error) {
			throw new Error(`Error processing XML file: ${(error as Error).message}`);
		}
	}

	protected transformXmlRecord(record: any): any {
		// Handle nested structure conversion
		const transformed: any = {};

		// Map simple fields
		const simpleFields = [
			'studentId', 'fullName', 'dateOfBirth', 'gender', 'department',
			'schoolYear', 'program', 'email', 'status', 'nationality'
		];

		simpleFields.forEach(field => {
			if (record[field] !== undefined) {
				transformed[field] = record[field];
			}
		});

		// Handle phone number - simply extract it without formatting
		if (record.phoneNumber) {
			transformed.phoneNumber = String(record.phoneNumber);
		}

		// Map nested objects
		if (record.mailingAddress) {
			transformed.mailingAddress = {
				houseNumberStreet: record.mailingAddress.houseNumberStreet,
				wardCommune: record.mailingAddress.wardCommune || 'None', // Default value if missing
				districtCounty: record.mailingAddress.districtCounty,
				provinceCity: record.mailingAddress.provinceCity,
				country: record.mailingAddress.country,
			};
		}

		// Handle identity document properly based on type
		if (record.identityDocument) {
			// Start with common fields
			transformed.identityDocument = {
				type: record.identityDocument.type,
				number: String(record.identityDocument.number),
				issueDate: record.identityDocument.issueDate,
				issuedBy: record.identityDocument.issuedBy,
				expiryDate: record.identityDocument.expiryDate,
			};

			// Handle type-specific fields
			if (record.identityDocument.type === 'CCCD') {
				// For CCCD, hasChip is required
				if (typeof record.identityDocument.hasChip === 'string') {
					transformed.identityDocument.hasChip =
						record.identityDocument.hasChip.toLowerCase() === 'true';
				} else {
					transformed.identityDocument.hasChip = !!record.identityDocument.hasChip;
				}
			} else if (record.identityDocument.type === 'PASSPORT') {
				// For Passport, issuingCountry is required
				transformed.identityDocument.issuingCountry =
					record.identityDocument.issuingCountry || 'Vietnam';
			}
		}

		return transformed;
	}

	protected preprocessData(data: any): any {
		// Make a deep copy to avoid modifying the original
		const processed = JSON.parse(JSON.stringify(data));

		// Ensure studentId is a string
		if (processed.studentId) {
			processed.studentId = String(processed.studentId);
		}

		if (processed.phoneNumber) {
			processed.phoneNumber = String(processed.phoneNumber);
		}

		// Ensure correct identity document structure based on type
		if (processed.identityDocument) {
			// Ensure number is a string
			if (processed.identityDocument.number) {
				processed.identityDocument.number = String(processed.identityDocument.number);
			}

			// Handle type-specific validations
			if (processed.identityDocument.type === 'CCCD') {
				// Ensure hasChip is boolean
				if (processed.identityDocument.hasChip === undefined) {
					processed.identityDocument.hasChip = false;
				} else if (typeof processed.identityDocument.hasChip === 'string') {
					processed.identityDocument.hasChip =
						processed.identityDocument.hasChip.toLowerCase() === 'true';
				} else {
					processed.identityDocument.hasChip = !!processed.identityDocument.hasChip;
				}

				// Ensure CCCD number is exactly 12 digits
				if (processed.identityDocument.number) {
					// Keep only digits
					const digitsOnly = processed.identityDocument.number.replace(/\D/g, '');
					if (digitsOnly.length !== 12) {
						// Pad or truncate to exactly 12 digits
						processed.identityDocument.number =
							digitsOnly.padStart(12, '0').substring(0, 12);
					} else {
						processed.identityDocument.number = digitsOnly;
					}
				}
			} else if (processed.identityDocument.type === 'CMND') {
				// Ensure CMND number is exactly 9 digits
				if (processed.identityDocument.number) {
					// Keep only digits
					const digitsOnly = processed.identityDocument.number.replace(/\D/g, '');
					if (digitsOnly.length !== 9) {
						// Pad or truncate to exactly 9 digits
						processed.identityDocument.number =
							digitsOnly.padStart(9, '0').substring(0, 9);
					} else {
						processed.identityDocument.number = digitsOnly;
					}
				}
			} else if (processed.identityDocument.type === 'PASSPORT') {
				// Ensure issuingCountry is present
				if (!processed.identityDocument.issuingCountry) {
					processed.identityDocument.issuingCountry = 'Vietnam';
				}

				// Format passport number (should be 1 uppercase letter followed by 8 digits)
				if (processed.identityDocument.number) {
					// Extract first letter and digits
					const firstLetter = processed.identityDocument.number.match(/[A-Za-z]/)
						? processed.identityDocument.number.match(/[A-Za-z]/)[0].toUpperCase()
						: 'A';

					const digitsOnly = processed.identityDocument.number.replace(/\D/g, '');
					processed.identityDocument.number =
						firstLetter + digitsOnly.padStart(8, '0').substring(0, 8);
				}
			}
		}

		// Handle dates
		const dateFields = [
			'dateOfBirth',
			'identityDocument.issueDate',
			'identityDocument.expiryDate'
		];

		dateFields.forEach(field => {
			const parts = field.split('.');
			let obj = processed;

			// Navigate to the object containing the date field
			for (let i = 0; i < parts.length - 1; i++) {
				if (!obj || !obj[parts[i]]) return;
				obj = obj[parts[i]];
			}

			// Get the actual field name (last part)
			const dateField = parts[parts.length - 1];

			// Convert to Date object if it exists
			if (obj && obj[dateField]) {
				try {
					// Handle different date formats
					if (typeof obj[dateField] === 'string') {
						// Parse the date
						obj[dateField] = new Date(obj[dateField]);

						// Ensure valid date - if invalid, set to a reasonable default
						if (isNaN(obj[dateField].getTime())) {
							console.warn(`Invalid date format: ${obj[dateField]}`);

							// Set reasonable defaults based on the field
							if (dateField === 'dateOfBirth') {
								// Default to 18 years ago
								const defaultDate = new Date();
								defaultDate.setFullYear(defaultDate.getFullYear() - 18);
								obj[dateField] = defaultDate;
							} else if (dateField === 'issueDate') {
								// Default to 5 years ago
								const defaultDate = new Date();
								defaultDate.setFullYear(defaultDate.getFullYear() - 5);
								obj[dateField] = defaultDate;
							} else if (dateField === 'expiryDate') {
								// Default to 10 years in future
								const defaultDate = new Date();
								defaultDate.setFullYear(defaultDate.getFullYear() + 10);
								obj[dateField] = defaultDate;
							}
						}
					}
				} catch (e) {
					console.warn(`Failed to parse date: ${obj[dateField]}`);
				}
			}
		});

		// Handle schoolYear as number
		if (processed.schoolYear && typeof processed.schoolYear === 'string') {
			processed.schoolYear = parseInt(processed.schoolYear, 10);
		}

		return processed;
	}
}

class ExcelImportStrategy extends BaseImportStrategy {
	constructor() {
		super('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	}

	async importData(filePath: string): Promise<ImportDataResult> {
		const result: ImportDataResult = {
			totalRecords: 0,
			successCount: 0,
			failedCount: 0,
			errors: []
		};

		try {
			// Read the Excel file
			const workbook = xlsx.readFile(filePath);
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];

			// Convert to JSON
			const records = xlsx.utils.sheet_to_json(worksheet);

			result.totalRecords = records.length;

			// Process each record
			for (let i = 0; i < records.length; i++) {
				try {
					const transformedRecord = this.transformExcelRecord(records[i]);
					const processedData = this.preprocessData(transformedRecord);
					const validation = await this.validateData(processedData);

					if (validation.isValid && validation.validatedData) {
						await this.saveData(validation.validatedData);
						result.successCount++;
					} else if (validation.errors) {
						this.addError(result, validation.errors.join(', '), i + 1);
					}
				} catch (error) {
					this.addError(result, (error as Error).message, i + 1);
				}
			}

			return result;
		} catch (error) {
			throw new Error(`Error processing Excel file: ${(error as Error).message}`);
		}
	}

	protected transformExcelRecord(record: any): any {
		// Handle nested structure conversion
		const transformed: any = {};

		// First, extract mailing address fields and create a nested object
		const mailingAddress: any = {};
		const addressFields = [
			'mailingAddress.houseNumberStreet',
			'mailingAddress.wardCommune',
			'mailingAddress.districtCounty',
			'mailingAddress.provinceCity',
			'mailingAddress.country'
		];

		addressFields.forEach(field => {
			const fieldName = field.split('.')[1];
			if (record[field] !== undefined) {
				mailingAddress[fieldName] = record[field];
			}
		});

		if (Object.keys(mailingAddress).length > 0) {
			transformed.mailingAddress = mailingAddress;
		}

		// Handle identity document fields - create a nested object
		const identityDoc: any = {};
		const identityFields = [
			'identityDocument.type',
			'identityDocument.hasChip',
			'identityDocument.number',
			'identityDocument.issueDate',
			'identityDocument.issuedBy',
			'identityDocument.expiryDate'
		];

		identityFields.forEach(field => {
			const fieldName = field.split('.')[1];
			if (record[field] !== undefined) {
				identityDoc[fieldName] = record[field];
			}
		});

		if (Object.keys(identityDoc).length > 0) {
			transformed.identityDocument = identityDoc;

			// Convert hasChip to boolean if it exists
			if (transformed.identityDocument.hasChip !== undefined) {
				const chipValue = String(transformed.identityDocument.hasChip).toLowerCase();
				transformed.identityDocument.hasChip =
					chipValue === 'true' || chipValue === '1' || chipValue === 'yes';
			}
		}

		// Map simple fields
		const simpleFields = [
			'studentId', 'fullName', 'dateOfBirth', 'gender', 'department',
			'schoolYear', 'program', 'email', 'phoneNumber', 'status', 'nationality'
		];

		simpleFields.forEach(field => {
			if (record[field] !== undefined) {
				transformed[field] = record[field];
			}
		});

		return transformed;
	}

	protected preprocessData(data: any): any {
		// Make a deep copy to avoid modifying the original
		const processed = JSON.parse(JSON.stringify(data));

		// Ensure studentId is a string
		if (processed.studentId) {
			processed.studentId = String(processed.studentId);
		}

		if (processed.phoneNumber) {
			processed.phoneNumber = String(processed.phoneNumber);
		}

		// Ensure correct identity document structure based on type
		if (processed.identityDocument) {
			// Ensure number is a string
			if (processed.identityDocument.number) {
				processed.identityDocument.number = String(processed.identityDocument.number);
			}

			// Handle type-specific validations
			if (processed.identityDocument.type === 'CCCD') {
				// Ensure hasChip is boolean
				if (processed.identityDocument.hasChip === undefined) {
					processed.identityDocument.hasChip = false;
				} else if (typeof processed.identityDocument.hasChip === 'string') {
					const chipValue = processed.identityDocument.hasChip.toLowerCase();
					processed.identityDocument.hasChip =
						chipValue === 'true' || chipValue === '1' || chipValue === 'yes';
				} else {
					processed.identityDocument.hasChip = !!processed.identityDocument.hasChip;
				}

				// Ensure CCCD number is exactly 12 digits
				if (processed.identityDocument.number) {
					// Keep only digits
					const digitsOnly = processed.identityDocument.number.replace(/\D/g, '');
					if (digitsOnly.length !== 12) {
						// Pad or truncate to exactly 12 digits
						processed.identityDocument.number =
							digitsOnly.padStart(12, '0').substring(0, 12);
					} else {
						processed.identityDocument.number = digitsOnly;
					}
				}
			} else if (processed.identityDocument.type === 'CMND') {
				// Ensure CMND number is exactly 9 digits
				if (processed.identityDocument.number) {
					// Keep only digits
					const digitsOnly = processed.identityDocument.number.replace(/\D/g, '');
					if (digitsOnly.length !== 9) {
						// Pad or truncate to exactly 9 digits
						processed.identityDocument.number =
							digitsOnly.padStart(9, '0').substring(0, 9);
					} else {
						processed.identityDocument.number = digitsOnly;
					}
				}
			} else if (processed.identityDocument.type === 'PASSPORT') {
				// Ensure issuingCountry is present
				if (!processed.identityDocument.issuingCountry) {
					processed.identityDocument.issuingCountry = 'Vietnam';
				}

				// Format passport number (should be 1 uppercase letter followed by 8 digits)
				if (processed.identityDocument.number) {
					// Extract first letter and digits
					const firstLetter = processed.identityDocument.number.match(/[A-Za-z]/)
						? processed.identityDocument.number.match(/[A-Za-z]/)[0].toUpperCase()
						: 'A';

					const digitsOnly = processed.identityDocument.number.replace(/\D/g, '');
					processed.identityDocument.number =
						firstLetter + digitsOnly.padStart(8, '0').substring(0, 8);
				}
			}
		}

		// Handle dates - Excel often outputs dates as numbers or in various formats
		const dateFields = [
			'dateOfBirth',
			'identityDocument.issueDate',
			'identityDocument.expiryDate'
		];

		dateFields.forEach(field => {
			const parts = field.split('.');
			let obj = processed;

			// Navigate to the object containing the date field
			for (let i = 0; i < parts.length - 1; i++) {
				if (!obj || !obj[parts[i]]) return;
				obj = obj[parts[i]];
			}

			// Get the actual field name (last part)
			const dateField = parts[parts.length - 1];

			// Convert to Date object if it exists
			if (obj && obj[dateField] !== undefined) {
				try {
					// Handle date formats from Excel (could be string, number, or Date)
					if (typeof obj[dateField] === 'string') {
						// Try to parse date from a string
						// Handle various date formats
						const dateValue = obj[dateField];

						// Check for MM/DD/YYYY format
						if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
							const [month, day, year] = dateValue.split('/').map(Number);
							obj[dateField] = new Date(year, month - 1, day);
						} else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateValue)) {
							// Check for MM-DD-YYYY format
							const [month, day, year] = dateValue.split('-').map(Number);
							obj[dateField] = new Date(year, month - 1, day);
						} else {
							// Try standard date parsing
							obj[dateField] = new Date(dateValue);
						}
					} else if (typeof obj[dateField] === 'number') {
						// Excel stores dates as serial numbers
						// Convert Excel serial date to JavaScript date
						const excelEpoch = new Date(1899, 11, 30);
						const msPerDay = 24 * 60 * 60 * 1000;
						obj[dateField] = new Date(excelEpoch.getTime() + obj[dateField] * msPerDay);
					}

					// Ensure valid date - if invalid, set to a reasonable default
					if (isNaN(obj[dateField].getTime())) {
						console.warn(`Invalid date format: ${obj[dateField]}`);

						// Set reasonable defaults based on the field
						if (dateField === 'dateOfBirth') {
							// Default to 18 years ago
							const defaultDate = new Date();
							defaultDate.setFullYear(defaultDate.getFullYear() - 18);
							obj[dateField] = defaultDate;
						} else if (dateField === 'issueDate') {
							// Default to 5 years ago
							const defaultDate = new Date();
							defaultDate.setFullYear(defaultDate.getFullYear() - 5);
							obj[dateField] = defaultDate;
						} else if (dateField === 'expiryDate') {
							// Default to 10 years in future
							const defaultDate = new Date();
							defaultDate.setFullYear(defaultDate.getFullYear() + 10);
							obj[dateField] = defaultDate;
						}
					}
				} catch (e) {
					console.warn(`Failed to parse date: ${obj[dateField]}`);
				}
			}
		});

		// Handle schoolYear as number
		if (processed.schoolYear && typeof processed.schoolYear === 'string') {
			processed.schoolYear = parseInt(processed.schoolYear, 10);
		}

		return processed;
	}
}

class ImportService {
	private strategies: Map<string, ImportStrategy>;
	private storage: multer.StorageEngine;
	private upload: multer.Multer;

	constructor() {
		this.strategies = new Map();

		const tempDir = path.join(process.cwd(), 'temp');
		fs.mkdir(tempDir, { recursive: true })
			.catch(err => console.error('Failed to create temp directory:', err));


		this.storage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, tempDir);
			},
			filename: (req, file, cb) => {
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
				cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
			}
		});

		this.upload = multer({
			storage: this.storage,
			limits: { fileSize: 100 * 1024 * 1024, }, // 100MB in bytes
			fileFilter: (req, file, cb) => {
				const ext = path.extname(file.originalname).toLowerCase();
				const allowedExtensions = this.getAvailableExtensions();

				if (allowedExtensions.includes(ext.substring(1))) {
					cb(null, true);
				} else {
					cb(new Error(`Only ${allowedExtensions.join(', ')} files are allowed`));
				}
			}
		});
	}

	registerStrategy(extension: string, strategy: ImportStrategy): void {
		this.strategies.set(extension.toLowerCase(), strategy);
	}

	getAvailableExtensions(): string[] {
		return Array.from(this.strategies.keys());
	}

	getUploader() {
		return this.upload.single('file');
	}

	async importData(req: Request, res: Response): Promise<ImportDataResult> {
		if (!req.file) {
			throw new BadRequestError('No file uploaded');
		}

		const filePath = req.file.path;
		const fileExt = path.extname(req.file.originalname).substring(1).toLowerCase();

		try {
			const strategy = this.strategies.get(fileExt);
			if (!strategy) {
				throw new BadRequestError(`Unsupported import format: ${fileExt}. Available formats: ${this.getAvailableExtensions().join(', ')}`);
			}

			const result = await strategy.importData(filePath);
			return result;
		} finally {
			await fs.unlink(filePath);
		}
	}
}

const importService = new ImportService();

importService.registerStrategy('json', new JsonImportStrategy());
importService.registerStrategy('csv', new CsvImportStrategy());
importService.registerStrategy('xml', new XmlImportStrategy());
importService.registerStrategy('xlsx', new ExcelImportStrategy());

export default importService;