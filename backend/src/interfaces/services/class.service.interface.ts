import { CreateClassDto, UpdateClassDto } from "../../dto/class";
import { IClass } from "../../models/interfaces/class.interface";
import { PaginationResult } from "../../utils";

export interface IClassService {
	addClass(classData: CreateClassDto): Promise<IClass>;
	getClasses(query: {
		courseId?: string;
		academicYear?: string;
		semester?: string;
		page?: string;
		limit?: string;
	}): Promise<PaginationResult<IClass>>;
	getClassByCode(classCode: string): Promise<IClass>;
	updateClass(classCode: string, updateData: UpdateClassDto): Promise<IClass>;
	deleteClass(classCode: string): Promise<IClass>;
} 