import { Schema, model, Document, Types } from "mongoose";
import { IAddress } from "../dto/address";

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
	schoolYear: number;
	program: Types.ObjectId | string;
	permanentAddress?: IAddress;
	temporaryAddress?: IAddress;
	mailingAddress: IAddress;
	email: string;
	phoneNumber: string;
	status: Types.ObjectId | string;
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
	permanentAddress: {
		type: Object
	},
	temporaryAddress: {
		type: Object
	},
	mailingAddress: {
		type: Object,
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