import { injectable } from "inversify";
import { ISemesterRepository } from "../interfaces/repositories/semester.repository.interface";
import Semester from "../models/semester.model";
import { ISemester } from "../models/interfaces/semester.interface";
import { CreateSemesterDto, UpdateSemesterDto } from "../dto/semester";

@injectable()
export class SemesterRepository implements ISemesterRepository {
	async createSemester(semesterData: CreateSemesterDto): Promise<ISemester> {
		return await Semester.create(semesterData);
	}

	async findSemester(academicYear: string, semester: number): Promise<ISemester | null> {
		return await Semester.findOne({ academicYear, semester }).lean();
	}

	async findSemesterById(id: string): Promise<ISemester | null> {
		return await Semester.findById(id).lean();
	}

	async updateSemester(id: string, updateData: UpdateSemesterDto): Promise<ISemester | null> {
		return await Semester.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).lean();
	}
} 