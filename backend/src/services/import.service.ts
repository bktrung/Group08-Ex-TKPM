import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import csv from "csv-parser";
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

class ImportService {
	private strategies: Map<string, ImportStrategy>;
	private storage: multer.StorageEngine;
	private upload: multer.Multer;

	constructor() {
		this.strategies = new Map();
		this.storage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, path.join(process.cwd(), 'temp'));
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

export default importService;