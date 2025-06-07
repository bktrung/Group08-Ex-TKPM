import { injectable, inject } from "inversify";
import { BadRequestError, NotFoundError } from '../responses/error.responses';
import { IDepartmentService } from "../interfaces/services/department.service.interface";
import { IDepartmentRepository } from "../interfaces/repositories/department.repository.interface";
import { IDepartment } from "../models/interfaces/department.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class DepartmentService implements IDepartmentService {
	constructor(
		@inject(TYPES.DepartmentRepository) private departmentRepository: IDepartmentRepository
	) {}

	async addDepartment(departmentName: string): Promise<IDepartment> {
		const existingDepartment = await this.departmentRepository.findDepartmentByName(departmentName);
		if (existingDepartment) {
			throw new BadRequestError('Department already exists');
		}

		return await this.departmentRepository.addDepartment(departmentName);
	}

	async updateDepartment(departmentId: string, departmentName: string): Promise<IDepartment> {
		const existingDepartment = await this.departmentRepository.findDepartmentByName(departmentName);
		if (existingDepartment) {
			throw new BadRequestError('Department already exists');
		}

		const department = await this.departmentRepository.updateDepartment(departmentId, departmentName);
		if (!department) {
			throw new NotFoundError('Department not found');
		}

		return department;
	}

	async getDepartments(): Promise<IDepartment[]> {
		return await this.departmentRepository.getDepartments();
	}
}