import { injectable } from "inversify";
import { IEnrollment } from "../models/interfaces/enrollment.interface";
import { Types } from "mongoose";
import { IEnrollmentRepository } from "../interfaces/repositories/enrollment.repository.interface";
import { CreateEnrollmentDto } from "../dto/enrollment";
import * as EnrollmentRepo from "../models/repositories/enrollment.repo";

@injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
	// Basic enrollment operations
	async findEnrollment(student: string | Types.ObjectId, class_id: string | Types.ObjectId): Promise<IEnrollment | null> {
		return await EnrollmentRepo.findEnrollment(student, class_id);
	}

	async createEnrollment(enrollmentData: CreateEnrollmentDto): Promise<IEnrollment> {
		return await EnrollmentRepo.createEnrollment(enrollmentData);
	}

	async dropEnrollment(student_id: string | Types.ObjectId, class_id: string | Types.ObjectId, dropReason: string): Promise<IEnrollment | null> {
		return await EnrollmentRepo.dropEnrollment(student_id, class_id, dropReason);
	}

	// Student-specific operations
	async getCompletedCourseIdsByStudent(student: string | Types.ObjectId): Promise<Types.ObjectId[]> {
		return await EnrollmentRepo.getCompletedCourseIdsByStudent(student);
	}

	async findDropHistoryByStudent(studentId: string | Types.ObjectId): Promise<any[]> {
		return await EnrollmentRepo.findDropHistoryByStudent(studentId);
	}

	async findEnrollmentsByStudent(student: string | Types.ObjectId): Promise<IEnrollment[]> {
		return await EnrollmentRepo.findEnrollmentsByStudent(student);
	}

	// Class-specific operations
	async findEnrollmentsByClass(class_id: string | Types.ObjectId): Promise<IEnrollment[]> {
		return await EnrollmentRepo.findEnrollmentsByClass(class_id);
	}
} 