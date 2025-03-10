import { Request, Response, NextFunction } from 'express';
import StudentService from '../services/student.service';
import { CREATED, OK } from '../responses/success.responses';

import { BadRequestError } from '../responses/error.responses';

class StudentController {
	static async addStudent(req: Request, res: Response, next: NextFunction) {
		const studentData = req.body;
		const newStudent = await StudentService.addStudent(studentData);
		return new CREATED({
			message: 'Student added successfully',
			metadata: { newStudent }
		}).send(res);
	}

	static async updateStudent(req: Request, res: Response, next: NextFunction) {
		const studentData = req.body;
		const studentId = req.params.studentId;
		const updatedStudent = await StudentService.updateStudent(studentId, studentData);
		return new OK({
			message: 'Student updated successfully',
			metadata: { updatedStudent }
		}).send(res);
	}

	static async deleteStudent(req: Request, res: Response, next: NextFunction) {
		const studentId = req.params.studentId;
		const deletedStudent = await StudentService.deleteStudent(studentId);
		return new OK({
			message: 'Student deleted successfully',
			metadata: { deletedStudent }
		}).send(res);
	}

	static async searchStudents(req: Request, res: Response, next: NextFunction) {
		const { q, page = "1", limit = "10", sort = "ctime" } = req.query;

		if (!q || typeof q !== 'string') {
			throw new BadRequestError('Truy vấn tìm kiếm không hợp lệ');
		}

		const searchOptions = {
			query: q,
			page: parseInt(page as string, 10),
			limit: parseInt(limit as string, 10),
			sort: sort as string
		};

		const result = await StudentService.searchStudents(searchOptions);

		return new OK({
			message: 'Kết quả tìm kiếm',
			metadata: {
				...result,
				query: q
			}
		}).send(res);
	}
}

export default StudentController;