import { injectable } from "inversify";
import Course from "../models/course.model";
import { CreateCourseDto, UpdateCourseDto } from "../dto/course";
import { ICourse } from "../models/interfaces/course.interface";
import { Types } from "mongoose";
import { getAllDocuments } from "../utils";
import { ICourseRepository } from "../interfaces/repositories/course.repository.interface";

@injectable()
export class CourseRepository implements ICourseRepository {
	async findCourseById(id: string | Types.ObjectId): Promise<ICourse | null> {
		return await Course.findById(id).lean();
	}

	async findCourseByCode(courseCode: string): Promise<ICourse | null> {
		return await Course.findOne({ courseCode }).lean();
	}

	async createCourse(courseData: CreateCourseDto): Promise<ICourse> {
		return await Course.create(courseData);
	}

	async findCoursesByIds(ids: Array<string | Types.ObjectId>): Promise<ICourse[]> {
		const objectIds = ids.map(id =>
			typeof id === 'string' ? new Types.ObjectId(id) : id
		);

		return await Course.find({ _id: { $in: objectIds } }).lean();
	}

	async updateCourse(courseCode: string, courseData: UpdateCourseDto): Promise<ICourse | null> {
		return await Course.findOneAndUpdate(
			{ courseCode },
			courseData,
			{
				new: true,
				runValidators: true
			}
		).lean();
	}

	async deactivateCourse(courseCode: string): Promise<ICourse | null> {
		return await Course.findOneAndUpdate(
			{ courseCode },
			{ isActive: false },
			{ new: true }
		).lean();
	}

	async deleteCourse(courseCode: string): Promise<ICourse | null> {
		return await Course.findOneAndDelete({ courseCode }).lean();
	}

	async getAllCourses(
		page: number = 1,
		limit: number = 10,
		filter: Record<string, any> = {}
	) {
		return await getAllDocuments(Course, {
			filter,
			page,
			limit,
			sort: "ctime",
			select: { createdAt: 0, updatedAt: 0, __v: 0 },
			populate: [
				{ path: 'department', select: '_id name' },
				{ path: 'prerequisites', select: '_id name courseCode' }
			]
		});
	}
} 