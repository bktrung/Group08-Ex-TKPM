import { IGrade } from "../../models/interfaces/grade.interface";
import { createGradeDto, updateGradeDto } from "../../dto/grade";

export interface IGradeService {
	createGrade(gradeData: createGradeDto): Promise<IGrade>;
	getGradesByClass(classCode: string): Promise<IGrade[]>;
	getGradeByStudentAndClass(studentId: string, classCode: string): Promise<IGrade>;
	updateGrade(id: string, updateData: updateGradeDto): Promise<IGrade>;
	deleteGrade(id: string): Promise<IGrade>;
} 