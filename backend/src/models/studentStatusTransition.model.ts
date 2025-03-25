import { model, Schema } from "mongoose";
import { IStudentStatusTransition } from "./interfaces/student.interface";

const DOCUMENT_NAME = "StudentStatusTransition";
const COLLECTION_NAME = "studentStatusTransitions";

const studentStatusTransitionSchema = new Schema<IStudentStatusTransition>({
	fromStatus: {
		type: Schema.Types.ObjectId,
		ref: "StudentStatus",
		required: true
	},
	toStatus: {
		type: Schema.Types.ObjectId,
		ref: "StudentStatus",
		required: true
	}
}, {
	timestamps: true,
	collection: COLLECTION_NAME
});

export default model<IStudentStatusTransition>(DOCUMENT_NAME, studentStatusTransitionSchema);