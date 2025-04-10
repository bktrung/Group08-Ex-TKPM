import { model, Schema } from "mongoose";
import { ISemester } from "./interfaces/semester.interface";

const DOCUMENT_NAME = "Semester";
const COLLECTION_NAME = "semesters";

export const semesterSchema = new Schema<ISemester>({
	academicYear: {
		type: String,
		required: true,
	},
	semester: {
		type: Number,
		required: true,
		enum: [1, 2, 3],
	},
	registrationStartDate: {
		type: Date,
		required: true,
	},
	registrationEndDate: {
		type: Date,
		required: true,
	},
	dropDeadline: {
		type: Date,
		required: true,
	},
	semesterStartDate: {
		type: Date,
		required: true,
	},
	semesterEndDate: {
		type: Date,
		required: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model<ISemester>(DOCUMENT_NAME, semesterSchema);