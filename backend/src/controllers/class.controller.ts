import { injectable, inject } from "inversify";
import { CREATED, OK } from "../responses/success.responses";
import { Request, Response, NextFunction } from "express";
import { IClassService } from "../interfaces/services/class.service.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class ClassController {
	constructor(
		@inject(TYPES.ClassService) private classService: IClassService
	) {}

	addClass = async (req: Request, res: Response, next: NextFunction) => {
		const classData = req.body;
		const newClass = await this.classService.addClass(classData);
		return new CREATED({
			message: "Added class successfully",
			metadata: { newClass },
		}).send(res);
	};

	getClasses = async (req: Request, res: Response, next: NextFunction) => {
		const { courseId, academicYear, semester, page, limit } = req.query;

		const classesData = await this.classService.getClasses({
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