import { injectable, inject } from "inversify";
import { NotFoundError } from "../responses/error.responses";
import { getDocumentId } from "../utils";
import { ITranscriptService } from "../interfaces/services/transcript.service.interface";
import { ICourseRepository } from "../interfaces/repositories/course.repository.interface";
import { IEnrollmentRepository } from "../interfaces/repositories/enrollment.repository.interface";
import { IGradeRepository } from "../interfaces/repositories/grade.repository.interface";
import { IStudentRepository } from "../interfaces/repositories/student.repository.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class TranscriptService implements ITranscriptService {
	constructor(
		@inject(TYPES.CourseRepository) private courseRepository: ICourseRepository,
		@inject(TYPES.EnrollmentRepository) private enrollmentRepository: IEnrollmentRepository,
		@inject(TYPES.GradeRepository) private gradeRepository: IGradeRepository,
		@inject(TYPES.StudentRepository) private studentRepository: IStudentRepository
	) { }

	private async getStudentInfo(studentId: string) {
		const student = await this.studentRepository.getStudentInfo(studentId);
		if (!student) {
			throw new NotFoundError("Student not found");
		}

		// Type guard to check if a field is a populated object with name property
		const getName = (field: any): string => {
			return field && typeof field === 'object' && 'name' in field ? field.name : '';
		};

		return {
			studentId: student.studentId,
			fullName: student.fullName,
			schoolYear: student.schoolYear,
			department: getName(student.department),
			program: getName(student.program),
		};
	}

	private async getStudentGrades(studentId: string) {
		const student = await this.studentRepository.findStudent({ studentId });
		if (!student) {
			throw new NotFoundError("Student not found");
		}

		const enrollments = await this.enrollmentRepository.findEnrollmentsByStudent(getDocumentId(student));

		if (!enrollments.length) {
			return [];
		}

		const courseEnrollmentMap = new Map();

		const getCourse = (field: any): string | null => {
			if (field && typeof field === 'object' && 'course' in field && field.course) {
				return field.course.toString();
			}
			return null;
		}


		enrollments.forEach(enrollment => {
			const courseId = getCourse(enrollment.class);
			if (!courseEnrollmentMap.has(courseId) ||
				new Date(enrollment.enrollmentDate) > new Date(courseEnrollmentMap.get(courseId).enrollmentDate)
			) {
				courseEnrollmentMap.set(courseId, enrollment);
			}
		});

		const latestEnrollments = Array.from(courseEnrollmentMap.values());

		const grades = await Promise.all(latestEnrollments.map(async enrollment => {
			const courseId = getCourse(enrollment.class);

			if (!courseId) return null;
			const courseInfo = await this.courseRepository.findCourseById(courseId);
			if (!courseInfo) {
				return null;
			}

			const gradeInfo = await this.gradeRepository.findGradeByEnrollment(getDocumentId(enrollment));

			if (!gradeInfo) {
				return null;
			}

			return {
				courseCode: courseInfo.courseCode,
				courseName: courseInfo.name,
				credits: courseInfo.credits,
				totalScore: gradeInfo.totalScore,
				gradePoints: gradeInfo.gradePoints,
			}
		}));

		return grades.filter(grade => grade !== null);
	}

	async generateTranscript(studentId: string) {
		const studentInfo = await this.getStudentInfo(studentId);
		const studentGrades = await this.getStudentGrades(studentId);

		// Calculate summary statistics
		let totalCredits = 0;
		let weightedTotalScore = 0; // For GPA out of 10
		let weightedGradePoints = 0; // For GPA out of 4

		// Calculate totals
		studentGrades.forEach(grade => {
			// Skip if grade is null or credits is not a number
			if (!grade || typeof grade.credits !== 'number') return;

			const credits = grade.credits;
			totalCredits += credits;
			weightedTotalScore += credits * grade.totalScore;
			weightedGradePoints += credits * grade.gradePoints;
		});

		// Calculate GPAs
		const gpaOutOf10 = totalCredits > 0 ?
			Number((weightedTotalScore / totalCredits).toFixed(2)) : 0;

		const gpaOutOf4 = totalCredits > 0 ?
			Number((weightedGradePoints / totalCredits).toFixed(2)) : 0;

		return {
			studentInfo,
			courses: studentGrades,
			summary: {
				totalCredits,
				gpaOutOf10,
				gpaOutOf4
			}
		};
	}
}