import Joi from "joi";
import { validateRequest } from "../../middlewares/validation.middleware";

export const updateCourseSchema = Joi.object({
	name: Joi.string().messages({
		"string.empty": "Tên khóa học không được để trống",
	}),
	credits: Joi.number().integer().min(2).messages({
		"number.base": "Số tín chỉ phải là số",
		"number.integer": "Số tín chỉ phải là số nguyên",
		"number.min": "Số tín chỉ phải lớn hơn hoặc bằng 2",
	}),
	department: Joi.string().hex().length(24).messages({
		"string.empty": "Khoa phụ trách không được để trống",
		"string.hex": "ID khoa không hợp lệ",
		"string.length": "ID khoa phải có độ dài 24 ký tự",
	}),
	description: Joi.string().messages({
		"string.empty": "Mô tả khóa học không được để trống",
	}),
}).min(1).messages({
	"object.min": "Cần cung cấp ít nhất một trường để cập nhật",
}).unknown(false).messages({
	"object.unknown": "Trường '{#label}' không được phép trong cập nhật khóa học"
});

export const updateCourseValidator = validateRequest(updateCourseSchema);