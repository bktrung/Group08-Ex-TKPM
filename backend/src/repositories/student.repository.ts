import { injectable } from "inversify";
import { IStudentRepository } from "../interfaces/repositories/student.repository.interface";
import { IStudent } from "../models/interfaces/student.interface";
import { CreateStudentDto, UpdateStudentDto } from "../dto/student";
import { PaginationResult, SearchOptions } from "../utils";
import { Types } from "mongoose";
import * as StudentRepo from "../models/repositories/student.repo";

@injectable()
export class StudentRepository implements IStudentRepository {
	// Student operations
	async findStudent(query: any): Promise<IStudent | null> {
		return await StudentRepo.findStudent(query);
	}

	async addStudent(studentData: CreateStudentDto): Promise<IStudent> {
		return await StudentRepo.addStudent(studentData);
	}

	async updateStudent(studentId: string, studentData: UpdateStudentDto): Promise<IStudent | null> {
		return await StudentRepo.updateStudent(studentId, studentData);
	}

	async deleteStudent(studentId: string): Promise<IStudent | null> {
		return await StudentRepo.deleteStudent(studentId);
	}

	async searchStudents(options: SearchOptions): Promise<PaginationResult<IStudent>> {
		return await StudentRepo.searchStudents(options);
	}

	async getAllStudents(page: number = 1, limit: number = 10, filter: Object = {}): Promise<PaginationResult<IStudent>> {
		return await StudentRepo.getAllStudents(page, limit, filter);
	}

	async getStudentInfo(studentId: string): Promise<any> {
		return await StudentRepo.getStudentInfo(studentId);
	}

	// Student status operations
	async findStudentStatus(statusType: string): Promise<any> {
		return await StudentRepo.findStudentStatus(statusType);
	}

	async findStudentStatusById(statusId: string | Types.ObjectId): Promise<any> {
		return await StudentRepo.findStudentStatusById(statusId);
	}

	async addStudentStatus(statusType: string): Promise<any> {
		return await StudentRepo.addStudentStatus(statusType);
	}

	async updateStudentStatus(statusId: string, statusType: string): Promise<any> {
		return await StudentRepo.updateStudentStatus(statusId, statusType);
	}

	async getStudentStatus(): Promise<any> {
		return await StudentRepo.getStudentStatus();
	}

	// Student status transition operations
	async addStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any> {
		return await StudentRepo.addStudentStatusTransition(fromStatus, toStatus);
	}

	async findStudentStatusTransition(fromStatus: string | Types.ObjectId, toStatus: string | Types.ObjectId): Promise<any> {
		return await StudentRepo.findStudentStatusTransition(fromStatus, toStatus);
	}

	async getTransitionRules(): Promise<any[]> {
		return await StudentRepo.getTransitionRules();
	}

	async deleteStudentStatusTransition(fromStatus: string, toStatus: string): Promise<any> {
		return await StudentRepo.deleteStudentStatusTransition(fromStatus, toStatus);
	}
} 