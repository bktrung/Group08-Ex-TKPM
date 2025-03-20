import { addStudentSchema } from "./add-student.validator";
import Joi from "joi";

export const importStudentSchema = Joi.object({
	studentId: addStudentSchema.extract('studentId'),
	fullName: addStudentSchema.extract('fullName'),
	dateOfBirth: addStudentSchema.extract('dateOfBirth'),
	gender: addStudentSchema.extract('gender'),
	department: Joi.string().required().messages({
		'string.empty': 'Tên khoa không được để trống',
		'any.required': 'Khoa là trường bắt buộc'
	}),
	schoolYear: addStudentSchema.extract('schoolYear'),
	program: Joi.string().required().messages({
		'string.empty': 'Tên chương trình học không được để trống',
		'any.required': 'Chương trình học là trường bắt buộc'
	}),
	permanentAddress: addStudentSchema.extract('permanentAddress'),
	temporaryAddress: addStudentSchema.extract('temporaryAddress'),
	mailingAddress: addStudentSchema.extract('mailingAddress'),
	email: addStudentSchema.extract('email'),
	phoneNumber: addStudentSchema.extract('phoneNumber'),
	status: Joi.string().required().messages({
		'string.empty': 'Tên trạng thái không được để trống',
		'any.required': 'Trạng thái là trường bắt buộc'
	}),
	identityDocument: addStudentSchema.extract('identityDocument'),
	nationality: addStudentSchema.extract('nationality')
});