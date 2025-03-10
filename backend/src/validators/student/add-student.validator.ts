import Joi from "joi";
import { Department, StudentStatus, Gender } from "../../models/student.model";
import { validateRequest } from "../../middlewares/validation.middleware";

const addStudentSchema = Joi.object({
	studentId: Joi.string()
		.pattern(/^[0-9]{8}$/)
		.required()
		.messages({
			'string.empty': 'Mã số sinh viên không được để trống',
			'string.pattern.base': 'Mã số sinh viên phải có đúng 8 chữ số',
			'any.required': 'Mã số sinh viên là trường bắt buộc'
		}),
	fullName: Joi.string()
		.pattern(/^[A-Za-zÀ-ỹ]+( [A-Za-zÀ-ỹ]+)*$/)
		.required()
		.min(2)
		.max(100)
		.messages({
			'string.empty': 'Họ tên không được để trống',
			'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
			'string.max': 'Họ tên không được vượt quá {#limit} ký tự',
			'string.pattern.base': 'Họ tên không được chứa ký tự đặc biệt',
			'any.required': 'Họ tên là trường bắt buộc'
		}),
	dateOfBirth: Joi.date().required().max('now').messages({
		'date.base': 'Ngày sinh phải là một ngày hợp lệ',
		'date.max': 'Ngày sinh không thể trong tương lai',
		'any.required': 'Ngày sinh là trường bắt buộc'
	}),
	gender: Joi.string().valid(...Object.values(Gender)).required().messages({
		'any.only': `Giới tính phải là một trong các giá trị: ${Object.values(Gender).join(', ')}`,
		'any.required': 'Giới tính là trường bắt buộc'
	}),
	department: Joi.string().valid(...Object.values(Department)).required().messages({
		'any.only': `Khoa phải là một trong các giá trị: ${Object.values(Department).join(', ')}`,
		'any.required': 'Khoa là trường bắt buộc'
	}),
	schoolYear: Joi.number()
		.integer()
		.min(1990)
		.max(new Date().getFullYear())
		.required()
		.messages({
			'number.base': 'Khóa học phải là một số',
			'number.integer': 'Khóa học phải là số nguyên',
			'number.min': 'Khóa học phải từ năm 1990 trở đi',
			'number.max': `Khóa học không thể vượt quá năm hiện tại (${new Date().getFullYear()})`,
			'any.required': 'Khóa học là trường bắt buộc'
		}),
	program: Joi.string().required().messages({
		'string.empty': 'Chương trình học không được để trống',
		'any.required': 'Chương trình học là trường bắt buộc'
	}),
	address: Joi.string().required().messages({
		'string.empty': 'Địa chỉ không được để trống',
		'any.required': 'Địa chỉ là trường bắt buộc'
	}),
	email: Joi.string().email().required().messages({
		'string.email': 'Email không hợp lệ',
		'string.empty': 'Email không được để trống',
		'any.required': 'Email là trường bắt buộc'
	}),
	phoneNumber: Joi.string().pattern(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/).required().messages({
		'string.pattern.base': 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)',
		'string.empty': 'Số điện thoại không được để trống',
		'any.required': 'Số điện thoại là trường bắt buộc'
	}),
	status: Joi.string().valid(...Object.values(StudentStatus)).default(StudentStatus.ACTIVE).messages({
		'any.only': `Trạng thái phải là một trong các giá trị: ${Object.values(StudentStatus).join(', ')}`,
		'any.required': 'Trạng thái là trường bắt buộc'
	})
});

export const addStudentValidator = validateRequest(addStudentSchema);