import Student, { IStudent } from "../student.model";
import { CreateStudentDto, UpdateStudentDto } from "../../dto/student";
import { getAllDocuments, PaginationResult, SearchOptions } from "../../utils";
import StudentStatus from "../studentStatus.model";
import { Types } from "mongoose";

export const findStudent = async (query: any): Promise<IStudent | null> => {
	return Student.findOne(query)
		.populate("department")
		.populate("program")
		.populate("status");
}

export const addStudent = async (studentData: CreateStudentDto): Promise<IStudent> => {
	const newStudent = await Student.create(studentData);
	return newStudent;
}

export const updateStudent = async (studentId: string, studentData: UpdateStudentDto): Promise<IStudent | null> => {
	return await Student.findOneAndUpdate(
		{ studentId },
		studentData,
		{
			new: true,
			runValidators: true
		}
	);
}

export const deleteStudent = async (studentId: string): Promise<IStudent | null> => {
	return await Student.findOneAndDelete({ studentId });
}

export const searchStudents = async (options: SearchOptions): Promise<PaginationResult<IStudent>> => {
	const { query, page = 1, limit = 10, sort = "ctime" } = options;

	const searchFilter = { $text: { $search: query } };

	const result = await getAllDocuments(Student, {
		filter: searchFilter,
		page,
		limit,
		sort,
		select: { 
			score: { $meta: "textScore" },
			createdAt: 0, updatedAt: 0, __v: 0, _id: 0
		},
		populate: [
			{ path: 'department', select: '_id name' },
			{ path: 'program', select: '_id name' },
			{ path: 'status', select: '_id type' }
		]
	});

	return result;
};

export const getAllStudents = async (page: number = 1, limit: number = 10): Promise<PaginationResult<IStudent>> => {
	return await getAllDocuments(Student, {
		filter: {},
		page,
		limit,
		sort: "ctime",
		select: { createdAt: 0, updatedAt: 0, __v: 0, _id: 0 },
		populate: [
			{ path: 'department', select: '_id name' },
			{ path: 'program', select: '_id name' },
			{ path: 'status', select: '_id type' }
		]
	});
}

export const findStudentStatus = async (statusType: string): Promise<any> => {
	return await StudentStatus.findOne({
		type: statusType
	});
}

export const findStudentStatusById = async (statusId: string | Types.ObjectId): Promise<any> => {
	return await StudentStatus.findById(statusId);
}

export const addStudentStatus = async (statusType: string): Promise<any> => {
	return await StudentStatus.create({ type: statusType });
}

export const updateStudentStatus = async (statusId: string, StatusType: string): Promise<any> => {
	return await StudentStatus.findOneAndUpdate(
		{ _id: statusId },
		{ type: StatusType },
		{ new: true }
	);
}

export const getStudentStatus = async (): Promise<any> => {
	return await StudentStatus.find({}, { createdAt: 0, updatedAt: 0, __v: 0 });
}