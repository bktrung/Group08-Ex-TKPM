import { ISemester } from "../../models/interfaces/semester.interface";
import { CreateSemesterDto, UpdateSemesterDto } from "../../dto/semester";

export interface ISemesterService {
	createSemester(semesterData: CreateSemesterDto): Promise<ISemester>;
	updateSemester(id: string, updateData: UpdateSemesterDto): Promise<ISemester>;
} 