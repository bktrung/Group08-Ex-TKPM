import ClassService from "../services/class.service";
import { CREATED, OK } from "../responses/success.responses";
import { Request, Response, NextFunction } from "express";

class classController {
	addClass = async (req: Request, res: Response, next: NextFunction) => {
		const classData = req.body;
		const newClass = await ClassService.addClass(classData);
		return new CREATED({
			message: "Added class successfully",
			metadata: { newClass },
		}).send(res);
	};

	getClasses = async (req: Request, res: Response, next: NextFunction) => {
		const { courseId, academicYear, semester, page, limit } = req.query;

		const classesData = await ClassService.getClasses({
			courseId: courseId as string,
			academicYear: academicYear as string,
			semester: semester as string,
			page: page as string,
			limit: limit as string
		});

		return new OK({
			message: "Retrieved classes successfully",
			metadata: classesData,
		}).send(res);
	};
}

export default new classController();