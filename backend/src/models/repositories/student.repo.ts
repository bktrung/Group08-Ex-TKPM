import Student from "../student.model";
import { IStudent } from "../interfaces/student.interface";
import { CreateStudentDto, UpdateStudentDto } from "../../dto/student";
import { getAllDocuments, PaginationResult, SearchOptions } from "../../utils";
import StudentStatus from "../studentStatus.model";
import { Types } from "mongoose";
import StudentStatusTransition from "../studentStatusTransition.model";


/// Student Repo
export const findStudent = async (query: any): Promise<IStudent | null> => {
	return Student.findOne(query).lean();
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
	).lean();
}

export const deleteStudent = async (studentId: string): Promise<IStudent | null> => {
	return await Student.findOneAndDelete({ studentId }).lean();
}

export const searchStudents = async (options: SearchOptions): Promise<PaginationResult<IStudent>> => {
	const { query, page = 1, limit = 10, sort = "ctime", filter } = options;

	const searchFilter = { 
		$text: { $search: query },
		...filter
	};

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

export const getAllStudents = async (page: number = 1, limit: number = 10, filter: Object = {}): Promise<PaginationResult<IStudent>> => {
	return await getAllDocuments(Student, {
		filter,
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
/// End Student Repo

/// Student Status Repo
export const findStudentStatus = async (statusType: string): Promise<any> => {
	return await StudentStatus.findOne({
		type: statusType
	}).lean();
}

export const findStudentStatusById = async (statusId: string | Types.ObjectId): Promise<any> => {
	return await StudentStatus.findById(statusId).lean();
}

export const addStudentStatus = async (statusType: string): Promise<any> => {
	return await StudentStatus.create({ type: statusType });
}

export const updateStudentStatus = async (statusId: string, StatusType: string): Promise<any> => {
	return await StudentStatus.findOneAndUpdate(
		{ _id: statusId },
		{ type: StatusType },
		{ new: true }
	).lean();
}

export const getStudentStatus = async (): Promise<any> => {
	return await StudentStatus.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
}
/// End Student Status Repo

/// Student Status Transition Repo
export const addStudentStatusTransition = async (fromStatus: string, toStatus: string): Promise<any> => {
	return await StudentStatusTransition.create({ fromStatus, toStatus });
}

export const findStudentStatusTransition = async (
	fromStatus: string | Types.ObjectId,
	toStatus: string | Types.ObjectId
): Promise<any> => {
	return await StudentStatusTransition.findOne({
		fromStatus,
		toStatus
	}).lean();
}

export const getTransitionRules = async (): Promise<any[]> => {
	// Check actual collection names
	const statusCollection = StudentStatus.collection.name; // This will get the actual collection name

	return await StudentStatusTransition.aggregate([
		// Lookup to get fromStatus details
		{
			$lookup: {
				from: statusCollection,  // Use the actual collection name
				localField: 'fromStatus',
				foreignField: '_id',
				as: 'fromStatusDetails'
			}
		},
		// Lookup to get toStatus details
		{
			$lookup: {
				from: statusCollection,  // Use the actual collection name
				localField: 'toStatus',
				foreignField: '_id',
				as: 'toStatusDetails'
			}
		},
		// Add a match stage to filter out records with missing status details
		{
			$match: {
				'fromStatusDetails': { $ne: [] },
				'toStatusDetails': { $ne: [] }
			}
		},
		// Unwind arrays created by lookup
		{ $unwind: '$fromStatusDetails' },
		{ $unwind: '$toStatusDetails' },
		// Group by fromStatus type (not ID)
		{
			$group: {
				_id: '$fromStatusDetails.type', // Group by type instead of ID
				fromStatusId: { $first: '$fromStatusDetails._id' }, // Keep the ID
				toStatus: {
					$addToSet: {
						type: '$toStatusDetails.type',
						_id: '$toStatusDetails._id'
					} // Collect both type and ID
				}
			}
		},
		// Filter out entries with empty toStatus arrays
		{
			$match: {
				'toStatus.0': { $exists: true } // Only include documents where toStatus has at least one element
			}
		},
		// Final projection to format output
		{
			$project: {
				fromStatus: '$_id',
				fromStatusId: 1,
				toStatus: 1,
				_id: 0 // Exclude _id field from results
			}
		},
		// Sort by fromStatus for consistent results
		{
			$sort: { fromStatus: 1 }
		}
	]);
}

export const deleteStudentStatusTransition = async (fromStatus: string, toStatus: string): Promise<any> => {
	return await StudentStatusTransition.findOneAndDelete({
		fromStatus,
		toStatus
	}).lean();
}