import { ISemester } from "../../models/interfaces/semester.interface";
import { CreateSemesterDto } from "../../dto/semester";

export interface ISemesterService {
	createSemester(semesterData: CreateSemesterDto): Promise<ISemester>;
} 