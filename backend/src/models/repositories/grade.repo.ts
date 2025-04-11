import { Types } from "mongoose";
import Grade from "../grade.model";

export const findGradeByEnrollment = async (enrollment: string | Types.ObjectId) => {
	return await Grade.findOne({ enrollment }).lean();
}

export const createGrade = async (gradeData: any) => {
	return await Grade.create(gradeData);
}