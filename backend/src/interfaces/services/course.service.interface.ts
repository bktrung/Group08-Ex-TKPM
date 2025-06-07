import { CreateCourseDto, UpdateCourseDto } from "../../dto/course";
import { ICourse } from "../../models/interfaces/course.interface";
import { PaginationResult } from "../../utils";

export interface ICourseService {
	addCourse(courseData: CreateCourseDto): Promise<ICourse>;
	updateCourse(courseCode: string, courseData: UpdateCourseDto): Promise<ICourse | null>;
	deleteCourse(courseCode: string): Promise<ICourse | null>;
	getCourses(query: {
		departmentId?: string;
		page?: string;
		limit?: string;
	}): Promise<PaginationResult<ICourse>>;
} 