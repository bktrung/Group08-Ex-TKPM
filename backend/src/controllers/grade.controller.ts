import { Request, Response, NextFunction } from 'express';
import GradeService from '../services/grade.service';
import { CREATED, OK } from "../responses/success.responses";

class GradeController {
	createGrade = async (req: Request, res: Response, next: NextFunction) => {
		const gradeData = req.body;
		const newGrade = await GradeService.createGrade(gradeData);
		return new CREATED({
			message: 'Grade created successfully',
			metadata: { newGrade }
		}).send(res);
	}
}

export default new GradeController();