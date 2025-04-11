import { Types, Document } from 'mongoose';

export interface IGrade extends Document {
	enrollment: Types.ObjectId | string;
	midtermScore?: number;
	finalScore?: number;
	totalScore: number;
	letterGrade: string;
	gradePoints: number;
	isPublished: boolean;
	createdAt: Date;
	updatedAt: Date;
}