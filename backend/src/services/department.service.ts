import { BadRequestError, NotFoundError } from '../responses/error.responses';
import { addDepartment, findDepartmentByName, updateDepartment, getDepartments } from '../models/repositories/department.repo';

class DepartmentService {
	static async addDepartment(departmentName: string): Promise<any> {
		const existingDepartment = await findDepartmentByName(departmentName);
		if (existingDepartment) {
			throw new BadRequestError('Khoa đã tồn tại');
		}

		return await addDepartment(departmentName);
	}

	static async updateDepartment(departmentId: string, departmentName: string): Promise<any> {
		const existingDepartment = await findDepartmentByName(departmentName);
		if (existingDepartment) {
			throw new BadRequestError('Khoa đã tồn tại');
		}

		const updatedDepartment = await updateDepartment(departmentId, departmentName);
		if (!updatedDepartment) {
			throw new NotFoundError('Không tìm thấy khoa');
		}

		return updatedDepartment;
	}

	static async getDepartments(): Promise<any> {
		return await getDepartments();
	}
}

export default DepartmentService;