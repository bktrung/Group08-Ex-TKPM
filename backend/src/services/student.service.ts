import { 
	addStudent, 
	findStudent, 
	updateStudent, 
	deleteStudent, 
	searchStudents, 
	getAllStudents
} from '../models/repositories/student.repo';
import { IStudent, StudentStatus, Department } from '../models/student.model';
import { BadRequestError, NotFoundError } from '../responses/error.responses';
import { CreateStudentDto } from '../dto/student';
import { PaginationResult } from '../utils';
import { SearchOptions } from '../utils/index';

class StudentService {
	static async addStudent(studentData: CreateStudentDto): Promise<IStudent> {
		// Check if student with same ID or email or phoneNumber already exists
		const existingStudent = await findStudent({
			$or: [
				{ studentId: studentData.studentId },
				{ email: studentData.email },
				{ phoneNumber: studentData.phoneNumber }
			]
		})

		if (existingStudent) {
			if (existingStudent.studentId === studentData.studentId) {
				throw new BadRequestError('Mã số sinh viên đã tồn tại');
			}
			if (existingStudent.email === studentData.email) {
				throw new BadRequestError('Email đã được sử dụng bởi sinh viên khác');
			}
			if (existingStudent.phoneNumber === studentData.phoneNumber) {
				throw new BadRequestError('Số điện thoại đã được sử dụng bởi sinh viên khác');
			}
		}

		// add new student
		const newStudent = await addStudent(studentData);
		return newStudent;
	}

	static async updateStudent(studentId: string, studentData: CreateStudentDto): Promise<IStudent> {
		// Check if student with same phoneNumber or email already exists
		const existingEmailStudent = await findStudent({ email: studentData.email });
		if (existingEmailStudent && existingEmailStudent.studentId !== studentId) {
			throw new BadRequestError('Email đã được sử dụng bởi sinh viên khác');
		}

		const existingPhoneStudent = await findStudent({ phoneNumber: studentData.phoneNumber });
		if (existingPhoneStudent && existingPhoneStudent.studentId !== studentId) {
			throw new BadRequestError('Số điện thoại đã được sử dụng bởi sinh viên khác');
		}

		const updatedStudent = await updateStudent(studentId, studentData);
		if (!updatedStudent) {
			throw new NotFoundError('Không tìm thấy sinh viên');
		}

		return updatedStudent;
	}

	static async deleteStudent(studentId: string): Promise<IStudent> {
		const deletedStudent = await deleteStudent(studentId);
		if (!deletedStudent) {
			throw new NotFoundError('Không tìm thấy sinh viên');
		}

		return deletedStudent;
	}

	static async searchStudents(options: SearchOptions): Promise<PaginationResult<IStudent>> {
		// Validate query
		if (!options.query || options.query.trim() === '') {
			throw new BadRequestError('Truy vấn tìm kiếm không được để trống');
		}

		// Normalize options
		const searchOptions: SearchOptions = {
			query: options.query.trim(),
			page: options.page || 1,
			limit: options.limit || 10,
			sort: options.sort || "ctime"
		};

		return await searchStudents(searchOptions);
	}

	static async getStudentStatusEnum(): Promise<string[]> {
		return Object.values(StudentStatus);
	}

	static async getDepartmentEnum(): Promise<string[]> {
		return Object.values(Department);
	}

	static async getStudentById(studentId: string): Promise<IStudent> {
		const student = await findStudent({ studentId });
		if (!student) {
			throw new NotFoundError('Không tìm thấy sinh viên');
		}

		return student;
	}

	static async getAllStudents(page: number, limit: number): Promise<PaginationResult<IStudent>> {
		return await getAllStudents(page, limit);
	}
}

export default StudentService;