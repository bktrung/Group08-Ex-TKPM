import { Schema, model, Document } from "mongoose";

const DOCUMENT_NAME = "Student";
const COLLECTION_NAME = "students";

export enum StudentStatus {
	ACTIVE = 'Đang học',
	GRADUATED = 'Đã tốt nghiệp',
	DROPPED = 'Đã thôi học',
	SUSPENDED = 'Tạm dừng học'
}

export enum Department {
	LAW = 'Luật',
	BUSINESS_ENGLISH = 'Tiếng Anh thương mại',
	JAPANESE = 'Tiếng Nhật',
	FRENCH = 'Tiếng Pháp'
}

export enum Gender {
	MALE = 'Nam',
	FEMALE = 'Nữ'
}

export interface IStudent extends Document {
	studentId: string;
	fullName: string;
	dateOfBirth: Date;
	gender: Gender;
	department: Department;
	schoolYear: Number;
	program: string;
	address: string;
	email: string;
	phoneNumber: string;
	status: StudentStatus;
}

const studentSchema = new Schema({
	studentId: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	fullName: {
		type: String,
		required: true,
		trim: true
	},
	dateOfBirth: {
		type: Date,
		required: true
	},
	gender: {
		type: String,
		required: true,
		enum: Object.values(Gender)
	},
	department: {
		type: String,
		required: true,
		enum: Object.values(Department)
	},
	schoolYear: {
		type: Number,
		required: true,
		min: 1990,
		max: new Date().getFullYear()
	},
	program: {
		type: String,
		required: true,
		trim: true
	},
	address: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	phoneNumber: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	status: {
		type: String,
		required: true,
		enum: Object.values(StudentStatus),
		default: StudentStatus.ACTIVE
	}
}, {
	timestamps: true,
	collection: COLLECTION_NAME
});

// Create text index for full-text search
studentSchema.index(
	{
		fullName: 'text',
		studentId: 'text',
	},
	{
		weights: {
			fullName: 10,
			studentId: 5,
		},
		name: "StudentTextIndex"
	}
);

export default model<IStudent>(DOCUMENT_NAME, studentSchema);