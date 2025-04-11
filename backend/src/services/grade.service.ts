import { createGradeDto } from "../dto/grade";
import { findClassByCode } from "../models/repositories/class.repo";
import { findEnrollment } from "../models/repositories/enrollment.repo";
import { createGrade, findGradeByEnrollment } from "../models/repositories/grade.repo";
import { findStudent } from "../models/repositories/student.repo";
import { getDocumentId } from "../utils";
import { BadRequestError, NotFoundError } from "../responses/error.responses";

class GradeService {
	static async createGrade(gradeData: createGradeDto) {
		const { studentId, classCode, midtermScore, finalScore , totalScore } = gradeData;

		const existingStudent = await findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Student not found");
		}

		const existingClass = await findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Class not found");
		}

		const existingEnrollment = await findEnrollment(
			getDocumentId(existingStudent), 
			getDocumentId(existingClass)
		);
		if (!existingEnrollment) {
			throw new BadRequestError("Student is not enrolled in this class");
		}

		// check status of enrollment

		const enrollment = getDocumentId(existingEnrollment);

		const existingGrade = await findGradeByEnrollment(enrollment);
		if (existingGrade) {
			throw new BadRequestError("Grade already exists for this enrollment");
		}

		console.log(enrollment);
		console.log(existingGrade);

		if (totalScore < 0 || totalScore > 10) {
			throw new BadRequestError("Total score must be between 0 and 10");
		}

		const gradeScale = [
			{ threshold: 9, letter: "A", points: 4.0 },
			{ threshold: 8, letter: "B+", points: 3.5 },
			{ threshold: 7, letter: "B", points: 3.0 },
			{ threshold: 6, letter: "C+", points: 2.5 },
			{ threshold: 5, letter: "C", points: 2.0 },
			{ threshold: 4, letter: "D+", points: 1.5 },
			{ threshold: 3, letter: "D", points: 1.0 },
			{ threshold: 0, letter: "F", points: 0.0 }
		];

		// Find the appropriate grade based on score
		const grade = gradeScale.find(g => totalScore >= g.threshold);

		let letterGrade, gradePoints;

		// Apply the grade to gradeData
		if (grade) {
			letterGrade = grade.letter;
			gradePoints = grade.points;
		}

		const newGrade = await createGrade({
			enrollment,
			midtermScore,
			finalScore,
			totalScore,
			letterGrade,
			gradePoints
		})

		return newGrade;
	}
}

export default GradeService;