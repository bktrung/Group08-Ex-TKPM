import { OK } from '../responses/success.responses';
import { Request, Response, NextFunction } from 'express';
import TranscriptService from '../services/transcript.service';

class TranscriptController {
	generateTranscript = async (req: Request, res: Response, next: NextFunction) => {
		const { studentId } = req.params;
		const transcript = await TranscriptService.generateTranscript(studentId);
		return new OK({
			message: 'Transcript retrieved successfully',
			metadata: { transcript }
		}).send(res);
	}
};

export default new TranscriptController();