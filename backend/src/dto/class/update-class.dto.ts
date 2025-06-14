import { ScheduleDto } from "./index";

export interface UpdateClassDto {
	schedule?: ScheduleDto[];
	maxCapacity?: number;
	instructor?: string;
} 