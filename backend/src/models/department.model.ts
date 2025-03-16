import { model, Schema, Document } from "mongoose";

const DOCUMENT_NAME = "Department";
const COLLECTION_NAME = "departments";

export interface IDepartment extends Document {
	name: string;
}

const departmentSchema = new Schema<IDepartment>({
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

export default model<IDepartment>(DOCUMENT_NAME, departmentSchema);