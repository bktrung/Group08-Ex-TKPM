import { Schema, model, Document, Types } from "mongoose";

const DOCUMENT_NAME = "Student";
const COLLECTION_NAME = "students";

export enum Gender {
	MALE = 'Nam',
	FEMALE = 'Nữ'
}

export interface IStudent extends Document {
	studentId: string;
	fullName: string;
	dateOfBirth: Date;
	gender: Gender;
	department: Types.ObjectId | string;
	departmentName?: string; // Virtual property
	schoolYear: number;
	program: Types.ObjectId | string;
	programName?: string; // Virtual property
	address: string;
	email: string;
	phoneNumber: string;
	status: Types.ObjectId | string;
	statusType?: string; // Virtual property
}

const studentSchema = new Schema<IStudent>({
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
		type: Schema.Types.ObjectId,
		ref: 'Department',
		required: true
	},
	schoolYear: {
		type: Number,
		required: true,
		min: 1990,
		max: new Date().getFullYear()
	},
	program: {
		type: Schema.Types.ObjectId,
		ref: 'Program',
		required: true
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
		type: Schema.Types.ObjectId,
		ref: 'StudentStatus',
		required: true
	}
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
	toJSON: { virtuals: true }, // Include virtuals when converting to JSON
	toObject: { virtuals: true } // Include virtuals when converting to objects
});

// Virtual properties for department, program, and status names
studentSchema.virtual('departmentName').get(function () {
	if (this.populated('department')) {
		return (this.department as any)?.name;
	}
	return undefined;
});

studentSchema.virtual('programName').get(function () {
	if (this.populated('program')) {
		return (this.program as any)?.name;
	}
	return undefined;
});

studentSchema.virtual('statusType').get(function () {
	if (this.populated('status')) {
		return (this.status as any)?.type;
	}
	return undefined;
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