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
			throw new BadRequestError('Chương trình đào tạo đã tồn tại');
		}

		return await this.programRepository.addProgram(programName);
	}

	async updateProgram(programId: string, programName: string): Promise<IProgram> {
		const existingProgram = await this.programRepository.findProgramByName(programName);
		if (existingProgram) {
			throw new BadRequestError('Chương trình đào tạo đã tồn tại');
		}

		const updatedProgram = await this.programRepository.updateProgram(programId, programName);
		if (!updatedProgram) {
			throw new NotFoundError('Không tìm thấy chương trình đào tạo');
		}

		return updatedProgram;
	}

	async getPrograms(): Promise<IProgram[]> {
		return await this.programRepository.getPrograms();
	}
}