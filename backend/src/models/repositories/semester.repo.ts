import Semester from "../semester.model";
import { ISemester } from "../interfaces/semester.interface";
import { CreateSemesterDto } from "../../dto/semester/index";

export const createSemester = async (semesterData: CreateSemesterDto): Promise<ISemester> => {
	return Semester.create(semesterData);
}

export const findSemester = async (academicYear: string, semester: number): Promise<ISemester | null> => {
	return Semester.findOne({ academicYear, semester }).lean();
}