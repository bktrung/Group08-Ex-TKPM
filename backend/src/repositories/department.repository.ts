import { injectable } from "inversify";
import Department from "../models/department.model";
import { IDepartment } from "../models/interfaces/department.interface";
import { Types } from "mongoose";
import { IDepartmentRepository } from "../interfaces/repositories/department.repository.interface";

@injectable()
export class DepartmentRepository implements IDepartmentRepository {
	async findDepartmentById(id: string | Types.ObjectId): Promise<IDepartment | null> {
		return await Department.findById(id).lean();
	}
} 