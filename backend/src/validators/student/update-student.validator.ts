import Joi from "joi";
import { Gender } from "../../models/student.model";
import { validateRequest } from "../../middlewares/validation.middleware";
import { addressSchema } from "./add-student.validator";

const updateStudentDto = Joi.object({
	fullName: Joi.string()
		.pattern(/^[A-Za-zÀ-ỹ]+( [A-Za-zÀ-ỹ]+)*$/)
		.min(2)
		.max(100)
		.messages({
			'string.empty': 'Họ tên không được để trống',
			'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
			'string.max': 'Họ tên không được vượt quá {#limit} ký tự',
			'string.pattern.base': 'Họ tên không được chứa ký tự đặc biệt'
		}),
	dateOfBirth: Joi.date().max('now').messages({
		'date.base': 'Ngày sinh phải là một ngày hợp lệ',
		'date.max': 'Ngày sinh không thể trong tương lai'
	}),
	gender: Joi.string().valid(...Object.values(Gender)).messages({
		'any.only': `Giới tính phải là một trong các giá trị: ${Object.values(Gender).join(', ')}`
	}),
	department: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.messages({
			'string.empty': 'ID khoa không được để trống',
			'string.pattern.base': 'ID khoa không hợp lệ (phải là ObjectId MongoDB)'
		}),
	schoolYear: Joi.number()
		.integer()
		.min(1990)
		.max(new Date().getFullYear())
		.messages({
			'number.base': 'Khóa học phải là một số',
			'number.integer': 'Khóa học phải là số nguyên',
			'number.min': 'Khóa học phải từ năm 1990 trở đi',
			'number.max': `Khóa học không thể vượt quá năm hiện tại (${new Date().getFullYear()})`
		}),
	program: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.messages({
			'string.empty': 'ID chương trình học không được để trống',
			'string.pattern.base': 'ID chương trình học không hợp lệ (phải là ObjectId MongoDB)'
		}),
	permanentAddress: addressSchema.optional(),
	temporaryAddress: addressSchema.optional(),
	mailingAddress: addressSchema.optional(),
	email: Joi.string().email().messages({
		'string.email': 'Email không hợp lệ',
		'string.empty': 'Email không được để trống'
	}),
	phoneNumber: Joi.string().pattern(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/).messages({
		'string.pattern.base': 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)',
		'string.empty': 'Số điện thoại không được để trống'
	}),
	status: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.messages({
			'string.empty': 'ID trạng thái không được để trống',
			'string.pattern.base': 'ID trạng thái không hợp lệ (phải là ObjectId MongoDB)'
		})
});

export const updateStudentValidator = validateRequest(updateStudentDto);