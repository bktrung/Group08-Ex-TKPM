import { injectable } from "inversify";
import { IDepartmentRepository } from "../interfaces/repositories/department.repository.interface";
import Department from "../models/department.model";
import Student from "../models/student.model";
import Course from "../models/course.model";
import { IDepartment } from "../models/interfaces/department.interface";
import { Types } from "mongoose";

@injectable()
export class DepartmentRepository implements IDepartmentRepository {
	async findDepartmentById(id: string | Types.ObjectId): Promise<IDepartment | null> {
		return await Department.findById(id).lean();
	}

	async findDepartmentByName(name: string): Promise<IDepartment | null> {
		return await Department.findOne({ name }).lean();
	}

	async addDepartment(name: string): Promise<IDepartment> {
		return await Department.create({ name });
	}

	async updateDepartment(id: string, name: string): Promise<IDepartment | null> {
		return await Department.findOneAndUpdate(
			{ _id: id },
			{ name },
			{ new: true }
		).lean();
	}

	async getDepartments(): Promise<IDepartment[]> {
		return await Department.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
	}

	async deleteDepartment(id: string): Promise<IDepartment | null> {
		return await Department.findByIdAndDelete(id).lean();
	}

	async countStudentsByDepartment(departmentId: string): Promise<number> {
		return await Student.countDocuments({ department: departmentId });
	}

	async countCoursesByDepartment(departmentId: string): Promise<number> {
		return await Course.countDocuments({ department: departmentId });
	}
} 