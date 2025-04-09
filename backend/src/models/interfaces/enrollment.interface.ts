import { Document, Types } from 'mongoose';

export enum EnrollmentStatus {
	ACTIVE = 'ACTIVE',
	DROPPED = 'DROPPED',
	COMPLETED = 'COMPLETED'
}

export interface IEnrollment extends Document {
	student: Types.ObjectId | string;
	class: Types.ObjectId | string;
	enrollmentDate: Date;
	status: EnrollmentStatus;
	dropDate?: Date;
	dropReason?: string;
	createdAt: Date;
	updatedAt: Date;
}