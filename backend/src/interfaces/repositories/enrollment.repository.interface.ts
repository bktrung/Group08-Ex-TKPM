import { IEnrollment } from "../../models/interfaces/enrollment.interface";
import { Types } from "mongoose";

export interface IEnrollmentRepository {
	findEnrollmentsByClass(classId: string | Types.ObjectId): Promise<IEnrollment[]>;
} 