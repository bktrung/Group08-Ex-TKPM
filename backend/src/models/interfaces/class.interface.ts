import { Document, Types } from 'mongoose';

export interface ISchedule {
	dayOfWeek: number; // 2-7 (Monday to Saturday)
	startPeriod: number; // 1-10
	endPeriod: number; // 1-10
	classroom: string;
}

export interface IClass extends Document {
	classCode: string;
	course: Types.ObjectId | string;
	academicYear: string;
	semester: number;
	instructor: string;
	maxCapacity: number;
	schedule: ISchedule[]; // Array of schedule objects
	enrolledStudents: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}