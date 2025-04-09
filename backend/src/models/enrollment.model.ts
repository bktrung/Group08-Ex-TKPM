import { model, Schema } from "mongoose";
import { IEnrollment, EnrollmentStatus } from "./interfaces/enrollment.interface";

const DOCUMENT_NAME = "Enrollment";
const COLLECTION_NAME = "enrollments";

const enrollmentSchema = new Schema<IEnrollment>({
	student: {
		type: Schema.Types.ObjectId,
		ref: "Student",
		required: true,
	},
	class: {
		type: Schema.Types.ObjectId,
		ref: "Class",
		required: true,
	},
	enrollmentDate: {
		type: Date,
		default: Date.now,
	},
	status: {
		type: String,
		enum: Object.values(EnrollmentStatus),
		default: EnrollmentStatus.ACTIVE,
	},
	dropDate: {
		type: Date,
	},
	dropReason: {
		type: String,
	},
}, { 
	timestamps: true,
	collection: COLLECTION_NAME
});

export default model<IEnrollment>(DOCUMENT_NAME, enrollmentSchema);