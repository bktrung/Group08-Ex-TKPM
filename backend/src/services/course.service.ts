import { createCourse, findCoursesByIds, findCourseByCode, updateCourse, deleteCourse, deactivateCourse } from "../models/repositories/course.repo";
import { ICourse } from "../models/interfaces/course.interface";
import { CreateCourseDto, UpdateCourseDto } from "../dto/course";
import { BadRequestError, NotFoundError } from "../responses/error.responses";
import { findDepartmentById } from "../models/repositories/department.repo";
import { findClassByCourse } from "../models/repositories/class.repo";
import { getDocumentId } from "../utils";

class CourseService {
	static async addCourse(courseData: CreateCourseDto): Promise<ICourse> {
		// Check if course with same ID already exists
		const existingCourse = await findCourseByCode(courseData.courseCode);
		if (existingCourse) {
			throw new BadRequestError("Mã môn học đã tồn tại");
		}

		// Check if department exists
		const existingDepartment = await findDepartmentById(courseData.department);
		if (!existingDepartment) {
			throw new NotFoundError("Khoa không tồn tại");
		}

		// Check if prerequisites exist
		if (courseData.prerequisites && courseData.prerequisites.length > 0) {
			const foundPrerequisites = await findCoursesByIds(courseData.prerequisites);

			if (foundPrerequisites.length !== courseData.prerequisites.length) {
				// Find which prerequisites don't exist
				const foundIds = foundPrerequisites.map(course => course._id.toString());
				const missingIds = courseData.prerequisites.filter(id =>
					!foundIds.includes(id.toString())
				);

				throw new NotFoundError(
					`Môn học tiên quyết không tồn tại: ${missingIds.join(', ')}`
				);
			}
		}

		const newCourse = await createCourse(courseData);
		return newCourse
	}

	static async updateCourse(courseCode: string, courseData: UpdateCourseDto): Promise<ICourse | null> {
		const existingCourse = await findCourseByCode(courseCode);
		if (!existingCourse) {
			throw new NotFoundError("Mã môn học không tồn tại");
		}

		// can not change credits if some students are enrolled in classes in this course

		const updatedCourse = await updateCourse(courseCode, courseData);
		return updatedCourse;
	}

	static async deleteCourse(courseCode: string): Promise<ICourse | null> {
		const existingCourse = await findCourseByCode(courseCode);
		if (!existingCourse) {
			throw new NotFoundError("Mã môn học không tồn tại");
		}

		// Check if the course was created less than 30 minutes ago
		const createdAt = new Date(existingCourse.createdAt);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

		if (diffInMinutes > 30) {
			throw new BadRequestError(
				"Không thể xóa khóa học sau 30 phút kể từ khi tạo. " +
				"Khóa học đã tạo từ " + diffInMinutes + " phút trước."
			);
		}

		// can not delete course if some classes are opened for this course
		const openedClasses = await findClassByCourse(getDocumentId(existingCourse));
		if (openedClasses.length > 0) {
			const deactivatedCourse = await deactivateCourse(courseCode);
			return deactivatedCourse;
		}

		const deletedCourse = await deleteCourse(courseCode);
		return deletedCourse;
	}
}

export default CourseService;