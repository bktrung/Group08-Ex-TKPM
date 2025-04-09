import { createClass, findClassesWithOverlappingSchedule } from "../models/repositories/class.repo";
import { CreateClassDto } from "../dto/class";
import { findClassByCode } from "../models/repositories/class.repo";
import { BadRequestError } from "../responses/error.responses";
import { findCourseById } from "../models/repositories/course.repo";
import { IClass } from "../models/interfaces/class.interface";

class ClassService {
	static async addClass(classData: CreateClassDto): Promise<IClass> {
		// Check if class with same ID already exists
		const existingClass = await findClassByCode(classData.classCode);
		if (existingClass) {
			throw new BadRequestError("Mã lớp học đã tồn tại");
		}

		// Check if course exists and is active
		const existingCourse = await findCourseById(classData.course);
		if (!existingCourse) {
			throw new BadRequestError("Môn học không tồn tại");
		}

		if (!existingCourse.isActive) {
			throw new BadRequestError("Môn học này đã ngừng mở lớp");
		}

		// Validate schedule
		if (!classData.schedule || classData.schedule.length === 0) {
			throw new BadRequestError("Lớp học phải có ít nhất một lịch học");
		}

		// Check for internal schedule conflicts
		for (let i = 0; i < classData.schedule.length; i++) {
			const scheduleA = classData.schedule[i];

			// Validate each schedule item
			if (scheduleA.startPeriod > scheduleA.endPeriod) {
				throw new BadRequestError(
					`Tiết kết thúc (${scheduleA.endPeriod}) phải lớn hơn hoặc bằng tiết bắt đầu (${scheduleA.startPeriod})`
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
							`Lịch học bị trùng vào ngày ${scheduleA.dayOfWeek} giữa tiết ${scheduleA.startPeriod}-${scheduleA.endPeriod} và tiết ${scheduleB.startPeriod}-${scheduleB.endPeriod}`
						);
					}
				}
			}
		}

		// Check for classroom conflicts with other classes
		const overlappingClasses = await findClassesWithOverlappingSchedule(classData.schedule);
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
									`Phòng ${newSchedule.classroom} đã được sử dụng vào thứ ${newSchedule.dayOfWeek} tiết ${existingSchedule.startPeriod}-${existingSchedule.endPeriod} bởi lớp ${existingClass.classCode}`
								);
							}
						}
					}
				}
			}
		}

		// Create the new class
		const newClass = await createClass(classData);
		return newClass;
	}
}

export default ClassService;