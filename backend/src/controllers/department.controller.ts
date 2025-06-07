import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { IDepartmentService } from '../interfaces/services/department.service.interface';
import { CREATED, OK } from '../responses/success.responses';
import { TYPES } from '../configs/di.types';

@injectable()
export class DepartmentController {
	constructor(
		@inject(TYPES.DepartmentService) private departmentService: IDepartmentService
	) {}

	addDepartment = async (req: Request, res: Response, next: NextFunction) => {
		const departmentName = req.body.name;
		const newDepartment = await this.departmentService.addDepartment(departmentName);
		return new CREATED({
			message: 'Department added successfully',
			metadata: { newDepartment }
		}).send(res);
	}

	updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
		const departmentName = req.body.name;
		const departmentId = req.params.id;
		const updatedDepartment = await this.departmentService.updateDepartment(departmentId, departmentName);
		return new OK({
			message: 'Department updated successfully',
			metadata: { updatedDepartment }
		}).send(res);
	}

	getDepartments = async (req: Request, res: Response, next: NextFunction) => {
		const departments = await this.departmentService.getDepartments();
		return new OK({
			message: 'Departments retrieved successfully',
			metadata: { departments }
		}).send(res);
	}
}