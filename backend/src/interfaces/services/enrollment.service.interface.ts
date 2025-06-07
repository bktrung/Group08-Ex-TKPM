import { IEnrollment } from "../../models/interfaces/enrollment.interface";
import { enrollStudentDto } from "../../dto/enrollment";

export interface IEnrollmentService {
	enrollStudent(enrollmentData: enrollStudentDto): Promise<IEnrollment>;
	dropStudent(studentId: string, classCode: string, dropReason: string): Promise<IEnrollment>;
	getDropHistory(studentId: string): Promise<any[]>;
} 