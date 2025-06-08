import { IGrade } from "../../models/interfaces/grade.interface";
import { Types } from "mongoose";
import { updateGradeDto } from "../../dto/grade";

export interface IGradeRepository {
	findGradeByEnrollment(enrollment: string | Types.ObjectId): Promise<IGrade | null>;
	findGradeById(id: string): Promise<IGrade | null>;
	getGradesByClass(classId: string | Types.ObjectId): Promise<IGrade[]>;
	createGrade(gradeData: any): Promise<IGrade>;
	updateGrade(id: string, updateData: updateGradeDto): Promise<IGrade | null>;
	deleteGrade(id: string): Promise<IGrade | null>;
} 