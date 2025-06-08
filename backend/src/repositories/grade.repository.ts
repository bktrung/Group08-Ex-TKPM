import { injectable } from "inversify";
import { IGrade } from "../models/interfaces/grade.interface";
import { Types } from "mongoose";
import { IGradeRepository } from "../interfaces/repositories/grade.repository.interface";
import { updateGradeDto } from "../dto/grade";
import * as GradeRepo from "../models/repositories/grade.repo";

@injectable()
export class GradeRepository implements IGradeRepository {
	async findGradeByEnrollment(enrollment: string | Types.ObjectId): Promise<IGrade | null> {
		return await GradeRepo.findGradeByEnrollment(enrollment);
	}

	async findGradeById(id: string): Promise<IGrade | null> {
		return await GradeRepo.findGradeById(id);
	}

	async getGradesByClass(classId: string | Types.ObjectId): Promise<IGrade[]> {
		return await GradeRepo.getGradesByClass(classId);
	}

	async createGrade(gradeData: any): Promise<IGrade> {
		return await GradeRepo.createGrade(gradeData);
	}

	async updateGrade(id: string, updateData: updateGradeDto): Promise<IGrade | null> {
		return await GradeRepo.updateGrade(id, updateData);
	}

	async deleteGrade(id: string): Promise<IGrade | null> {
		return await GradeRepo.deleteGrade(id);
	}
} 