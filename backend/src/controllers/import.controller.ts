import { Request, Response, NextFunction } from 'express';
import { CREATED } from '../responses/success.responses';
import ImportService from '../services/import.service';

class ImportController {
	importData = async (req: Request, res: Response, next: NextFunction) => {
		const result = await ImportService.importData(req, res);
		let message = `Import completed. ${result.successCount} of ${result.totalRecords} records processed successfully.`;

		if (result.failedCount > 0) {
			message += ` ${result.failedCount} records failed validation.`;
		}

		if (result.errorSummary) {
			message += ` ${result.errorSummary}`;
		}

		return new CREATED({
			message,
			metadata: result
		}).send(res);
	}
}

export default new ImportController();