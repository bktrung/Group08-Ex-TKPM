import { findCourseById } from "../models/repositories/course.repo";
import { findEnrollmentsByStudent } from "../models/repositories/enrollment.repo";
import { findGradeByEnrollment } from "../models/repositories/grade.repo";
import { findStudent, getStudentInfo } from "../models/repositories/student.repo";
import { NotFoundError } from "../responses/error.responses";
import { getDocumentId } from "../utils";


class TranscriptService {
	private async getStudentInfo(studentId: string) {
		const student = await getStudentInfo(studentId);
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
		const student = await findStudent({ studentId });
		if (!student) {
			throw new NotFoundError("Student not found");
		}


		const enrollments = await findEnrollmentsByStudent(getDocumentId(student));
		console.log(`Found ${enrollments.length} enrollments for student ${studentId}`);
		
		if (!enrollments.length) {
			console.log("No enrollments found, returning empty array");
			return [];
		}

		const courseEnrollmentMap = new Map();

		const getCourse = (field: any): string => {
			// Convert ObjectId to string if needed
			if (field && typeof field === 'object' && 'course' in field) {
				return field.course.toString();  // Ensure it's a string
			}
			return '';
		}

		enrollments.forEach(enrollment => {
			const courseId = getCourse(enrollment.class);
			console.log(`Processing enrollment for course ID: ${courseId}`);
			if (!courseEnrollmentMap.has(courseId) || 
				new Date(enrollment.enrollmentDate) > new Date(courseEnrollmentMap.get(courseId).enrollmentDate)
			) {
				courseEnrollmentMap.set(courseId, enrollment);
			}
		});

		const latestEnrollments = Array.from(courseEnrollmentMap.values());

		const grades = await Promise.all(latestEnrollments.map(async enrollment => {
			const courseInfo = await findCourseById(getCourse(enrollment.class));
			if (!courseInfo) {
				return null;
			}

			const gradeInfo = await findGradeByEnrollment(getDocumentId(enrollment));

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

export default new TranscriptService();