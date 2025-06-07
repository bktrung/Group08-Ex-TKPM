import { injectable, inject } from "inversify";
import { IStudent } from '../models/interfaces/student.interface';
import { BadRequestError, NotFoundError } from '../responses/error.responses';
import { CreateStudentDto, UpdateStudentDto } from '../dto/student';
import { PaginationResult } from '../utils';
import { SearchOptions } from '../utils/index';
import { IStudentService } from "../interfaces/services/student.service.interface";
import { IStudentRepository } from "../interfaces/repositories/student.repository.interface";
import { IDepartmentRepository } from "../interfaces/repositories/department.repository.interface";
import { IProgramRepository } from "../interfaces/repositories/program.repository.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class StudentService implements IStudentService {
	constructor(
		@inject(TYPES.StudentRepository) private studentRepository: IStudentRepository,
		@inject(TYPES.DepartmentRepository) private departmentRepository: IDepartmentRepository,
		@inject(TYPES.ProgramRepository) private programRepository: IProgramRepository
	) {}

	async addStudent(studentData: CreateStudentDto): Promise<IStudent> {
		// Check if student with same ID or email or phoneNumber already exists
		const existingStudent = await this.studentRepository.findStudent({
			$or: [
				{ studentId: studentData.studentId },
				{ email: studentData.email },
				{ phoneNumber: studentData.phoneNumber },
				{ 'identityDocument.number': studentData.identityDocument.number }
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
			if (existingStudent.identityDocument.number === studentData.identityDocument.number) {
				throw new BadRequestError('Số CMND/CCCD/Passport đã được sử dụng bởi sinh viên khác');
			}
		}

		const status = await this.studentRepository.findStudentStatusById(studentData.status);
		if (!status) {
			throw new BadRequestError('Trạng thái sinh viên không tồn tại');
		}

		const department = await this.departmentRepository.findDepartmentById(studentData.department);
		if (!department) {
			throw new BadRequestError('Khoa không tồn tại');
		}

		const program = await this.programRepository.findProgramById(studentData.program);
		if (!program) {
			throw new BadRequestError('Chương trình học không tồn tại');
		}

		// add new student
		const newStudent = await this.studentRepository.addStudent(studentData);
		return newStudent;
	}

	async updateStudent(studentId: string, studentData: UpdateStudentDto): Promise<IStudent> {
		const existingStudent = await this.studentRepository.findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError('Không tìm thấy sinh viên');
		}

		// Validate status transition rule
		if (studentData.status && existingStudent.status.toString() !== studentData.status.toString()) {
			const fromStatus = existingStudent.status;
			const toStatus = studentData.status;
			const transition = await this.studentRepository.findStudentStatusTransition(fromStatus, toStatus);
			if (!transition) {
				throw new BadRequestError('Không thể chuyển từ trạng thái hiện tại sang trạng thái mong muốn');
			}
		}

		// Check email uniqueness
		if (studentData.email) {
			const existingEmailStudent = await this.studentRepository.findStudent({ email: studentData.email });
			if (existingEmailStudent && existingEmailStudent.studentId !== studentId) {
				throw new BadRequestError('Email đã được sử dụng bởi sinh viên khác');
			}
		}

		// Check phone number uniqueness
		if (studentData.phoneNumber) {
			const existingPhoneStudent = await this.studentRepository.findStudent({ phoneNumber: studentData.phoneNumber });
			if (existingPhoneStudent && existingPhoneStudent.studentId !== studentId) {
				throw new BadRequestError('Số điện thoại đã được sử dụng bởi sinh viên khác');
			}
		}

		// Check identity document uniqueness
		if (studentData.identityDocument?.number) {
			const existingIdentityDocumentStudent = await this.studentRepository.findStudent({
				'identityDocument.number': studentData.identityDocument.number
			});
			if (existingIdentityDocumentStudent && existingIdentityDocumentStudent.studentId !== studentId) {
				throw new BadRequestError('Số CMND/CCCD/Passport đã được sử dụng bởi sinh viên khác');
			}
		}

		// Validate status reference
		if (studentData.status) {
			const status = await this.studentRepository.findStudentStatusById(studentData.status);
			if (!status) {
				throw new BadRequestError('Trạng thái sinh viên không tồn tại');
			}
		}

		// Validate department reference
		if (studentData.department) {
			const department = await this.departmentRepository.findDepartmentById(studentData.department);
			if (!department) {
				throw new BadRequestError('Khoa không tồn tại');
			}
		}

		// Validate program reference
		if (studentData.program) {
			const program = await this.programRepository.findProgramById(studentData.program);
			if (!program) {
				throw new BadRequestError('Chương trình học không tồn tại');
			}
		}

		// 4. Perform the update after all validations pass
		const updatedStudent = await this.studentRepository.updateStudent(studentId, studentData);
		if (!updatedStudent) {
			throw new NotFoundError('Không tìm thấy sinh viên');
		}

		return updatedStudent;
	}

	async deleteStudent(studentId: string): Promise<IStudent> {
		const deletedStudent = await this.studentRepository.deleteStudent(studentId);
		if (!deletedStudent) {
			throw new NotFoundError('Không tìm thấy sinh viên');
		}

		return deletedStudent;
	}

	async searchStudents(options: SearchOptions): Promise<PaginationResult<IStudent>> {
		// Validate query
		if (!options.query || options.query.trim() === '') {
			throw new BadRequestError('Truy vấn tìm kiếm không được để trống');
		}

		// Normalize options
		const searchOptions: SearchOptions = {
			filter: options.filter || {},
			query: options.query.trim(),
			page: options.page || 1,
			limit: options.limit || 10,
			sort: options.sort || "ctime"
		};

		return await this.studentRepository.searchStudents(searchOptions);
	}

	async getStudentById(studentId: string): Promise<IStudent> {
		const student = await this.studentRepository.findStudent({ studentId });
		if (!student) {
			throw new NotFoundError('Không tìm thấy sinh viên');
		}

		return student;
	}

	async getAllStudents(page: number, limit: number): Promise<PaginationResult<IStudent>> {
		return await this.studentRepository.getAllStudents(page, limit);
	}

	async addStudentStatus(statusType: string): Promise<any> {
		const existingStatus = await this.studentRepository.findStudentStatus(statusType);
		if (existingStatus) {
			throw new BadRequestError('Trạng thái sinh viên đã tồn tại');
		}

		return await this.studentRepository.addStudentStatus(statusType);
	}

	async modifyStudentStatus(statusId: string, statusType: string): Promise<any> {
		const existingStatus = await this.studentRepository.findStudentStatus(statusType);
		if (existingStatus) {
			throw new BadRequestError('Trạng thái sinh viên đã tồn tại');
		}

		const updatedStatus = await this.studentRepository.updateStudentStatus(statusId, statusType);
		if (!updatedStatus) {
			throw new NotFoundError('Không tìm thấy trạng thái sinh viên');
		}

		return updatedStatus;
	}

	async getStudentStatus(): Promise<any> {
		return this.studentRepository.getStudentStatus();
	}

	async getStudentByDepartment(departmentId: string, page: number, limit: number): Promise<PaginationResult<IStudent>> {
		return await this.studentRepository.getAllStudents(page, limit, { department: departmentId });
	}

	async addStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any> {
		const from = await this.studentRepository.findStudentStatusById(fromStatus);
		if (!from) {
			throw new BadRequestError('Trạng thái gốc không tồn tại');
		}

		const to = await this.studentRepository.findStudentStatusById(toStatus);
		if (!to) {
			throw new BadRequestError('Trạng thái đích không tồn tại');
		}

		if (from._id === to._id) {
			throw new BadRequestError('Trạng thái gốc và trạng thái đích không thể giống nhau');
		}

		const existingTransition = await this.studentRepository.findStudentStatusTransition(fromStatus, toStatus);
		if (existingTransition) {
			throw new BadRequestError('Quy tắc đã tồn tại');
		}

		return await this.studentRepository.addStudentStatusTransition(fromStatus, toStatus);
	}

	async getStudentStatusTransition(): Promise<any> {
		return await this.studentRepository.getTransitionRules();
	}

	async deleteStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any> {
		const transition = await this.studentRepository.deleteStudentStatusTransition(fromStatus, toStatus);
		if (!transition) {
			throw new NotFoundError('Không tìm thấy quy tắc chuyển trạng thái sinh viên');
		}
		return transition;
	}
}