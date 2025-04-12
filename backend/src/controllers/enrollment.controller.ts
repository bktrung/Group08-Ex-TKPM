import { Request, Response, NextFunction } from 'express';
import EnrollmentService from '../services/enrollment.service';
import { CREATED, OK } from '../responses/success.responses';

class EnrollmentController {
	enrollStudent = async (req: Request, res: Response, next: NextFunction) => {
		const enrollmentData = req.body;
		const newEnrollment = await EnrollmentService.enrollStudent(enrollmentData);
		return new CREATED({
			message: 'Enrollment created successfully',
			metadata: { newEnrollment }
		}).send(res);
	}

	dropStudent = async (req: Request, res: Response, next: NextFunction) => {
		const { studentId, classCode, dropReason } = req.body;
		const updatedEnrollment = await EnrollmentService.dropStudent(studentId, classCode, dropReason);
		return new OK({
			message: 'Enrollment dropped successfully',
			metadata: { updatedEnrollment }
		}).send(res);
	}

	getDropHistory = async (req: Request, res: Response, next: NextFunction) => {
		const { studentId } = req.params;
		const dropHistory = await EnrollmentService.getDropHistory(studentId);
		return new OK({
			message: 'Drop history retrieved successfully',
			metadata: { dropHistory }
		}).send(res);
	}
}

export default new EnrollmentController();