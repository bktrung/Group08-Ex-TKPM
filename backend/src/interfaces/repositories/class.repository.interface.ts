import { CreateClassDto } from "../../dto/class";
import { IClass } from "../../models/interfaces/class.interface";
import { Types } from "mongoose";
import { PaginationResult } from "../../utils";

export interface IClassRepository {
	createClass(classData: CreateClassDto): Promise<IClass>;
	findClassByCode(classCode: string): Promise<IClass | null>;
	findClassByCourse(courseId: string | Types.ObjectId): Promise<IClass[]>;
	findClassesWithOverlappingSchedule(schedule: any[]): Promise<IClass[]>;
	getAllClasses(page: number, limit: number, filter: Record<string, any>): Promise<PaginationResult<IClass>>;
} 