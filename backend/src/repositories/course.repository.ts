import { injectable } from "inversify";
import Course from "../models/course.model";
import { ICourse } from "../models/interfaces/course.interface";
import { Types } from "mongoose";
import { ICourseRepository } from "../interfaces/repositories/course.repository.interface";

@injectable()
export class CourseRepository implements ICourseRepository {
	async findCourseById(id: string | Types.ObjectId): Promise<ICourse | null> {
		return await Course.findById(id).lean();
	}
} 