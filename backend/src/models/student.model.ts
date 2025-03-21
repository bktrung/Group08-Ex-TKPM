import { Schema, model } from "mongoose";
import { IStudent, Gender } from "./interfaces/student.interface";
import { registerStudentLoggerHooks } from "./hooks/student.hook";

const DOCUMENT_NAME = "Student";
const COLLECTION_NAME = "students";

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
	},
	identityDocument: {
		type: Object,
		required: true
	},
	nationality: {
		type: String,
		required: true
	}
}, {
	timestamps: true,
	collection: COLLECTION_NAME
});

// Create a unique index on identityDocument.number
studentSchema.index(
	{ 'identityDocument.number': 1 },
	{ unique: true, name: "UniqueIdentityDocumentNumber" }
);

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

registerStudentLoggerHooks(studentSchema);

export default model<IStudent>(DOCUMENT_NAME, studentSchema);