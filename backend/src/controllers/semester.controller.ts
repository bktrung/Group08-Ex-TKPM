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

	getAllSemesters = async (req: Request, res: Response, next: NextFunction) => {
		const { academicYear, semester, page, limit } = req.query;

		const semestersData = await this.semesterService.getAllSemesters({
			academicYear: academicYear as string,
			semester: semester as string,
			page: page as string,
			limit: limit as string
		});

		return new OK({
			message: 'Retrieved semesters successfully',
			metadata: semestersData,
		}).send(res);
	}

	getSemesterByDetails = async (req: Request, res: Response, next: NextFunction) => {
		const { academicYear, semester } = req.params;
		const semesterNumber = parseInt(semester);

		const semesterData = await this.semesterService.getSemesterByDetails(academicYear, semesterNumber);

		return new OK({
			message: 'Retrieved semester successfully',
			metadata: { semester: semesterData },
		}).send(res);
	}
}