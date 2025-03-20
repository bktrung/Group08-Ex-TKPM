import { Response } from 'express';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { BadRequestError } from '../responses/error.responses';
import Student from '../models/student.model';
import { Types } from 'mongoose';
import { flattenObject } from '../utils';
import * as ExcelJS from 'exceljs';
import { create as createXmlBuilder } from 'xmlbuilder2';

interface ExportStrategy {
	contentType: string;
	fileExtension: string;
	exportData(res: Response, data: any[]): Promise<void>;
}

abstract class BaseExportStrategy implements ExportStrategy {
	contentType: string;
	fileExtension: string;

	constructor(contentType: string, fileExtension: string) {
		this.contentType = contentType;
		this.fileExtension = fileExtension;
	}

	abstract exportData(res: Response, data: any[]): Promise<void>;

	protected setHeaders(res: Response, filename: string): void {
		res.setHeader('Content-Type', this.contentType);
		res.setHeader('Content-Disposition', `attachment; filename="${filename}.${this.fileExtension}"`);
	}
}

class JsonExportStrategy extends BaseExportStrategy {
	constructor() {
		super('application/json', 'json');
	}

	async exportData(res: Response, data: any[]): Promise<void> {
		this.setHeaders(res, 'students');

		// write the opening bracket
		res.write('[\n');

		// keep track if we've written any items
		let hasWrittenItems = false;

		await pipeline(
			Readable.from(data),
			new Transform({
				objectMode: true,
				transform(chunk, encoding, callback) {
					const prefix = hasWrittenItems ? ',\n' : '';
					hasWrittenItems = true;

					try {
						this.push(prefix + JSON.stringify(chunk, null, 2));
						callback();
					} catch (err) {
						callback(err as Error);
					}
				}
			}),
			res,
			{ end: false } // Don't end the response yet
		);

		// write the closing bracket and end the response
		res.end('\n]');
	}
}

class CsvExportStrategy extends BaseExportStrategy {
	constructor() {
		super('text/csv', 'csv');
	}

	async exportData(res: Response, data: any[]): Promise<void> {
		this.setHeaders(res, 'students');

		// Ensure we have data
		if (data.length === 0) {
			res.end('');
			return;
		}

		const allKeys = new Set<string>();

		data.forEach(item => {
			const flattenedKeys = flattenObject(item);
			flattenedKeys.forEach(key => allKeys.add(key));
		});

		// Convert to array and sort for consistent output
		const headers = Array.from(allKeys).sort().join(',');

		// Write the header row
		res.write(headers + '\n');

		// Process each data row
		await pipeline(
			Readable.from(data),
			new Transform({
				objectMode: true,
				transform(chunk, encoding, callback) {
					try {
						// Use the same ordered keys for each row
						const values = Array.from(allKeys)
							.map(key => {
								// Use dot notation to get nested values
								const value = key.split('.').reduce((obj, k) =>
									obj && obj[k] !== undefined ? obj[k] : null, chunk);

								// Handle different data types
								if (value === null || value === undefined) {
									return '';
								} else if (value instanceof Date) {
									return value.toISOString();
								} else if (typeof value === 'object') {
									// This should rarely happen as we've flattened objects
									return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
								} else {
									// Escape quotes and wrap in quotes if contains comma
									const strValue = String(value).replace(/"/g, '""');
									return strValue.includes(',') ? `"${strValue}"` : strValue;
								}
							})
							.join(',');

						this.push(values + '\n');
						callback();
					} catch (err) {
						callback(err as Error);
					}
				}
			}),
			res
		);
	}
}

class XmlExportStrategy extends BaseExportStrategy {
	constructor() {
		super('application/xml', 'xml');
	}

	async exportData(res: Response, data: any[]): Promise<void> {
		this.setHeaders(res, 'students');

		// Create root element
		const xmlRoot = createXmlBuilder({ version: '1.0', encoding: 'UTF-8' })
			.ele('data');

		// Add each record as a child element
		data.forEach((item, index) => {
			const recordElement = xmlRoot.ele('record', { id: index + 1 });

			this.addObjectToXml(recordElement, item);
		});

		// Convert to string and send
		const xmlString = xmlRoot.end({ prettyPrint: true });
		res.end(xmlString);
	}

	private addObjectToXml(parent: any, obj: any): void {
		for (const [key, value] of Object.entries(obj)) {
			if (value === null || value === undefined) {
				parent.ele(key);
			} else if (Array.isArray(value)) {
				const arrayElement = parent.ele(key);
				value.forEach((item, index) => {
					const itemElement = arrayElement.ele('item', { index });
					if (typeof item === 'object' && item !== null) {
						this.addObjectToXml(itemElement, item);
					} else {
						itemElement.txt(String(item));
					}
				});
			} else if (typeof value === 'object' && !(value instanceof Date)) {
				const childElement = parent.ele(key);
				this.addObjectToXml(childElement, value);
			} else {
				// Handle primitive values and dates
				const strValue = value instanceof Date ? value.toISOString() : String(value);
				parent.ele(key).txt(strValue);
			}
		}
	}
}

class ExcelExportStrategy extends BaseExportStrategy {
	constructor() {
		super('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx');
	}

	async exportData(res: Response, data: any[]): Promise<void> {
		this.setHeaders(res, 'students');

		// Create workbook and worksheet
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Data');

		// If no data, return empty workbook
		if (data.length === 0) {
			await workbook.xlsx.write(res);
			return;
		}

		// Collect all keys while preserving order
		const allKeys: string[] = [];
		const keySet = new Set<string>();

		// Gather keys in the order they appear in the first object that has them
		data.forEach(item => {
			const flattenedKeys = flattenObject(item);
			flattenedKeys.forEach(key => {
				if (!keySet.has(key)) {
					keySet.add(key);
					allKeys.push(key);
				}
			});
		});

		// Define columns preserving order
		const columns = allKeys.map(key => ({
			header: key,
			key: key,
			width: 20
		}));
		worksheet.columns = columns;

		// Add rows with flattened data
		data.forEach(item => {
			const rowData: any = {};

			allKeys.forEach(key => {
				// Use dot notation to get nested values
				const value = key.split('.').reduce((obj, k) =>
					obj && obj[k] !== undefined ? obj[k] : null, item);

				if (value === null || value === undefined) {
					rowData[key] = '';
				} else if (value instanceof Date) {
					rowData[key] = value;
				} else if (typeof value === 'object') {
					rowData[key] = JSON.stringify(value);
				} else {
					rowData[key] = value;
				}
			});

			worksheet.addRow(rowData);
		});

		// Style the header row
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

		// Auto-fit columns (approximately)
		worksheet.columns.forEach(column => {
			const headerLength = column.header?.length || 10;
			column.width = Math.max(headerLength + 2, 12);
		});

		// Write to response
		await workbook.xlsx.write(res);
	}
}

class ExportService {
	private strategies: Map<string, ExportStrategy>;

	constructor() {
		this.strategies = new Map();
	}

	registerStrategy(format: string, strategy: ExportStrategy): void {
		this.strategies.set(format.toLowerCase(), strategy);
	}

	getAvailableFormats(): string[] {
		return Array.from(this.strategies.keys());
	}

	async exportData(res: Response, format: string, data: any[]): Promise<void> {
		const strategy = this.strategies.get(format.toLowerCase());

		if (!strategy) {
			throw new BadRequestError(`Unsupported export format: ${format}. Available formats: ${this.getAvailableFormats().join(', ')}`);
		}

		try {
			await strategy.exportData(res, data);
		} catch (error) {
			if (!res.headersSent) {
				throw error;
			} else {
				// If headers are already sent, end the response
				console.error(`Export error after headers sent: ${(error as Error).message}`);
				res.end();
			}
		}
	}

	async exportStudents(res: Response, format: string, filter?: any): Promise<void> {
		try {
			// Apply the filter and get student data
			const query = filter || {};

			const students = await Student.find(query)
				.select('-_id -__v -createdAt -updatedAt')
				.populate('department', 'name')
				.populate('program', 'name')
				.populate('status', 'type')
				.lean();

			// Transform data for export
			const transformedData = students.map(student => {
				// Convert ObjectIds to strings and handle nested objects
				const transformed: any = {};

				// Handle basic fields
				for (const [key, value] of Object.entries(student)) {
					if (value instanceof Types.ObjectId) {
						transformed[key] = value.toString();
					} else if (key === 'department' || key === 'program' || key === 'status') {
						// Handle populated fields
						transformed[key] = (value as any)?.name || (value as any)?.type || value;
					} else if (key === 'dateOfBirth') {
						// Format dates
						transformed[key] = value instanceof Date ?
							value.toISOString().split('T')[0] : value;
					} else {
						transformed[key] = value;
					}
				}

				return transformed;
			});

			await this.exportData(res, format, transformedData);

		} catch (error) {
			if (!res.headersSent) {
				throw error;
			} else {
				console.error(`Export error: ${(error as Error).message}`);
				res.end();
			}
		}
	}
}

const exportService = new ExportService();

exportService.registerStrategy('json', new JsonExportStrategy());
exportService.registerStrategy('csv', new CsvExportStrategy());
exportService.registerStrategy('xml', new XmlExportStrategy());
exportService.registerStrategy('excel', new ExcelExportStrategy());

export default exportService;