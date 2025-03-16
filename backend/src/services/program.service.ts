import { findProgramByName, updateProgram, getPrograms, addProgram } from "../models/repositories/program.repo";
import { BadRequestError, NotFoundError } from "../responses/error.responses";

class ProgramService {
	static async addProgram(programName: string): Promise<any> {
		const existingProgram = await findProgramByName(programName);
		if (existingProgram) {
			throw new BadRequestError('Chương trình đào tạo đã tồn tại');
		}

		return await addProgram(programName);
	}

	static async updateProgram(programId: string, programName: string): Promise<any> {
		const existingProgram = await findProgramByName(programName);
		if (existingProgram) {
			throw new BadRequestError('Chương trình đào tạo đã tồn tại');
		}

		const updatedProgram = await updateProgram(programId, programName);
		if (!updatedProgram) {
			throw new NotFoundError('Không tìm thấy chương trình đào tạo');
		}

		return updatedProgram;
	}

	static async getPrograms(): Promise<any> {
		return await getPrograms();
	}
}

export default ProgramService;