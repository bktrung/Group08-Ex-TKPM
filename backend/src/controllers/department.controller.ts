import { Request, Response, NextFunction } from 'express';
import DepartmentService from '../services/department.service';
import { CREATED, OK } from '../responses/success.responses';

class DepartmentController {
	addDepartment = async (req: Request, res: Response, next: NextFunction) => {
		const departmentName = req.body.name;
		const newDepartment = await DepartmentService.addDepartment(departmentName);
		return new CREATED({
			message: 'Department added successfully',
			metadata: { newDepartment }
		}).send(res);
	}

	updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
		const departmentName = req.body.name;
		const departmentId = req.params.id;
		const updatedDepartment = await DepartmentService.updateDepartment(departmentId, departmentName);
		return new OK({
			message: 'Department updated successfully',
			metadata: { updatedDepartment }
		}).send(res);
	}

	getDepartments = async (req: Request, res: Response, next: NextFunction) => {
		const departments = await DepartmentService.getDepartments();
		return new OK({
			message: 'Departments retrieved successfully',
			metadata: { departments }
		}).send(res);
	}
}

export default new DepartmentController();