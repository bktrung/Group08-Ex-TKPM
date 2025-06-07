import { IDepartment } from "../../models/interfaces/department.interface";
import { Types } from "mongoose";

export interface IDepartmentRepository {
	findDepartmentById(id: string | Types.ObjectId): Promise<IDepartment | null>;
} 