import { model, Schema, Document } from "mongoose";

const DOCUMENT_NAME = "Program";
const COLLECTION_NAME = "programs";

export interface IProgram extends Document {
	name: string;
}

const programSchema = new Schema<IProgram>({
	name: {
		type: String,
		required: true,
		unique: true,
		trim: true
	}
}, {
	timestamps: true,
	collection: COLLECTION_NAME
});

export default model<IProgram>(DOCUMENT_NAME, programSchema);