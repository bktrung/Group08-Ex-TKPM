import { Request, Response, NextFunction } from 'express';
import SemesterService from '../services/semester.service';
import { CREATED, OK } from "../responses/success.responses";

class SemesterController {
	createSemester = async (req: Request, res: Response, next: NextFunction) => {
		const semesterData = req.body;
		const newSemester = await SemesterService.createSemester(semesterData);
		return new CREATED({
			message: 'Semester added successfully',
			metadata: { newSemester }
		}).send(res);
	}
}

export default new SemesterController();