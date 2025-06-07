import { injectable, inject } from "inversify";
import { ICourse } from "../models/interfaces/course.interface";
import { CreateCourseDto, UpdateCourseDto } from "../dto/course";
import { BadRequestError, NotFoundError } from "../responses/error.responses";
import { getDocumentId } from "../utils";
import { Types } from "mongoose";
import { ICourseService } from "../interfaces/services/course.service.interface";
import { ICourseRepository } from "../interfaces/repositories/course.repository.interface";
import { IDepartmentRepository } from "../interfaces/repositories/department.repository.interface";
import { IClassRepository } from "../interfaces/repositories/class.repository.interface";
import { IEnrollmentRepository } from "../interfaces/repositories/enrollment.repository.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class CourseService implements ICourseService {
	constructor(
		@inject(TYPES.CourseRepository) private courseRepository: ICourseRepository,
		@inject(TYPES.DepartmentRepository) private departmentRepository: IDepartmentRepository,
		@inject(TYPES.ClassRepository) private classRepository: IClassRepository,
		@inject(TYPES.EnrollmentRepository) private enrollmentRepository: IEnrollmentRepository
	) {}

	async addCourse(courseData: CreateCourseDto): Promise<ICourse> {
		// Check if course with same ID already exists
		const existingCourse = await this.courseRepository.findCourseByCode(courseData.courseCode);
		if (existingCourse) {
			throw new BadRequestError("Mã môn học đã tồn tại");
		}

		// Check if department exists
		const existingDepartment = await this.departmentRepository.findDepartmentById(courseData.department);
		if (!existingDepartment) {
			throw new NotFoundError("Khoa không tồn tại");
		}

		// Check if prerequisites exist
		if (courseData.prerequisites && courseData.prerequisites.length > 0) {
			const foundPrerequisites = await this.courseRepository.findCoursesByIds(courseData.prerequisites);

			if (foundPrerequisites.length !== courseData.prerequisites.length) {
				// Find which prerequisites don't exist
				const foundIds = foundPrerequisites.map((course: ICourse) => course._id!.toString());
				const missingIds = courseData.prerequisites.filter(id =>
					!foundIds.includes(id.toString())
				);

				throw new NotFoundError(
					`Môn học tiên quyết không tồn tại: ${missingIds.join(', ')}`
				);
			}
		}

		const newCourse = await this.courseRepository.createCourse(courseData);
		return newCourse;
	}

	async updateCourse(courseCode: string, courseData: UpdateCourseDto): Promise<ICourse | null> {
		const existingCourse = await this.courseRepository.findCourseByCode(courseCode);
		if (!existingCourse) {
			throw new NotFoundError("Mã môn học không tồn tại");
		}

		// can not change credits if some students are enrolled in classes in this course
		const openedClasses = await this.classRepository.findClassByCourse(getDocumentId(existingCourse));
		if (openedClasses.length > 0 && courseData.credits) {
			let hasEnrollments = false;
			for (const classObj of openedClasses) {
				const classEnrollments = await this.enrollmentRepository.findEnrollmentsByClass(getDocumentId(classObj));
				if (classEnrollments.length > 0) {
					hasEnrollments = true;
					break;
				}
			}
			
			if (hasEnrollments) {
				throw new BadRequestError("Không thể thay đổi số tín chỉ khi đã có sinh viên đăng ký");
			}
		}

		const updatedCourse = await this.courseRepository.updateCourse(courseCode, courseData);
		return updatedCourse;
	}

	async deleteCourse(courseCode: string): Promise<ICourse | null> {
		const existingCourse = await this.courseRepository.findCourseByCode(courseCode);
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
		const openedClasses = await this.classRepository.findClassByCourse(getDocumentId(existingCourse));
		if (openedClasses.length > 0) {
			const deactivatedCourse = await this.courseRepository.deactivateCourse(courseCode);
			return deactivatedCourse;
		}

		const deletedCourse = await this.courseRepository.deleteCourse(courseCode);
		return deletedCourse;
	}

	async getCourses(query: {
		departmentId?: string;
		page?: string;
		limit?: string;
	}) {
		// Parse pagination parameters
		const page = query.page ? parseInt(query.page) : 1;
		const limit = query.limit ? parseInt(query.limit) : 10;

		// Build filter object based on query parameters
		const filter: Record<string, any> = {};

		// Add department filter if departmentId is provided
		if (query.departmentId) {
			// Validate departmentId format to prevent errors
			if (Types.ObjectId.isValid(query.departmentId)) {
				filter.department = new Types.ObjectId(query.departmentId);
			} else {
				throw new BadRequestError('Invalid department ID format');
			}
		}

		// Query courses with pagination and filters
		return await this.courseRepository.getAllCourses(page, limit, filter);
	}
}