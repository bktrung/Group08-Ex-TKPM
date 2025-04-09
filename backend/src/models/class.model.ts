import { model, Schema } from "mongoose";
import { IClass, ISchedule } from "./interfaces/class.interface";

const DOCUMENT_NAME = "Class";
const COLLECTION_NAME = "classes";

const scheduleSchema = new Schema<ISchedule>({
	dayOfWeek: {
		type: Number,
		required: true,
		min: 2,
		max: 7,
		validate: {
			validator: Number.isInteger,
			message: 'Day of week must be an integer between 2 (Monday) and 7 (Saturday)'
		}
	},
	startPeriod: {
		type: Number,
		required: true,
		min: 1,
		max: 10,
		validate: {
			validator: Number.isInteger,
			message: 'Period start must be an integer between 1 and 10'
		}
	},
	endPeriod: {
		type: Number,
		required: true,
		min: 1,
		max: 10,
		validate: [
			{
				validator: Number.isInteger,
				message: 'Period end must be an integer between 1 and 10'
			},
			{
				validator: function (this: ISchedule, value: number) {
					return value >= this.startPeriod;
				},
				message: 'Period end must be greater than or equal to period start'
			}
		]
	},
	classroom: {
		type: String,
		required: true
	}
});

const classSchema = new Schema<IClass>({
	classCode: {
		type: String,
		required: true,
		unique: true,
	},
	course: {
		type: Schema.Types.ObjectId,
		ref: "Course",
		required: true,
	},
	academicYear: {
		type: String,
		required: true,
	},
	semester: {
		type: Number,
		required: true,
		enum: [1, 2, 3]
	},
	instructor: {
		type: String,
		required: true,
	},
	maxCapacity: {
		type: Number,
		required: true,
		min: 1,
	},
	schedule: {
		type: [scheduleSchema],
		required: true,
		validate: {
			validator: function (schedules: ISchedule[]) {
				return schedules.length > 0;
			},
			message: 'At least one schedule is required'
		}
	},
	enrolledStudents: {
		type: Number,
		default: 0,
		min: 0,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
}, {
	timestamps: true,
	collection: COLLECTION_NAME,
});

export default model<IClass>(DOCUMENT_NAME, classSchema);