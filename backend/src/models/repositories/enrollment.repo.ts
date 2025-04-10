import Enrollment from "../enrollment.model";
import Class from "../class.model";
import { Types } from "mongoose";
import { CreateEnrollmentDto } from "../../dto/enrollment";
import { EnrollmentStatus } from "../interfaces/enrollment.interface";

export const findEnrollment = async (student: string | Types.ObjectId, class_id: string | Types.ObjectId) => {
	return await Enrollment.findOne({ 
		student, 
		class: class_id, 
		status: EnrollmentStatus.ACTIVE
	}).lean();
}

export const createEnrollment = async (enrollmentData: CreateEnrollmentDto) => {
	// MongoDb community does not support transactions, so i dont care about atomicity
	// Create the enrollment
	const createdEnrollment = await Enrollment.create(enrollmentData);

	// Increment the enrolledStudents count atomically
	await Class.findByIdAndUpdate(
		enrollmentData.class,
		{ $inc: { enrolledStudents: 1 } }
	);

	return createdEnrollment;
};

export const getCompletedCourseIdsByStudent = async (student: string | Types.ObjectId) => {
	const completedEnrollments = await Enrollment.find({
		student,
		status: EnrollmentStatus.COMPLETED
	}).populate({
		path: 'class',
		select: 'course'
	}).lean();

	// Extract unique course IDs to avoid duplicates
	const uniqueCourseIds = new Set<string>();

	completedEnrollments.forEach(enrollment => {
		// Type assertion to help TypeScript understand the structure
		const enrollmentData = enrollment as any;
		const classData = enrollmentData.class;

		if (classData && classData.course) {
			uniqueCourseIds.add(String(classData.course));
		}
	});

	// Convert set to array of ObjectIds
	const courseIds = Array.from(uniqueCourseIds).map(id =>
		new Types.ObjectId(id)
	);

	return courseIds;
};

export const dropEnrollment = async (
	student_id: string | Types.ObjectId, 
	class_id: string | Types.ObjectId, 
	dropReason: string
) => {
	const updatedEnrollment = await Enrollment.findOneAndUpdate(
		{ student: student_id, class: class_id },
		{
			status: EnrollmentStatus.DROPPED,
			dropDate: new Date(),
			dropReason
		},
		{ new: true }
	).lean();

	if (updatedEnrollment) {
		await Class.findByIdAndUpdate(
			class_id,
			{ $inc: { enrolledStudents: -1 } }
		);
	}

	return updatedEnrollment;
}