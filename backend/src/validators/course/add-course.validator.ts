import Joi from "joi";
import { validateRequest } from "../../middlewares/validation.middleware";

export const addCourseSchema = Joi.object({
	courseCode: Joi.string().required().messages({
		"string.empty": "Mã khóa học không được để trống",
		"any.required": "Mã khóa học là trường bắt buộc",
	}),
	name: Joi.string().required().messages({
		"string.empty": "Tên khóa học không được để trống",
		"any.required": "Tên khóa học là trường bắt buộc",
	}),
	credits: Joi.number().integer().min(2).required().messages({
		"number.base": "Số tín chỉ phải là số",
		"number.integer": "Số tín chỉ phải là số nguyên",
		"number.min": "Số tín chỉ phải lớn hơn hoặc bằng 2",
		"any.required": "Số tín chỉ là trường bắt buộc",
	}),
	department: Joi.string().hex().length(24).required().messages({
		"string.empty": "Khoa phụ trách không được để trống",
		"string.hex": "ID khoa không hợp lệ",
		"string.length": "ID khoa phải có độ dài 24 ký tự",
		"any.required": "Khoa phụ trách là trường bắt buộc",
	}),
	description: Joi.string().required().messages({
		"string.empty": "Mô tả khóa học không được để trống",
		"any.required": "Mô tả khóa học là trường bắt buộc",
	}),
	prerequisites: Joi.array().items(
		Joi.string().hex().length(24).messages({
			"string.hex": "ID môn tiên quyết không hợp lệ",
			"string.length": "ID môn tiên quyết phải có độ dài 24 ký tự",
		})
	).optional(),
});

export const addCourseValidator = validateRequest(addCourseSchema);