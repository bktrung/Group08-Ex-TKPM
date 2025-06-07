import { ICourse } from "../../models/interfaces/course.interface";
import { Types } from "mongoose";
import { CreateCourseDto, UpdateCourseDto } from "../../dto/course";
import { PaginationResult } from "../../utils";

export interface ICourseRepository {
	findCourseById(courseId: string | Types.ObjectId): Promise<ICourse | null>;
	findCourseByCode(courseCode: string): Promise<ICourse | null>;
	createCourse(courseData: CreateCourseDto): Promise<ICourse>;
	findCoursesByIds(ids: Array<string | Types.ObjectId>): Promise<ICourse[]>;
	updateCourse(courseCode: string, courseData: UpdateCourseDto): Promise<ICourse | null>;
	deactivateCourse(courseCode: string): Promise<ICourse | null>;
	deleteCourse(courseCode: string): Promise<ICourse | null>;
	getAllCourses(page: number, limit: number, filter: Record<string, any>): Promise<PaginationResult<ICourse>>;
} 