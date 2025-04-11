export interface createGradeDto {
	studentId: string;
	classCode: string;
	midtermScore?: number;
	finalScore?: number;
	totalScore: number;
}