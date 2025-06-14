import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { IProgramService } from '../interfaces/services/program.service.interface';
import { CREATED, OK } from "../responses/success.responses";
import { TYPES } from '../configs/di.types';

@injectable()
export class ProgramController {
	constructor(
		@inject(TYPES.ProgramService) private programService: IProgramService
	) {}

	addProgram = async (req: Request, res: Response, next: NextFunction) => {
		const programName = req.body.name;
		const newProgram = await this.programService.addProgram(programName);
		return new CREATED({
			message: 'Program added successfully',
			metadata: { newProgram }
		}).send(res);
	}

	updateProgram = async (req: Request, res: Response, next: NextFunction) => {
		const programName = req.body.name;
		const programId = req.params.id;
		const updatedProgram = await this.programService.updateProgram(programId, programName);
		return new OK({
			message: 'Program updated successfully',
			metadata: { updatedProgram }
		}).send(res);
	}

	getPrograms = async (req: Request, res: Response, next: NextFunction) => {
		const programs = await this.programService.getPrograms();
		return new OK({
			message: 'Programs retrieved successfully',
			metadata: { programs }
		}).send(res);
	}

	deleteProgram = async (req: Request, res: Response, next: NextFunction) => {
		const programId = req.params.id;
		const deletedProgram = await this.programService.deleteProgram(programId);
		return new OK({
			message: 'Program deleted successfully',
			metadata: { deletedProgram }
		}).send(res);
	}
}