import { model, Schema } from "mongoose";
import { ICourse } from "./interfaces/course.interface";

const DOCUMENT_NAME = "Course";
const COLLECTION_NAME = "courses";

const courseSchema = new Schema<ICourse>({
	courseCode: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true,
	},
	credits: {
		type: Number,
		required: true,
	},
	department: {
		type: Schema.Types.ObjectId,
		ref: "Department",
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	prerequisites: [
		{
			type: Schema.Types.ObjectId,
			ref: "Course",
		},
	],
	isActive: {
		type: Boolean,
		default: true,
	},
}, { 
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model<ICourse>(DOCUMENT_NAME, courseSchema);