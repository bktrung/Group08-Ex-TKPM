import { injectable, inject } from "inversify";
import { CreateSemesterDto } from "../dto/semester";
import { ISemester } from "../models/interfaces/semester.interface";
import { ISemesterService } from "../interfaces/services/semester.service.interface";
import { ISemesterRepository } from "../interfaces/repositories/semester.repository.interface";
import { TYPES } from "../configs/di.types";

@injectable()
export class SemesterService implements ISemesterService {
	constructor(
		@inject(TYPES.SemesterRepository) private semesterRepository: ISemesterRepository
	) {}

	async createSemester(semesterData: CreateSemesterDto): Promise<ISemester> {
		return await this.semesterRepository.createSemester(semesterData);
	}
}