import { injectable } from "inversify";
import { IGrade } from "../models/interfaces/grade.interface";
import { Types } from "mongoose";
import { IGradeRepository } from "../interfaces/repositories/grade.repository.interface";
import * as GradeRepo from "../models/repositories/grade.repo";

@injectable()
export class GradeRepository implements IGradeRepository {
	async findGradeByEnrollment(enrollment: string | Types.ObjectId): Promise<IGrade | null> {
		return await GradeRepo.findGradeByEnrollment(enrollment);
	}

	async createGrade(gradeData: any): Promise<IGrade> {
		return await GradeRepo.createGrade(gradeData);
	}
} 