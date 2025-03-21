import { Schema, model } from "mongoose";
import { IStudentStatus } from "./interfaces/student.interface";

const DOCUMENT_NAME = "StudentStatus";
const COLLECTION_NAME = "studentStatus";

const studentStatusSchema = new Schema<IStudentStatus>({
	type: {
		type: String,
		required: true,
		unique: true,
		trim: true
	}
}, { 
	timestamps: true,
	collection: COLLECTION_NAME
});

export default model<IStudentStatus>(DOCUMENT_NAME, studentStatusSchema);