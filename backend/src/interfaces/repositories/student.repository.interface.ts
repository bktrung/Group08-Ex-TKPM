import { IStudent } from "../../models/interfaces/student.interface";
import { CreateStudentDto, UpdateStudentDto } from "../../dto/student";
import { PaginationResult, SearchOptions } from "../../utils";
import { Types } from "mongoose";

export interface IStudentRepository {
	// Student operations
	findStudent(query: any): Promise<IStudent | null>;
	addStudent(studentData: CreateStudentDto): Promise<IStudent>;
	updateStudent(studentId: string, studentData: UpdateStudentDto): Promise<IStudent | null>;
	deleteStudent(studentId: string): Promise<IStudent | null>;
	searchStudents(options: SearchOptions): Promise<PaginationResult<IStudent>>;
	getAllStudents(page?: number, limit?: number, filter?: Object): Promise<PaginationResult<IStudent>>;
	getStudentInfo(studentId: string): Promise<any>;

	// Student status operations
	findStudentStatus(statusType: string): Promise<any>;
	findStudentStatusById(statusId: string | Types.ObjectId): Promise<any>;
	addStudentStatus(statusType: string): Promise<any>;
	updateStudentStatus(statusId: string, statusType: string): Promise<any>;
	getStudentStatus(): Promise<any>;

	// Student status transition operations
	addStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any>;
	findStudentStatusTransition(fromStatus: string | Types.ObjectId, toStatus: string | Types.ObjectId): Promise<any>;
	getTransitionRules(): Promise<any[]>;
	deleteStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any>;
} 