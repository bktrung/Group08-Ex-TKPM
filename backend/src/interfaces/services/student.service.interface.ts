import { IStudent } from "../../models/interfaces/student.interface";
import { CreateStudentDto, UpdateStudentDto } from "../../dto/student";
import { PaginationResult, SearchOptions } from "../../utils";

export interface IStudentService {
	// Student operations
	addStudent(studentData: CreateStudentDto): Promise<IStudent>;
	updateStudent(studentId: string, studentData: UpdateStudentDto): Promise<IStudent>;
	deleteStudent(studentId: string): Promise<IStudent>;
	searchStudents(options: SearchOptions): Promise<PaginationResult<IStudent>>;
	getStudentById(studentId: string): Promise<IStudent>;
	getAllStudents(page: number, limit: number): Promise<PaginationResult<IStudent>>;
	getStudentByDepartment(departmentId: string, page: number, limit: number): Promise<PaginationResult<IStudent>>;

	// Student status operations
	addStudentStatus(statusType: string): Promise<any>;
	modifyStudentStatus(statusId: string, statusType: string): Promise<any>;
	getStudentStatus(): Promise<any>;
	deleteStudentStatus(statusId: string): Promise<any>;

	// Student status transition operations
	addStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any>;
	getStudentStatusTransition(): Promise<any>;
	deleteStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any>;
} 