import { ISemester } from "../../models/interfaces/semester.interface";
import { CreateSemesterDto, UpdateSemesterDto } from "../../dto/semester";
import { PaginationResult } from "../../utils";

export interface ISemesterService {
	createSemester(semesterData: CreateSemesterDto): Promise<ISemester>;
	updateSemester(id: string, updateData: UpdateSemesterDto): Promise<ISemester>;
	deleteSemester(id: string): Promise<ISemester>;
	getAllSemesters(query: {
		academicYear?: string;
		semester?: string;
		page?: string;
		limit?: string;
	}): Promise<PaginationResult<ISemester>>;
	getSemesterByDetails(academicYear: string, semester: number): Promise<ISemester>;
} 