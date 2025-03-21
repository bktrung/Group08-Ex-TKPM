import Joi from "joi";
import { Gender, IdentityDocumentType } from "../../models/interfaces/student.interface";
import { validateRequest } from "../../middlewares/validation.middleware";

const baseIdentityDocumentSchema = {
	issueDate: Joi.date().required().max('now').messages({
		'date.base': 'Ngày cấp phải là một ngày hợp lệ',
		'date.max': 'Ngày cấp không thể trong tương lai',
		'any.required': 'Ngày cấp là trường bắt buộc'
	}),
	issuedBy: Joi.string().required().messages({
		'string.empty': 'Nơi cấp không được để trống',
		'any.required': 'Nơi cấp là trường bắt buộc'
	}),
	expiryDate: Joi.date().required().min('now').messages({
		'date.base': 'Ngày hết hạn phải là một ngày hợp lệ',
		'date.min': 'Ngày hết hạn phải sau ngày hiện tại',
		'any.required': 'Ngày hết hạn là trường bắt buộc'
	})
};

// CMND schema
const cmndSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.CMND).required(),
	number: Joi.string()
		.pattern(/^[0-9]{9}$/)
		.required()
		.messages({
			'string.empty': 'Số CMND không được để trống',
			'string.pattern.base': 'Số CMND phải có đúng 9 chữ số',
			'any.required': 'Số CMND là trường bắt buộc'
		}),
	...baseIdentityDocumentSchema
});

// CCCD schema
const cccdSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.CCCD).required(),
	number: Joi.string()
		.pattern(/^[0-9]{12}$/)
		.required()
		.messages({
			'string.empty': 'Số CCCD không được để trống',
			'string.pattern.base': 'Số CCCD phải có đúng 12 chữ số',
			'any.required': 'Số CCCD là trường bắt buộc'
		}),
	...baseIdentityDocumentSchema,
	hasChip: Joi.boolean().required().messages({
		'any.required': 'Thông tin về chip là trường bắt buộc'
	})
});

// Passport schema
const passportSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.PASSPORT).required(),
	number: Joi.string()
		.pattern(/^[A-Z][0-9]{8}$/)
		.required()
		.messages({
			'string.empty': 'Số hộ chiếu không được để trống',
			'string.pattern.base': 'Số hộ chiếu phải có 1 chữ cái viết hoa và 8 chữ số',
			'any.required': 'Số hộ chiếu là trường bắt buộc'
		}),
	...baseIdentityDocumentSchema,
	issuingCountry: Joi.string().required().messages({
		'string.empty': 'Quốc gia cấp không được để trống',
		'any.required': 'Quốc gia cấp là trường bắt buộc'
	}),
	notes: Joi.string().optional().allow('').messages({
		'string.base': 'Ghi chú phải là chuỗi'
	})
});

// Combined identity document schema with conditional validation
const identityDocumentSchema = Joi.alternatives().try(
	cmndSchema,
	cccdSchema,
	passportSchema
).required().messages({
	'any.required': 'Giấy tờ tùy thân là trường bắt buộc',
	'alternatives.match': 'Giấy tờ tùy thân không hợp lệ'
});

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

export const addStudentSchema = Joi.object({
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
		}),
	identityDocument: identityDocumentSchema,
	nationality: Joi.string().required().messages({
		'string.empty': 'Quốc tịch không được để trống',
		'any.required': 'Quốc tịch là trường bắt buộc'
	})
});

export const addStudentValidator = validateRequest(addStudentSchema);