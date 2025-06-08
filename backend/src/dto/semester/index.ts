export interface CreateSemesterDto {
	academicYear: string;
	semester: number; // 1,2,3
	registrationStartDate: Date;
	registrationEndDate: Date;
	dropDeadline: Date;
	semesterStartDate: Date;
	semesterEndDate: Date;
}

export interface UpdateSemesterDto {
	academicYear?: string;
	semester?: number; // 1,2,3
	registrationStartDate?: Date;
	registrationEndDate?: Date;
	dropDeadline?: Date;
	semesterStartDate?: Date;
	semesterEndDate?: Date;
}