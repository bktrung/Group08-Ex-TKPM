import Joi from "joi";
import { Department, StudentStatus, Gender } from "../../models/student.model";
import { validateRequest } from "../../middlewares/validation.middleware";

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
	department: Joi.string().valid(...Object.values(Department)).messages({
		'any.only': `Khoa phải là một trong các giá trị: ${Object.values(Department).join(', ')}`
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
	program: Joi.string().messages({
		'string.empty': 'Chương trình học không được để trống'
	}),
	address: Joi.string().messages({
		'string.empty': 'Địa chỉ không được để trống'
	}),
	email: Joi.string().email().messages({
		'string.email': 'Email không hợp lệ',
		'string.empty': 'Email không được để trống'
	}),
	phoneNumber: Joi.string().pattern(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/).messages({
		'string.pattern.base': 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)',
		'string.empty': 'Số điện thoại không được để trống'
	}),
	status: Joi.string().valid(...Object.values(StudentStatus)).messages({
		'any.only': `Trạng thái phải là một trong các giá trị: ${Object.values(StudentStatus).join(', ')}`
	})
});

export const updateStudentValidator = validateRequest(updateStudentDto);