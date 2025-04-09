import { Document, Types } from "mongoose";

export interface ICourse extends Document {
	courseCode: string;
	name: string;
	credits: number;
	department: Types.ObjectId | string;
	description: string;
	prerequisites: Array<Types.ObjectId | string>;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}