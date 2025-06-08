export interface createGradeDto {
	studentId: string;
	classCode: string;
	midtermScore?: number;
	finalScore?: number;
	totalScore: number;
}

export interface updateGradeDto {
	midtermScore?: number;
	finalScore?: number;
	totalScore?: number;
	letterGrade?: string;
	gradePoints?: number;
}