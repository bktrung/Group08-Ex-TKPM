import { injectable } from "inversify";
import Enrollment from "../models/enrollment.model";
import { IEnrollment } from "../models/interfaces/enrollment.interface";
import { Types } from "mongoose";
import { IEnrollmentRepository } from "../interfaces/repositories/enrollment.repository.interface";

@injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
	async findEnrollmentsByClass(classId: string | Types.ObjectId): Promise<IEnrollment[]> {
		return await Enrollment.find({ class: classId }).lean();
	}
} 