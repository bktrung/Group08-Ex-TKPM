import { IGrade } from "../../models/interfaces/grade.interface";
import { createGradeDto } from "../../dto/grade";

export interface IGradeService {
	createGrade(gradeData: createGradeDto): Promise<IGrade>;
} 