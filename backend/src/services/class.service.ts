import { injectable, inject } from "inversify";
import { CreateClassDto } from "../dto/class";
import { BadRequestError } from "../responses/error.responses";
import { IClass } from "../models/interfaces/class.interface";
import { Types } from "mongoose";
import { IClassService } from "../interfaces/services/class.service.interface";
import { IClassRepository } from "../interfaces/repositories/class.repository.interface";
import { ICourseRepository } from "../interfaces/repositories/course.repository.interface";
import { TYPES } from "../configs/di.types";
import { PaginationResult } from "../utils";

@injectable()
export class ClassService implements IClassService {
	constructor(
		@inject(TYPES.ClassRepository) private classRepository: IClassRepository,
		@inject(TYPES.CourseRepository) private courseRepository: ICourseRepository
	) {}

	async addClass(classData: CreateClassDto): Promise<IClass> {
		// Check if class with same ID already exists
		const existingClass = await this.classRepository.findClassByCode(classData.classCode);
		if (existingClass) {
			throw new BadRequestError("Class code already exists");
		}

		// Check if course exists and is active
		const existingCourse = await this.courseRepository.findCourseById(classData.course);
		if (!existingCourse) {
			throw new BadRequestError("Course does not exist");
		}

		if (!existingCourse.isActive) {
			throw new BadRequestError("This course has stopped opening classes");
		}

		// Validate schedule
		if (!classData.schedule || classData.schedule.length === 0) {
			throw new BadRequestError("Class must have at least one schedule");
		}

		// Check for internal schedule conflicts
		for (let i = 0; i < classData.schedule.length; i++) {
			const scheduleA = classData.schedule[i];

			// Validate each schedule item
			if (scheduleA.startPeriod > scheduleA.endPeriod) {
				throw new BadRequestError(
					`End period (${scheduleA.endPeriod}) must be greater than or equal to start period (${scheduleA.startPeriod})`
				);
			}

			// Check if schedules overlap with each other
			for (let j = i + 1; j < classData.schedule.length; j++) {
				const scheduleB = classData.schedule[j];
				if (scheduleA.dayOfWeek === scheduleB.dayOfWeek) {
					const overlap = (
						(scheduleA.startPeriod <= scheduleB.endPeriod && scheduleA.startPeriod >= scheduleB.startPeriod) ||
						(scheduleA.endPeriod >= scheduleB.startPeriod && scheduleA.endPeriod <= scheduleB.endPeriod) ||
						(scheduleA.startPeriod <= scheduleB.startPeriod && scheduleA.endPeriod >= scheduleB.endPeriod)
					);

					if (overlap) {
						throw new BadRequestError(
							`Schedule conflicts on day ${scheduleA.dayOfWeek} between period ${scheduleA.startPeriod}-${scheduleA.endPeriod} and period ${scheduleB.startPeriod}-${scheduleB.endPeriod}`
						);
					}
				}
			}
		}

		// Check for classroom conflicts with other classes
		const overlappingClasses = await this.classRepository.findClassesWithOverlappingSchedule(classData.schedule);
		if (overlappingClasses && overlappingClasses.length > 0) {
			// Find the specific conflict
			for (const existingClass of overlappingClasses) {
				for (const existingSchedule of existingClass.schedule) {
					for (const newSchedule of classData.schedule) {
						if (existingSchedule.dayOfWeek === newSchedule.dayOfWeek &&
							existingSchedule.classroom === newSchedule.classroom) {

							const overlap = (
								(newSchedule.startPeriod <= existingSchedule.endPeriod && newSchedule.startPeriod >= existingSchedule.startPeriod) ||
								(newSchedule.endPeriod >= existingSchedule.startPeriod && newSchedule.endPeriod <= existingSchedule.endPeriod) ||
								(newSchedule.startPeriod <= existingSchedule.startPeriod && newSchedule.endPeriod >= existingSchedule.endPeriod)
							);

							if (overlap) {
								throw new BadRequestError(
									`Room ${newSchedule.classroom} is already used on day ${newSchedule.dayOfWeek} period ${existingSchedule.startPeriod}-${existingSchedule.endPeriod} by class ${existingClass.classCode}`
								);
							}
						}
					}
				}
			}
		}

		// Create the new class
		const newClass = await this.classRepository.createClass(classData);
		return newClass;
	}

	async getClasses(query: {
		courseId?: string;
		academicYear?: string;
		semester?: string;
		page?: string;
		limit?: string;
	}): Promise<PaginationResult<IClass>> {
		// Parse pagination parameters
		const page = query.page ? parseInt(query.page) : 1;
		const limit = query.limit ? parseInt(query.limit) : 10;

		// Build filter object based on query parameters
		const filter: Record<string, any> = {};

		// Add course filter if courseId is provided
		if (query.courseId) {
			// Validate courseId format to prevent errors
			if (Types.ObjectId.isValid(query.courseId)) {
				filter.course = new Types.ObjectId(query.courseId);
			} else {
				throw new BadRequestError('Invalid course ID format');
			}
		}

		// Add academic year filter if provided
		if (query.academicYear) {
			filter.academicYear = query.academicYear;
		}

		// Add semester filter if provided
		if (query.semester) {
			const semester = parseInt(query.semester);
			// Validate semester format
			if (isNaN(semester) || ![1, 2, 3].includes(semester)) {
				throw new BadRequestError('Invalid semester value. Must be 1, 2, or 3.');
			}
			filter.semester = semester;
		}

		// Query classes with pagination and filters
		return await this.classRepository.getAllClasses(page, limit, filter);
	}
}