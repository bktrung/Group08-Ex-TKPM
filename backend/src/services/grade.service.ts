import { injectable, inject } from "inversify";
import { createGradeDto, updateGradeDto } from "../dto/grade";
import { getDocumentId } from "../utils";
import { BadRequestError, NotFoundError } from "../responses/error.responses";
import { IGradeService } from "../interfaces/services/grade.service.interface";
import { IGradeRepository } from "../interfaces/repositories/grade.repository.interface";
import { IStudentRepository } from "../interfaces/repositories/student.repository.interface";
import { IClassRepository } from "../interfaces/repositories/class.repository.interface";
import { IEnrollmentRepository } from "../interfaces/repositories/enrollment.repository.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class GradeService implements IGradeService {
	constructor(
		@inject(TYPES.GradeRepository) private gradeRepository: IGradeRepository,
		@inject(TYPES.StudentRepository) private studentRepository: IStudentRepository,
		@inject(TYPES.ClassRepository) private classRepository: IClassRepository,
		@inject(TYPES.EnrollmentRepository) private enrollmentRepository: IEnrollmentRepository
	) {}

	async createGrade(gradeData: createGradeDto) {
		const { studentId, classCode, midtermScore, finalScore , totalScore } = gradeData;

		const existingStudent = await this.studentRepository.findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Student not found");
		}

		const existingClass = await this.classRepository.findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Class not found");
		}

		const existingEnrollment = await this.enrollmentRepository.findEnrollment(
			getDocumentId(existingStudent), 
			getDocumentId(existingClass)
		);
		if (!existingEnrollment) {
			throw new BadRequestError("Student is not enrolled in this class");
		}

		// check status of enrollment

		const enrollment = getDocumentId(existingEnrollment);

		const existingGrade = await this.gradeRepository.findGradeByEnrollment(enrollment);
		if (existingGrade) {
			throw new BadRequestError("Grade already exists for this enrollment");
		}

		if (totalScore < 0 || totalScore > 10) {
			throw new BadRequestError("Total score must be between 0 and 10");
		}

		const { letterGrade, gradePoints } = this.calculateGrade(totalScore);

		const newGrade = await this.gradeRepository.createGrade({
			enrollment,
			midtermScore,
			finalScore,
			totalScore,
			letterGrade,
			gradePoints
		})

		return newGrade;
	}

	async getGradesByClass(classCode: string) {
		const existingClass = await this.classRepository.findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Class not found");
		}

		const grades = await this.gradeRepository.getGradesByClass(getDocumentId(existingClass));
		return grades;
	}

	async getGradeByStudentAndClass(studentId: string, classCode: string) {
		const existingStudent = await this.studentRepository.findStudent({ studentId });
		if (!existingStudent) {
			throw new NotFoundError("Student not found");
		}

		const existingClass = await this.classRepository.findClassByCode(classCode);
		if (!existingClass) {
			throw new NotFoundError("Class not found");
		}

		const existingEnrollment = await this.enrollmentRepository.findEnrollment(
			getDocumentId(existingStudent), 
			getDocumentId(existingClass)
		);
		if (!existingEnrollment) {
			throw new BadRequestError("Student is not enrolled in this class");
		}

		const grade = await this.gradeRepository.findGradeByEnrollment(getDocumentId(existingEnrollment));
		if (!grade) {
			throw new NotFoundError("Grade not found for this student in this class");
		}

		return grade;
	}

	async updateGrade(id: string, updateData: updateGradeDto) {
		const existingGrade = await this.gradeRepository.findGradeById(id);
		if (!existingGrade) {
			throw new NotFoundError("Grade not found");
		}

		// Validate score ranges if provided
		if (updateData.midtermScore !== undefined && (updateData.midtermScore < 0 || updateData.midtermScore > 10)) {
			throw new BadRequestError("Midterm score must be between 0 and 10");
		}
		if (updateData.finalScore !== undefined && (updateData.finalScore < 0 || updateData.finalScore > 10)) {
			throw new BadRequestError("Final score must be between 0 and 10");
		}
		if (updateData.totalScore !== undefined && (updateData.totalScore < 0 || updateData.totalScore > 10)) {
			throw new BadRequestError("Total score must be between 0 and 10");
		}

		// Prepare update data with recalculated letter grade and points if totalScore is updated
		let finalUpdateData = { ...updateData };
		
		if (updateData.totalScore !== undefined) {
			const { letterGrade, gradePoints } = this.calculateGrade(updateData.totalScore);
			finalUpdateData = {
				...finalUpdateData,
				letterGrade,
				gradePoints
			};
		}

		const updatedGrade = await this.gradeRepository.updateGrade(id, finalUpdateData);
		if (!updatedGrade) {
			throw new NotFoundError("Grade not found during update");
		}

		return updatedGrade;
	}

	async deleteGrade(id: string) {
		const existingGrade = await this.gradeRepository.findGradeById(id);
		if (!existingGrade) {
			throw new NotFoundError("Grade not found");
		}

		const deletedGrade = await this.gradeRepository.deleteGrade(id);
		if (!deletedGrade) {
			throw new NotFoundError("Grade not found during deletion");
		}

		return deletedGrade;
	}

	private calculateGrade(totalScore: number): { letterGrade: string; gradePoints: number } {
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

		return {
			letterGrade: grade?.letter || "F",
			gradePoints: grade?.points || 0.0
		};
	}
}