import { ISemester } from "../../models/interfaces/semester.interface";
import { CreateSemesterDto } from "../../dto/semester";

export interface ISemesterRepository {
	createSemester(semesterData: CreateSemesterDto): Promise<ISemester>;
	findSemester(academicYear: string, semester: number): Promise<ISemester | null>;
} 