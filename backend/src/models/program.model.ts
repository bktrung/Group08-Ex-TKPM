import { model, Schema } from "mongoose";
import { IProgram } from "./interfaces/program.interface";

const DOCUMENT_NAME = "Program";
const COLLECTION_NAME = "programs";

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