import { Types } from "mongoose";

export interface CreateEnrollmentDto {
	student: Types.ObjectId | string;
	class: Types.ObjectId | string;
}

export interface enrollStudentDto {
	studentId: string;
	classCode: string;
}