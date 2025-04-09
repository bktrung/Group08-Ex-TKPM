import { Types } from "mongoose";

export interface CreateCourseDto {
	courseCode: string;
	name: string;
	credits: number;
	department: Types.ObjectId | string;
	description: string;
	prerequisites?: Array<Types.ObjectId | string>;
}

export interface UpdateCourseDto {
	name?: string;
	credits?: number;
	department?: Types.ObjectId | string;
	description?: string;
}