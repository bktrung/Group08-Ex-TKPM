import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { IEnrollmentService } from '../interfaces/services/enrollment.service.interface';
import { CREATED, OK } from '../responses/success.responses';
import { TYPES } from '../configs/di.types';

@injectable()
export class EnrollmentController {
	constructor(
		@inject(TYPES.EnrollmentService) private enrollmentService: IEnrollmentService
	) {}

	enrollStudent = async (req: Request, res: Response, next: NextFunction) => {
		const enrollmentData = req.body;
		const newEnrollment = await this.enrollmentService.enrollStudent(enrollmentData);
		return new CREATED({
			message: 'Enrollment created successfully',
			metadata: { newEnrollment }
		}).send(res);
	}

	dropStudent = async (req: Request, res: Response, next: NextFunction) => {
		const { studentId, classCode, dropReason } = req.body;
		const updatedEnrollment = await this.enrollmentService.dropStudent(studentId, classCode, dropReason);
		return new OK({
			message: 'Enrollment dropped successfully',
			metadata: { updatedEnrollment }
		}).send(res);
	}

	getDropHistory = async (req: Request, res: Response, next: NextFunction) => {
		const { studentId } = req.params;
		const dropHistory = await this.enrollmentService.getDropHistory(studentId);
		return new OK({
			message: 'Drop history retrieved successfully',
			metadata: { dropHistory }
		}).send(res);
	}
}