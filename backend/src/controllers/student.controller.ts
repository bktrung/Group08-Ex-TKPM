import { Request, Response, NextFunction } from 'express';
import StudentService from '../services/student.service';
import { CREATED, OK } from '../responses/success.responses';
import { BadRequestError } from '../responses/error.responses';

class StudentController {
	addStudent = async (req: Request, res: Response, next: NextFunction) => {
		const studentData = req.body;
		const newStudent = await StudentService.addStudent(studentData);
		return new CREATED({
			message: 'Student added successfully',
			metadata: { newStudent }
		}).send(res);
	}

	updateStudent = async (req: Request, res: Response, next: NextFunction) => {
		const studentData = req.body;
		const studentId = req.params.studentId;
		const updatedStudent = await StudentService.updateStudent(studentId, studentData);
		return new OK({
			message: 'Student updated successfully',
			metadata: { updatedStudent }
		}).send(res);
	}

	deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
		const studentId = req.params.studentId;
		const deletedStudent = await StudentService.deleteStudent(studentId);
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

		const result = await StudentService.searchStudents(searchOptions);

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
		const result = await StudentService.getAllStudents(parseInt(page as string, 10), parseInt(limit as string, 10));
		return new OK({
			message: 'All students',
			metadata: result
		}).send(res);
	}

	getStudentStatusType = async (req: Request, res: Response, next: NextFunction) => {
		const statusType = await StudentService.getStudentStatus();
		return new OK({
			message: 'Student status types',
			metadata: statusType
		}).send(res);
	}

	addStudentStatusType = async (req: Request, res: Response, next: NextFunction) => {
		const statusType = req.body.type;
		const newStatusType = await StudentService.addStudentStatus(statusType);
		return new CREATED({
			message: 'Student status type added',
			metadata: newStatusType
		}).send(res);
	}

	modifyStudentStatusType = async (req: Request, res: Response, next: NextFunction) => {
		const statusType = req.body.type;
		const statusId = req.params.statusId;
		const updatedStatusType = await StudentService.modifyStudentStatus(statusId, statusType);
		return new OK({
			message: 'Student status type updated',
			metadata: updatedStatusType
		}).send(res);
	}

	getStudentByDepartment = async (req: Request, res: Response, next: NextFunction) => {
		const { departmentId } = req.params;
		const { page = "1", limit = "10" } = req.query;
		const result = await StudentService.getStudentByDepartment(departmentId, parseInt(page as string, 10), parseInt(limit as string, 10));
		return new OK({
			message: 'Students by department',
			metadata: result
		}).send(res);
	}
}

export default new StudentController();