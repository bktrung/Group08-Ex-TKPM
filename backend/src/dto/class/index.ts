import { Types } from "mongoose";

// Individual schedule item
export interface ScheduleDto {
	dayOfWeek: number; // 2-7 (Monday to Saturday)
	startPeriod: number; // 1-10
	endPeriod: number; // 1-10
	classroom: string;
}

export interface CreateClassDto {
	classCode: string;
	course: Types.ObjectId | string;
	academicYear: string;
	semester: number;  // 1, 2, or 3
	instructor: string;
	maxCapacity: number;
	schedule: ScheduleDto[]; // Array of schedule objects
}

export { UpdateClassDto } from './update-class.dto';