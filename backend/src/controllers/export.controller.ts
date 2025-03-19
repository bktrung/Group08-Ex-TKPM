import { Request, Response, NextFunction } from 'express';
import ExportService from '../services/export.service';

class ExportController {
	exportData = async (req: Request, res: Response, next: NextFunction) => {
		const format = req.query.format as string || 'json';
		const departmentId = req.query.departmentId as string;

		// Optional filter
		const filter = departmentId ? { department: departmentId } : {};

		await ExportService.exportStudents(res, format, filter);
	}
}

export default new ExportController();