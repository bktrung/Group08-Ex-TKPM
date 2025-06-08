import { ISemester } from "../../models/interfaces/semester.interface";
import { CreateSemesterDto, UpdateSemesterDto } from "../../dto/semester";

export interface ISemesterRepository {
	createSemester(semesterData: CreateSemesterDto): Promise<ISemester>;
	findSemester(academicYear: string, semester: number): Promise<ISemester | null>;
	findSemesterById(id: string): Promise<ISemester | null>;
	updateSemester(id: string, updateData: UpdateSemesterDto): Promise<ISemester | null>;
} 