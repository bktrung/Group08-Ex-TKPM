import { model, Schema } from "mongoose";
import { IDepartment } from "./interfaces/department.interface";
import { registerDepartmentLoggerHooks } from "./hooks/department.hook";

const DOCUMENT_NAME = "Department";
const COLLECTION_NAME = "departments";

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

registerDepartmentLoggerHooks(departmentSchema);

export default model<IDepartment>(DOCUMENT_NAME, departmentSchema);