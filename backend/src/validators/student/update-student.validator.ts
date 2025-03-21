import Joi from "joi";
import { Gender, IdentityDocumentType } from "../../models/interfaces/student.interface";
import { validateRequest } from "../../middlewares/validation.middleware";
import { addressSchema } from "./add-student.validator";

const baseUpdateIdentityDocumentSchema = {
	issueDate: Joi.date().max('now').messages({
		'date.base': 'Ngày cấp phải là một ngày hợp lệ',
		'date.max': 'Ngày cấp không thể trong tương lai'
	}),
	issuedBy: Joi.string().messages({
		'string.empty': 'Nơi cấp không được để trống'
	}),
	expiryDate: Joi.date().min('now').messages({
		'date.base': 'Ngày hết hạn phải là một ngày hợp lệ',
		'date.min': 'Ngày hết hạn phải sau ngày hiện tại'
	})
};

// CMND schema for updates
const updateCmndSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.CMND),
	number: Joi.string()
		.pattern(/^[0-9]{9}$/)
		.messages({
			'string.empty': 'Số CMND không được để trống',
			'string.pattern.base': 'Số CMND phải có đúng 9 chữ số',
			'any.required': 'Số CMND là trường bắt buộc'
		}),
	...baseUpdateIdentityDocumentSchema
});

// CCCD schema for updates
const updateCccdSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.CCCD),
	number: Joi.string()
		.pattern(/^[0-9]{12}$/)
		.messages({
			'string.empty': 'Số CCCD không được để trống',
			'string.pattern.base': 'Số CCCD phải có đúng 12 chữ số',
			'any.required': 'Số CCCD là trường bắt buộc'
		}),
	...baseUpdateIdentityDocumentSchema,
	hasChip: Joi.boolean().messages({
		'boolean.base': 'Thông tin về chip phải là giá trị boolean'
	})
});

// Passport schema for updates
const updatePassportSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.PASSPORT),
	number: Joi.string()
		.pattern(/^[A-Z][0-9]{8}$/)
		.messages({
			'string.empty': 'Số hộ chiếu không được để trống',
			'string.pattern.base': 'Số hộ chiếu phải có 1 chữ cái viết hoa và 8 chữ số',
			'any.required': 'Số hộ chiếu là trường bắt buộc'
		}),
	...baseUpdateIdentityDocumentSchema,
	issuingCountry: Joi.string().messages({
		'string.empty': 'Quốc gia cấp không được để trống'
	}),
	notes: Joi.string().allow('').messages({
		'string.base': 'Ghi chú phải là chuỗi'
	})
});

// Combined identity document schema for updates
const updateIdentityDocumentSchema = Joi.alternatives().try(
	updateCmndSchema,
	updateCccdSchema,
	updatePassportSchema
).messages({
	'alternatives.match': 'Giấy tờ tùy thân không hợp lệ'
});

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
		}),
	identityDocument: updateIdentityDocumentSchema,
	nationality: Joi.string().messages({
		'string.empty': 'Quốc tịch không được để trống'
	})
}).min(1).messages({
	'object.min': 'Cần cung cấp ít nhất một trường để cập nhật'
});

export const updateStudentValidator = validateRequest(updateStudentDto);