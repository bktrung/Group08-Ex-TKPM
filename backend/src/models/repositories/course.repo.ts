import Course from "../course.model";
import { CreateCourseDto, UpdateCourseDto } from "../../dto/course";
import { Types } from "mongoose";
import { getAllDocuments } from "../../utils";

export const createCourse = async (courseData: CreateCourseDto) => {
	return await Course.create(courseData);
}

export const findCourseById = async (id: string | Types.ObjectId) => {
	return await Course.findById(id).lean();
}

export const findCourseByCode = async (courseCode: string) => {
	return await Course.findOne({ courseCode }).lean();
}

export const findCoursesByIds = async (ids: Array<string | Types.ObjectId>) => {
	const objectIds = ids.map(id =>
		typeof id === 'string' ? new Types.ObjectId(id) : id
	);

	return await Course.find({ _id: { $in: objectIds } }).lean();
};

export const updateCourse = async (courseCode: string, courseData: UpdateCourseDto) => {
	return await Course.findOneAndUpdate(
		{ courseCode },
		courseData,
		{
			new: true,
			runValidators: true
		}
	).lean();
}

export const deactivateCourse = async (courseCode: string) => {
	return await Course.findOneAndUpdate(
		{ courseCode },
		{ isActive: false },
		{ new: true }
	).lean();
}

export const activateCourse = async (courseCode: string) => {
	return await Course.findOneAndUpdate(
		{ courseCode },
		{ isActive: true },
		{ new: true }
	).lean();
}

export const deleteCourse = async (courseCode: string) => {
	return await Course.findOneAndDelete({ courseCode }).lean();
}

export const getAllCourses = async (
	page: number = 1,
	limit: number = 10,
	filter: Record<string, any> = {}
) => {
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