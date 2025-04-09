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
}

export default new EnrollmentController();