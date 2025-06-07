import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from 'express';
import { IStudentService } from '../interfaces/services/student.service.interface';
import { CREATED, OK } from '../responses/success.responses';
import { BadRequestError } from '../responses/error.responses';
import { TYPES } from '../configs/di.types';

@injectable()
export class StudentController {
	constructor(
		@inject(TYPES.StudentService) private studentService: IStudentService
	) {}

	addStudent = async (req: Request, res: Response, next: NextFunction) => {
		const studentData = req.body;
		const newStudent = await this.studentService.addStudent(studentData);
		return new CREATED({
			message: 'Student added successfully',
			metadata: { newStudent }
		}).send(res);
	}

	updateStudent = async (req: Request, res: Response, next: NextFunction) => {
		const studentData = req.body;
		const studentId = req.params.studentId;
		const updatedStudent = await this.studentService.updateStudent(studentId, studentData);
		return new OK({
			message: 'Student updated successfully',
			metadata: { updatedStudent }
		}).send(res);
	}

	deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
		const studentId = req.params.studentId;
		const deletedStudent = await this.studentService.deleteStudent(studentId);
		return new OK({
			message: 'Student deleted successfully',
			metadata: { deletedStudent }
		}).send(res);
	}

	searchStudents = async (req: Request, res: Response, next: NextFunction) => {
		const { q, page = "1", limit = "10", sort = "ctime", departmentId } = req.query;

		if (!q || typeof q !== 'string') {
			throw new BadRequestError('Search query is required');
		}

		const searchOptions = {
			department: departmentId ? {deparment: departmentId} : {},
			query: q,
			page: parseInt(page as string, 10),
			limit: parseInt(limit as string, 10),
			sort: sort as string
		};

		const result = await this.studentService.searchStudents(searchOptions);

		return new OK({
			message: 'Search results',
			metadata: {
				...result,
				query: q
			}
		}).send(res);
	}
	
	getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
		const { page = "1", limit = "10" } = req.query;
		const result = await this.studentService.getAllStudents(parseInt(page as string, 10), parseInt(limit as string, 10));
		return new OK({
			message: 'All students',
			metadata: result
		}).send(res);
	}

	getStudentStatusType = async (req: Request, res: Response, next: NextFunction) => {
		const statusType = await this.studentService.getStudentStatus();
		return new OK({
			message: 'Student status types',
			metadata: statusType
		}).send(res);
	}

	addStudentStatusType = async (req: Request, res: Response, next: NextFunction) => {
		const statusType = req.body.type;
		const newStatusType = await this.studentService.addStudentStatus(statusType);
		return new CREATED({
			message: 'Student status type added',
			metadata: newStatusType
		}).send(res);
	}

	modifyStudentStatusType = async (req: Request, res: Response, next: NextFunction) => {
		const statusType = req.body.type;
		const statusId = req.params.statusId;
		const updatedStatusType = await this.studentService.modifyStudentStatus(statusId, statusType);
		return new OK({
			message: 'Student status type updated',
			metadata: updatedStatusType
		}).send(res);
	}

	getStudentByDepartment = async (req: Request, res: Response, next: NextFunction) => {
		const { departmentId } = req.params;
		const { page = "1", limit = "10" } = req.query;
		const result = await this.studentService.getStudentByDepartment(departmentId, parseInt(page as string, 10), parseInt(limit as string, 10));
		return new OK({
			message: 'Students by department',
			metadata: result
		}).send(res);
	}

	addStudentStatusTransition = async (req: Request, res: Response, next: NextFunction) => {
		const { fromStatus, toStatus } = req.body;
		const newTransition = await this.studentService.addStudentStatusTransition(fromStatus, toStatus);
		return new CREATED({
			message: 'Student status transition added',
			metadata: newTransition
		}).send(res);
	}

	getStudentStatusTransition = async (req: Request, res: Response, next: NextFunction) => {
		return new OK({
			message: 'Student status transitions',
			metadata: await this.studentService.getStudentStatusTransition()
		}).send(res);
	}

	deleteStudentStatusTransition = async (req: Request, res: Response, next: NextFunction) => {
		const { fromStatus, toStatus } = req.body;
		const deletedTransition = await this.studentService.deleteStudentStatusTransition(fromStatus, toStatus);
		return new OK({
			message: 'Student status transition deleted',
			metadata: deletedTransition
		}).send(res);
	}
}