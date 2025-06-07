import { injectable, inject } from "inversify";
import { BadRequestError, NotFoundError } from "../responses/error.responses";
import { enrollStudentDto } from "../dto/enrollment";
import { getDocumentId } from "../utils";
import { IEnrollmentService } from "../interfaces/services/enrollment.service.interface";
import { IEnrollmentRepository } from "../interfaces/repositories/enrollment.repository.interface";
import { IStudentRepository } from "../interfaces/repositories/student.repository.interface";
import { IClassRepository } from "../interfaces/repositories/class.repository.interface";
import { ICourseRepository } from "../interfaces/repositories/course.repository.interface";
import { ISemesterRepository } from "../interfaces/repositories/semester.repository.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class EnrollmentService implements IEnrollmentService {
	constructor(
		@inject(TYPES.EnrollmentRepository) private enrollmentRepository: IEnrollmentRepository,
		@inject(TYPES.StudentRepository) private studentRepository: IStudentRepository,
		@inject(TYPES.ClassRepository) private classRepository: IClassRepository,
		@inject(TYPES.CourseRepository) private courseRepository: ICourseRepository,
		@inject(TYPES.SemesterRepository) private semesterRepository: ISemesterRepository
	) {}

	async enrollStudent(enrollmentData: enrollStudentDto) {
		const { studentId, classCode } = enrollmentData;

		// Check if student exists
		const existingStudent = await this.studentRepository.findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Student does not exist");
		}

		// Check if class exists
		const existingClass = await this.classRepository.findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Class does not exist");
		}

		// Check if class is active
		if (!existingClass.isActive) {
			throw new BadRequestError("Class is not active");
		}

		// Check if class is full
		if (existingClass.enrolledStudents >= existingClass.maxCapacity) {
			throw new BadRequestError("Class is full");
		}

		// Check if enrollment already exists
		const existingEnrollment = await this.enrollmentRepository.findEnrollment(
			getDocumentId(existingStudent), 
			getDocumentId(existingClass)
		);
		if (existingEnrollment) {
			throw new BadRequestError("Student already enrolled in this class");
		}

		const classCourse = await this.courseRepository.findCourseById(existingClass.course);
		if (!classCourse) {
			throw new NotFoundError("Course does not exist");
		}

		if (!classCourse.isActive) {
			throw new BadRequestError("Course is not active");
		}

		// Check if student has prerequisites for the course
		const studentCompletedCourseIds = await this.enrollmentRepository.getCompletedCourseIdsByStudent(
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
				const missingCourses = await this.courseRepository.findCoursesByIds(missingPrerequisites);
				const missingCourseNames = missingCourses.map(course => course.courseCode).join(', ');

				throw new BadRequestError(
					`Student has not completed required prerequisites: ${missingCourseNames}`
				);
			}
		}

		// Create enrollment
		const newEnrollment = await this.enrollmentRepository.createEnrollment({
			student: getDocumentId(existingStudent),
			class: getDocumentId(existingClass)
		});

		if (!newEnrollment) {
			throw new BadRequestError("Class enrollment was not successful");
		}

		return newEnrollment;
	}

	async dropStudent(studentId: string, classCode: string, dropReason: string) {
		// Check if student exists
		const existingStudent = await this.studentRepository.findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Student does not exist");
		}

		// Check if class exists
		const existingClass = await this.classRepository.findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Class does not exist");
		}

		// Check if enrollment exists
		const existingEnrollment = await this.enrollmentRepository.findEnrollment(
			getDocumentId(existingStudent),
			getDocumentId(existingClass)
		);
		if (!existingEnrollment) {
			throw new NotFoundError("Student has not enrolled in this class");
		}
		///

		// check if possible to drop class
		const semester = await this.semesterRepository.findSemester(
			existingClass.academicYear,
			existingClass.semester
		);

		if (!semester) {
			throw new NotFoundError("Semester does not exist");
		}

		const currentDate = new Date();
		const dropDeadline = new Date(semester.dropDeadline);
		if (currentDate > dropDeadline) {
			throw new BadRequestError("Past deadline to drop class");
		}

		const droppedEnrollment = await this.enrollmentRepository.dropEnrollment(
			getDocumentId(existingStudent),
			getDocumentId(existingClass),
			dropReason
		);

		if (!droppedEnrollment) {
			throw new BadRequestError("Student has not enrolled in this class");
		}

		return droppedEnrollment;
	}

	async getDropHistory(studentId: string) {
		// Check if student exists
		const existingStudent = await this.studentRepository.findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Student does not exist");
		}

		const dropHistory = await this.enrollmentRepository.findDropHistoryByStudent(getDocumentId(existingStudent));
		if (!dropHistory || dropHistory.length === 0) {
			throw new NotFoundError("Drop history not found");
		}

		return dropHistory;
	}
}