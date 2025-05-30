import { findEnrollment, createEnrollment, getCompletedCourseIdsByStudent, dropEnrollment, findDropHistoryByStudent } from "../models/repositories/enrollment.repo";
import { BadRequestError, NotFoundError } from "../responses/error.responses";
import { enrollStudentDto } from "../dto/enrollment";
import { findStudent } from "../models/repositories/student.repo";
import { findClassByCode } from "../models/repositories/class.repo";
import { getDocumentId } from "../utils";
import { findCourseById, findCoursesByIds } from "../models/repositories/course.repo";
import { findSemester } from "../models/repositories/semester.repo";

class EnrollmentService {
	static async enrollStudent(enrollmentData: enrollStudentDto) {
		const { studentId, classCode } = enrollmentData;

		// Check if student exists
		const existingStudent = await findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Sinh viên không tồn tại");
		}

		// Check if class exists
		const existingClass = await findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Lớp học không tồn tại");
		}

		// Check if class is active
		if (!existingClass.isActive) {
			throw new BadRequestError("Lớp học không hoạt động");
		}

		// Check if class is full
		if (existingClass.enrolledStudents >= existingClass.maxCapacity) {
			throw new BadRequestError("Lớp học đã đầy");
		}

		// Check if enrollment already exists
		const existingEnrollment = await findEnrollment(
			getDocumentId(existingStudent), 
			getDocumentId(existingClass)
		);
		if (existingEnrollment) {
			throw new BadRequestError("Sinh viên đã đăng ký lớp học này");
		}

		const classCourse = await findCourseById(existingClass.course);
		if (!classCourse) {
			throw new NotFoundError("Môn học không tồn tại");
		}

		if (!classCourse.isActive) {
			throw new BadRequestError("Môn học không hoạt động");
		}

		// Check if student has prerequisites for the course
		const studentCompletedCourseIds = await getCompletedCourseIdsByStudent(
			getDocumentId(existingStudent)
		);
		
		const coursePrerequisites = classCourse.prerequisites || [];

		// Check if student has completed all prerequisites
		if (coursePrerequisites.length > 0) {
			// Convert arrays to strings for set comparison
			const completedCoursesSet = new Set(studentCompletedCourseIds.map(id => String(id)));

			// Find missing prerequisites
			const missingPrerequisites = coursePrerequisites.filter(
				prerequisiteId => !completedCoursesSet.has(String(prerequisiteId))
			);

			if (missingPrerequisites.length > 0) {
				// Get the course codes of missing prerequisites for better error message
				const missingCourses = await findCoursesByIds(missingPrerequisites);
				const missingCourseNames = missingCourses.map(course => course.courseCode).join(', ');

				throw new BadRequestError(
					`Sinh viên chưa hoàn thành các môn học tiên quyết: ${missingCourseNames}`
				);
			}
		}

		// Create enrollment
		const newEnrollment = await createEnrollment({
			student: getDocumentId(existingStudent),
			class: getDocumentId(existingClass)
		});

		if (!newEnrollment) {
			throw new BadRequestError("Đăng ký lớp học không thành công");
		}

		return newEnrollment;
	}

	static async dropStudent(studentId: string, classCode: string, dropReason: string) {
		// Check if student exists
		const existingStudent = await findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Sinh viên không tồn tại");
		}

		// Check if class exists
		const existingClass = await findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Lớp học không tồn tại");
		}

		// Check if enrollment exists
		const existingEnrollment = await findEnrollment(
			getDocumentId(existingStudent),
			getDocumentId(existingClass)
		);
		if (!existingEnrollment) {
			throw new NotFoundError("Sinh viên chưa đăng ký lớp học này");
		}
		///

		// check if possible to drop class
		const semester = await findSemester(
			existingClass.academicYear,
			existingClass.semester
		);

		if (!semester) {
			throw new NotFoundError("Học kỳ không tồn tại");
		}

		const currentDate = new Date();
		const dropDeadline = new Date(semester.dropDeadline);
		if (currentDate > dropDeadline) {
			throw new BadRequestError("Đã quá hạn huỷ lớp học");
		}

		const droppedEnrollment = await dropEnrollment(
			getDocumentId(existingStudent),
			getDocumentId(existingClass),
			dropReason
		);

		if (!droppedEnrollment) {
			throw new BadRequestError("Sinh viên chưa đăng ký lớp học này");
		}

		return droppedEnrollment;
	}

	static async getDropHistory(studentId: string) {
		// Check if student exists
		const existingStudent = await findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Sinh viên không tồn tại");
		}

		const dropHistory = await findDropHistoryByStudent(getDocumentId(existingStudent));
		if (!dropHistory || dropHistory.length === 0) {
			throw new NotFoundError("Không tìm thấy lịch sử huỷ lớp học");
		}

		return dropHistory;
	}
}

export default EnrollmentService;