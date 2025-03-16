import { Document, Schema, model } from "mongoose";

const DOCUMENT_NAME = "StudentStatus";
const COLLECTION_NAME = "studentStatus";

export interface IStudentStatus extends Document {
	type: string;
}

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