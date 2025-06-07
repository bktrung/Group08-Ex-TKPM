import { IGrade } from "../../models/interfaces/grade.interface";
import { Types } from "mongoose";

export interface IGradeRepository {
	findGradeByEnrollment(enrollment: string | Types.ObjectId): Promise<IGrade | null>;
	createGrade(gradeData: any): Promise<IGrade>;
} 