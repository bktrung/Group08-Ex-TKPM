import Joi from "joi";
import { Gender } from "../../models/student.model";
import { validateRequest } from "../../middlewares/validation.middleware";

export const addressSchema = Joi.object({
	houseNumberStreet: Joi.string().required().messages({
		'string.empty': 'Số nhà, đường không được để trống',
		'any.required': 'Số nhà, đường là trường bắt buộc'
	}),
	wardCommune: Joi.string().required().messages({
		'string.empty': 'Phường/Xã không được để trống',
		'any.required': 'Phường/Xã là trường bắt buộc'
	}),
	districtCounty: Joi.string().required().messages({
		'string.empty': 'Quận/Huyện không được để trống',
		'any.required': 'Quận/Huyện là trường bắt buộc'
	}),
	provinceCity: Joi.string().required().messages({
		'string.empty': 'Tỉnh/Thành phố không được để trống',
		'any.required': 'Tỉnh/Thành phố là trường bắt buộc'
	}),
	country: Joi.string().required().messages({
		'string.empty': 'Quốc gia không được để trống',
		'any.required': 'Quốc gia là trường bắt buộc'
	})
});

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
	department: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.empty': 'ID khoa không được để trống',
			'string.pattern.base': 'ID khoa không hợp lệ (phải là ObjectId MongoDB)',
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
	program: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.empty': 'ID chương trình học không được để trống',
			'string.pattern.base': 'ID chương trình học không hợp lệ (phải là ObjectId MongoDB)',
			'any.required': 'Chương trình học là trường bắt buộc'
		}),
	permanentAddress: addressSchema.optional(),
	temporaryAddress: addressSchema.optional(),
	mailingAddress: addressSchema.required().messages({
		'any.required': 'Địa chỉ nhận thư là trường bắt buộc'
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
	status: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.empty': 'ID trạng thái không được để trống',
			'string.pattern.base': 'ID trạng thái không hợp lệ (phải là ObjectId MongoDB)',
			'any.required': 'Trạng thái là trường bắt buộc'
		})
});

export const addStudentValidator = validateRequest(addStudentSchema);