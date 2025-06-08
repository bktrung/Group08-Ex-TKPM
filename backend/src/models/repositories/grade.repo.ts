import { Types } from "mongoose";
import Grade from "../grade.model";
import { updateGradeDto } from "../../dto/grade";

export const findGradeByEnrollment = async (enrollment: string | Types.ObjectId) => {
	return await Grade.findOne({ enrollment }).lean();
}

export const findGradeById = async (id: string) => {
	return await Grade.findById(id).lean();
}

export const getGradesByClass = async (classId: string | Types.ObjectId) => {
	return await Grade.find({})
		.populate({
			path: 'enrollment',
			match: { class: classId },
			populate: {
				path: 'student',
				select: 'studentId fullName email'
			}
		})
		.lean()
		.then(grades => grades.filter(grade => grade.enrollment !== null));
}

export const createGrade = async (gradeData: any) => {
	return await Grade.create(gradeData);
}

export const updateGrade = async (id: string, updateData: updateGradeDto) => {
	return await Grade.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
}

export const deleteGrade = async (id: string) => {
	return await Grade.findByIdAndDelete(id).lean();
}