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
}

export default new classController();