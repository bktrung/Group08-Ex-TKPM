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
			throw new BadRequestError('Khoa đã tồn tại');
		}

		return await this.departmentRepository.addDepartment(departmentName);
	}

	async updateDepartment(departmentId: string, departmentName: string): Promise<IDepartment> {
		const existingDepartment = await this.departmentRepository.findDepartmentByName(departmentName);
		if (existingDepartment) {
			throw new BadRequestError('Khoa đã tồn tại');
		}

		const updatedDepartment = await this.departmentRepository.updateDepartment(departmentId, departmentName);
		if (!updatedDepartment) {
			throw new NotFoundError('Không tìm thấy khoa');
		}

		return updatedDepartment;
	}

	async getDepartments(): Promise<IDepartment[]> {
		return await this.departmentRepository.getDepartments();
	}
}