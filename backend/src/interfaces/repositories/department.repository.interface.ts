import { IDepartment } from "../../models/interfaces/department.interface";
import { Types } from "mongoose";

export interface IDepartmentRepository {
	findDepartmentById(id: string | Types.ObjectId): Promise<IDepartment | null>;
	findDepartmentByName(name: string): Promise<IDepartment | null>;
	addDepartment(name: string): Promise<IDepartment>;
	updateDepartment(id: string, name: string): Promise<IDepartment | null>;
	getDepartments(): Promise<IDepartment[]>;
} 