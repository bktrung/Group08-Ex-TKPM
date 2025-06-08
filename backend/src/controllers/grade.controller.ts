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

	getGradesByClass = async (req: Request, res: Response, next: NextFunction) => {
		const { classCode } = req.params;
		const grades = await this.gradeService.getGradesByClass(classCode);
		return new OK({
			message: 'Retrieved class grades successfully',
			metadata: { grades }
		}).send(res);
	}

	getGradeByStudentAndClass = async (req: Request, res: Response, next: NextFunction) => {
		const { studentId, classCode } = req.params;
		const grade = await this.gradeService.getGradeByStudentAndClass(studentId, classCode);
		return new OK({
			message: 'Retrieved student grade successfully',
			metadata: { grade }
		}).send(res);
	}

	updateGrade = async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const updateData = req.body;
		const updatedGrade = await this.gradeService.updateGrade(id, updateData);
		return new OK({
			message: 'Grade updated successfully',
			metadata: { updatedGrade }
		}).send(res);
	}

	deleteGrade = async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const deletedGrade = await this.gradeService.deleteGrade(id);
		return new OK({
			message: 'Grade deleted successfully',
			metadata: { deletedGrade }
		}).send(res);
	}
}