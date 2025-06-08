import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { ISemesterService } from '../interfaces/services/semester.service.interface';
import { CREATED, OK } from "../responses/success.responses";
import { TYPES } from '../configs/di.types';

@injectable()
export class SemesterController {
	constructor(
		@inject(TYPES.SemesterService) private semesterService: ISemesterService
	) {}

	createSemester = async (req: Request, res: Response, next: NextFunction) => {
		const semesterData = req.body;
		const newSemester = await this.semesterService.createSemester(semesterData);
		return new CREATED({
			message: 'Semester added successfully',
			metadata: { newSemester }
		}).send(res);
	}

	updateSemester = async (req: Request, res: Response, next: NextFunction) => {
		const { id } = req.params;
		const updateData = req.body;
		const updatedSemester = await this.semesterService.updateSemester(id, updateData);
		return new OK({
			message: 'Semester updated successfully',
			metadata: { updatedSemester }
		}).send(res);
	}
}