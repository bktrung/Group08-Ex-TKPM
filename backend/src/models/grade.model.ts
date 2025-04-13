import { model, Schema } from "mongoose";
import { IGrade } from "./interfaces/grade.interface";

const DOCUMENT_NAME = "Grade";
const COLLECTION_NAME = "grades";

const gradeSchema = new Schema<IGrade>({
	enrollment: {
		type: Schema.Types.ObjectId,
		ref: "Enrollment",
		required: true,
	},
	midtermScore: {
		type: Number,
		default: null,
	},
	finalScore: {
		type: Number,
		default: null,
	},
	totalScore: {
		type: Number,
		required: true,
	},
	letterGrade: {
		type: String,
		required: true,
	},
	gradePoints: {
		type: Number,
		required: true,
	},
	isPublished: {
		type: Boolean,
		default: true, // im lazy lol
	},
}, { 
	timestamps: true,
	collection: COLLECTION_NAME
});

export default model<IGrade>(DOCUMENT_NAME, gradeSchema);