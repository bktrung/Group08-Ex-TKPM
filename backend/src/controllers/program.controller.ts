import { Request, Response, NextFunction } from 'express';
import ProgramService from "../services/program.service";
import { CREATED, OK } from "../responses/success.responses";

class ProgramController {
	static async addProgram(req: Request, res: Response, next: NextFunction) {
		const programName = req.body.name;
		const newProgram = await ProgramService.addProgram(programName);
		return new CREATED({
			message: 'Program added successfully',
			metadata: { newProgram }
		}).send(res);
	}

	static async updateProgram(req: Request, res: Response, next: NextFunction) {
		const programName = req.body.name;
		const programId = req.params.id;
		const updatedProgram = await ProgramService.updateProgram(programId, programName);
		return new OK({
			message: 'Program updated successfully',
			metadata: { updatedProgram }
		}).send(res);
	}

	static async getPrograms(req: Request, res: Response, next: NextFunction) {
		const programs = await ProgramService.getPrograms();
		return new OK({
			message: 'Programs retrieved successfully',
			metadata: { programs }
		}).send(res);
	}
}

export default ProgramController;