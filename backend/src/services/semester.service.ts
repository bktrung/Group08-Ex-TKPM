import { CreateSemesterDto } from "../dto/semester";
import { ISemester } from "../models/interfaces/semester.interface";
import { createSemester } from "../models/repositories/semester.repo";

class SemesterService {
	static async createSemester(semesterData: CreateSemesterDto): Promise<ISemester> {
		const newSemester = await createSemester(semesterData);
		return newSemester;
	}
}

export default SemesterService;