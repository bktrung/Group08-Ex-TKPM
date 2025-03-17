import { Gender } from "../../models/student.model";
import { Types } from "mongoose";
import { IAddress } from "../address";

export interface CreateStudentDto {
	studentId: string;
	fullName: string;
	dateOfBirth: Date;
	gender: Gender;
	department: string | Types.ObjectId;
	schoolYear: number;
	program: string | Types.ObjectId;
	permanentAddress?: IAddress;
	temporaryAddress?: IAddress;
	mailingAddress: IAddress;
	email: string;
	phoneNumber: string;
	status: string | Types.ObjectId;
}

export interface UpdateStudentDto {
	fullName?: string;
	dateOfBirth?: Date;
	gender?: Gender;
	department?: string | Types.ObjectId;
	schoolYear?: number;
	program?: string | Types.ObjectId;
	permanentAddress?: IAddress;
	temporaryAddress?: IAddress;
	mailingAddress?: IAddress;
	email?: string;
	phoneNumber?: string;
	status?: string | Types.ObjectId;
}