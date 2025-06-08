import { ISemester } from "../../models/interfaces/semester.interface";
import { CreateSemesterDto, UpdateSemesterDto } from "../../dto/semester";
import { PaginationResult } from "../../utils";

export interface ISemesterRepository {
	createSemester(semesterData: CreateSemesterDto): Promise<ISemester>;
	findSemester(academicYear: string, semester: number): Promise<ISemester | null>;
	findSemesterById(id: string): Promise<ISemester | null>;
	updateSemester(id: string, updateData: UpdateSemesterDto): Promise<ISemester | null>;
	deleteSemester(id: string): Promise<ISemester | null>;
	getAllSemesters(page: number, limit: number, filter: Record<string, any>): Promise<PaginationResult<ISemester>>;
} 