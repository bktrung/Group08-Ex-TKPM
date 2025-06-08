import { injectable, inject } from "inversify";
import { CreateSemesterDto, UpdateSemesterDto } from "../dto/semester";
import { ISemester } from "../models/interfaces/semester.interface";
import { ISemesterService } from "../interfaces/services/semester.service.interface";
import { ISemesterRepository } from "../interfaces/repositories/semester.repository.interface";
import { IClassRepository } from "../interfaces/repositories/class.repository.interface";
import { TYPES } from "../configs/di.types";
import { BadRequestError, NotFoundError } from "../responses/error.responses";

@injectable()
export class SemesterService implements ISemesterService {
	constructor(
		@inject(TYPES.SemesterRepository) private semesterRepository: ISemesterRepository,
		@inject(TYPES.ClassRepository) private classRepository: IClassRepository
	) {}

	async createSemester(semesterData: CreateSemesterDto): Promise<ISemester> {
		return await this.semesterRepository.createSemester(semesterData);
	}

	async updateSemester(id: string, updateData: UpdateSemesterDto): Promise<ISemester> {
		// Find the existing semester
		const existingSemester = await this.semesterRepository.findSemesterById(id);
		if (!existingSemester) {
			throw new NotFoundError('Semester not found');
		}

		// Check if trying to update academicYear or semester number
		if (updateData.academicYear || updateData.semester) {
			// Check if there are any classes in this semester
			try {
				const classesInSemester = await this.classRepository.getAllClasses(1, 1, {
					academicYear: existingSemester.academicYear,
					semester: existingSemester.semester
				});

				// Check if there are classes in multiple possible property names
				const hasClasses = (classesInSemester.classes && classesInSemester.classes.length > 0) ||
					(classesInSemester.data && classesInSemester.data.length > 0) ||
					(Array.isArray(classesInSemester) && classesInSemester.length > 0);

				if (hasClasses) {
					throw new BadRequestError(
						'Cannot change academic year or semester number when classes exist for this semester'
					);
				}
			} catch (error) {
				// If it's our business logic error, re-throw it
				if (error instanceof BadRequestError) {
					throw error;
				}
				// For other errors (like property access), we'll assume no classes exist
				// This is safer than failing the entire operation
				console.warn('Error checking classes in semester:', error);
			}

			// If changing academicYear or semester, check for conflicts with existing semesters
			const conflictingSemester = await this.semesterRepository.findSemester(
				updateData.academicYear || existingSemester.academicYear,
				updateData.semester || existingSemester.semester
			);

			if (conflictingSemester && conflictingSemester._id?.toString() !== id) {
				throw new BadRequestError('A semester with this academic year and semester number already exists');
			}
		}

		// Merge current data with update data for validation
		const mergedData = {
			...existingSemester,
			...updateData
		};

		// Validate date logic with merged data
		this.validateDateLogic(mergedData);

		// Update the semester
		const updatedSemester = await this.semesterRepository.updateSemester(id, updateData);
		if (!updatedSemester) {
			throw new NotFoundError('Semester not found during update');
		}

		return updatedSemester;
	}

	private validateDateLogic(semesterData: any): void {
		const {
			registrationStartDate,
			registrationEndDate,
			dropDeadline,
			semesterStartDate,
			semesterEndDate
		} = semesterData;

		// Convert to Date objects if they're not already
		const regStart = new Date(registrationStartDate);
		const regEnd = new Date(registrationEndDate);
		const dropDead = new Date(dropDeadline);
		const semStart = new Date(semesterStartDate);
		const semEnd = new Date(semesterEndDate);

		// Validate registration dates
		if (regEnd <= regStart) {
			throw new BadRequestError('Registration end date must be after registration start date');
		}

		// Validate drop deadline
		if (dropDead <= regEnd) {
			throw new BadRequestError('Drop deadline must be after registration end date');
		}

		// Validate semester dates
		if (semEnd <= semStart) {
			throw new BadRequestError('Semester end date must be after semester start date');
		}

		// Business logic: Drop deadline should be before or at semester end
		if (dropDead > semEnd) {
			throw new BadRequestError('Drop deadline cannot be after semester end date');
		}

		// Business logic: Registration should complete before semester starts (optional warning)
		// We could add this as a warning in the frontend but allow it in the backend for flexibility
	}
}