import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { IGradeService } from '../interfaces/services/grade.service.interface';
import { CREATED, OK } from "../responses/success.responses";
import { TYPES } from '../configs/di.types';

@injectable()
export class GradeController {
	constructor(
		@inject(TYPES.GradeService) private gradeService: IGradeService
	) {}

	createGrade = async (req: Request, res: Response, next: NextFunction) => {
		const gradeData = req.body;
		const newGrade = await this.gradeService.createGrade(gradeData);
		return new CREATED({
			message: 'Grade created successfully',
			metadata: { newGrade }
		}).send(res);
	}
}