import { injectable, inject } from "inversify";
import { BadRequestError, NotFoundError } from "../responses/error.responses";
import { IProgramService } from "../interfaces/services/program.service.interface";
import { IProgramRepository } from "../interfaces/repositories/program.repository.interface";
import { IProgram } from "../models/interfaces/program.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class ProgramService implements IProgramService {
	constructor(
		@inject(TYPES.ProgramRepository) private programRepository: IProgramRepository
	) {}

	async addProgram(programName: string): Promise<IProgram> {
		const existingProgram = await this.programRepository.findProgramByName(programName);
		if (existingProgram) {
			throw new BadRequestError('Training program already exists');
		}

		return await this.programRepository.addProgram(programName);
	}

	async updateProgram(programId: string, programName: string): Promise<IProgram> {
		const existingProgram = await this.programRepository.findProgramByName(programName);
		if (existingProgram) {
			throw new BadRequestError('Training program already exists');
		}

		const updatedProgram = await this.programRepository.updateProgram(programId, programName);
		if (!updatedProgram) {
			throw new NotFoundError('Training program not found');
		}

		return updatedProgram;
	}

	async getPrograms(): Promise<IProgram[]> {
		return await this.programRepository.getPrograms();
	}
}