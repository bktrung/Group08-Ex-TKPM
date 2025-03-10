import { Gender, Department, StudentStatus } from "../../models/student.model";

export interface CreateStudentDto {
	studentId: string;
	fullName: string;
	dateOfBirth: Date;
	gender: Gender;
	department: Department;
	schoolYear: Number;
	program: string;
	address: string;
	email: string;
	phoneNumber: string;
	status: StudentStatus;
}

export interface UpdateStudentDto {
	fullName?: string;
	dateOfBirth?: Date;
	gender?: Gender;
	department?: Department;
	schoolYear?: Number;
	program?: string;
	address?: string;
	email?: string;
	phoneNumber?: string;
	status?: StudentStatus;
}