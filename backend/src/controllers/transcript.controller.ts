import { injectable, inject } from "inversify";
import { OK } from '../responses/success.responses';
import { Request, Response, NextFunction } from 'express';
import { ITranscriptService } from '../interfaces/services/transcript.service.interface';
import { TYPES } from '../configs/di.types';

@injectable()
export class TranscriptController {
	constructor(
		@inject(TYPES.TranscriptService) private transcriptService: ITranscriptService
	) {}

	generateTranscript = async (req: Request, res: Response, next: NextFunction) => {
		const { studentId } = req.params;
		const transcript = await this.transcriptService.generateTranscript(studentId);
		return new OK({
			message: 'Transcript retrieved successfully',
			metadata: { transcript }
		}).send(res);
	}
};