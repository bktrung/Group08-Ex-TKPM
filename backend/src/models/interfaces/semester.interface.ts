import { Document } from 'mongoose';

export interface ISemester extends Document {
	academicYear: string;
	semester: number; // 1,2,3
	registrationStartDate: Date;
	registrationEndDate: Date;
	dropDeadline: Date;
	semesterStartDate: Date;
	semesterEndDate: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}