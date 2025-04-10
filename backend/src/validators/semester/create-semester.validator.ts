import Joi from "joi";
import { validateRequest } from "../../middlewares/validation.middleware";

export const createSemesterSchema = Joi.object({
	academicYear: Joi.string()
		.pattern(/^\d{4}-\d{4}$/)
		.custom((value, helpers) => {
			const [firstYear, secondYear] = value.split('-').map(Number);
			if (secondYear !== firstYear + 1) {
				return helpers.message({
					custom: "Năm thứ hai phải là năm kế tiếp của năm thứ nhất (ví dụ: 2024-2025)"
				});
			}
			return value;
		})
		.required()
		.messages({
			'string.empty': 'Năm học không được để trống',
			'string.pattern.base': 'Năm học phải có định dạng YYYY-YYYY (vd: 2024-2025)',
			'any.required': 'Năm học là trường bắt buộc'
		}),
	semester: Joi.number()
		.valid(1, 2, 3)
		.required()
		.messages({
			'number.base': 'Học kỳ phải là một số',
			'any.only': 'Học kỳ phải là 1, 2, hoặc 3',
			'any.required': 'Học kỳ là trường bắt buộc'
		}),
	registrationStartDate: Joi.date()
		.required()
		.messages({
			'date.base': 'Ngày bắt đầu đăng ký phải là một ngày hợp lệ',
			'any.required': 'Ngày bắt đầu đăng ký là trường bắt buộc'
		}),
	registrationEndDate: Joi.date()
		.required()
		.greater(Joi.ref('registrationStartDate'))
		.messages({
			'date.base': 'Ngày kết thúc đăng ký phải là một ngày hợp lệ',
			'date.greater': 'Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký',
			'any.required': 'Ngày kết thúc đăng ký là trường bắt buộc'
		}),
	dropDeadline: Joi.date()
		.required()
		.greater(Joi.ref('registrationEndDate'))
		.messages({
			'date.base': 'Hạn chót rút học phần phải là một ngày hợp lệ',
			'date.greater': 'Hạn chót rút học phần phải sau ngày kết thúc đăng ký',
			'any.required': 'Hạn chót rút học phần là trường bắt buộc'
		}),
	semesterStartDate: Joi.date()
		.required()
		.messages({
			'date.base': 'Ngày bắt đầu học kỳ phải là một ngày hợp lệ',
			'any.required': 'Ngày bắt đầu học kỳ là trường bắt buộc'
		}),
	semesterEndDate: Joi.date()
		.required()
		.greater(Joi.ref('semesterStartDate'))
		.messages({
			'date.base': 'Ngày kết thúc học kỳ phải là một ngày hợp lệ',
			'date.greater': 'Ngày kết thúc học kỳ phải sau ngày bắt đầu học kỳ',
			'any.required': 'Ngày kết thúc học kỳ là trường bắt buộc'
		}),
});

export const createSemesterValidator = validateRequest(createSemesterSchema);