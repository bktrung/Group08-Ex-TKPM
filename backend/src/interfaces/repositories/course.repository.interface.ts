import { ICourse } from "../../models/interfaces/course.interface";
import { Types } from "mongoose";

export interface ICourseRepository {
	findCourseById(courseId: string | Types.ObjectId): Promise<ICourse | null>;
} 