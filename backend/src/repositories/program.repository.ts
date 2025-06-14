import { injectable } from "inversify";
import { IProgramRepository } from "../interfaces/repositories/program.repository.interface";
import Program from "../models/program.model";
import Student from "../models/student.model";
import { IProgram } from "../models/interfaces/program.interface";
import { Types } from "mongoose";

@injectable()
export class ProgramRepository implements IProgramRepository {
	async findProgramById(id: string | Types.ObjectId): Promise<IProgram | null> {
		return await Program.findById(id).lean();
	}

	async findProgramByName(name: string): Promise<IProgram | null> {
		return await Program.findOne({ name }).lean();
	}

	async addProgram(name: string): Promise<IProgram> {
		return await Program.create({ name });
	}

	async updateProgram(id: string, name: string): Promise<IProgram | null> {
		return await Program.findOneAndUpdate(
			{ _id: id },
			{ name },
			{ new: true }
		).lean();
	}

	async getPrograms(): Promise<IProgram[]> {
		return await Program.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
	}

	async deleteProgram(id: string): Promise<IProgram | null> {
		return await Program.findByIdAndDelete(id).lean();
	}

	async countStudentsByProgram(programId: string): Promise<number> {
		return await Student.countDocuments({ program: programId });
	}
} 