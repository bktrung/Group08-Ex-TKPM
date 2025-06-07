import { IEnrollment } from "../../models/interfaces/enrollment.interface";
import { Types } from "mongoose";
import { CreateEnrollmentDto } from "../../dto/enrollment";

export interface IEnrollmentRepository {
	// Basic enrollment operations
	findEnrollment(student: string | Types.ObjectId, class_id: string | Types.ObjectId): Promise<IEnrollment | null>;
	createEnrollment(enrollmentData: CreateEnrollmentDto): Promise<IEnrollment>;
	dropEnrollment(student_id: string | Types.ObjectId, class_id: string | Types.ObjectId, dropReason: string): Promise<IEnrollment | null>;
	
	// Student-specific operations
	getCompletedCourseIdsByStudent(student: string | Types.ObjectId): Promise<Types.ObjectId[]>;
	findDropHistoryByStudent(studentId: string | Types.ObjectId): Promise<any[]>;
	findEnrollmentsByStudent(student: string | Types.ObjectId): Promise<IEnrollment[]>;
	
	// Class-specific operations
	findEnrollmentsByClass(class_id: string | Types.ObjectId): Promise<IEnrollment[]>;
} 