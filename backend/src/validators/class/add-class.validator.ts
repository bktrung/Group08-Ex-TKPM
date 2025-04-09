import Joi from "joi";
import { validateRequest } from "../../middlewares/validation.middleware";

// Validator for individual schedule items
const scheduleItemSchema = Joi.object({
	dayOfWeek: Joi.number().integer().min(2).max(7).required().messages({
		"number.base": "Ngày trong tuần phải là số",
		"number.integer": "Ngày trong tuần phải là số nguyên",
		"number.min": "Ngày trong tuần phải từ 2 (Thứ Hai) đến 7 (Thứ Bảy)",
		"number.max": "Ngày trong tuần phải từ 2 (Thứ Hai) đến 7 (Thứ Bảy)",
		"any.required": "Ngày trong tuần là bắt buộc",
	}),
	startPeriod: Joi.number().integer().min(1).max(10).required().messages({
		"number.base": "Tiết bắt đầu phải là số",
		"number.integer": "Tiết bắt đầu phải là số nguyên",
		"number.min": "Tiết bắt đầu phải từ 1 đến 10",
		"number.max": "Tiết bắt đầu phải từ 1 đến 10",
		"any.required": "Tiết bắt đầu là bắt buộc",
	}),
	endPeriod: Joi.number().integer().min(1).max(10).required().messages({
		"number.base": "Tiết kết thúc phải là số",
		"number.integer": "Tiết kết thúc phải là số nguyên",
		"number.min": "Tiết kết thúc phải từ 1 đến 10",
		"number.max": "Tiết kết thúc phải từ 1 đến 10",
		"any.required": "Tiết kết thúc là bắt buộc",
	}),
	classroom: Joi.string().required().messages({
		"string.empty": "Phòng học không được để trống",
		"any.required": "Phòng học là bắt buộc",
	}),
}).custom((value, helpers) => {
	// Custom validation to ensure endPeriod >= startPeriod
	if (value.endPeriod < value.startPeriod) {
		return helpers.message({
			custom: 'Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu'
		});
	}
	return value;
});

// Main class validator
export const addClassSchema = Joi.object({
	classCode: Joi.string().required().messages({
		"string.empty": "Mã lớp không được để trống",
		"any.required": "Mã lớp là bắt buộc",
	}),
	course: Joi.string().hex().length(24).required().messages({
		"string.empty": "Mã môn học không được để trống",
		"string.hex": "ID môn học không hợp lệ",
		"string.length": "ID môn học phải có độ dài 24 ký tự",
		"any.required": "Môn học là bắt buộc",
	}),
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
			"string.empty": "Năm học không được để trống",
			"string.pattern.base": "Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)",
			"any.required": "Năm học là bắt buộc",
		}),
	semester: Joi.number().valid(1, 2, 3).required().messages({
		"number.base": "Học kỳ phải là số",
		"any.only": "Học kỳ phải là 1, 2, hoặc 3",
		"any.required": "Học kỳ là bắt buộc",
	}),
	instructor: Joi.string().required().messages({
		"string.empty": "Giảng viên không được để trống",
		"any.required": "Giảng viên là bắt buộc",
	}),
	maxCapacity: Joi.number().integer().min(1).required().messages({
		"number.base": "Sĩ số tối đa phải là số",
		"number.integer": "Sĩ số tối đa phải là số nguyên",
		"number.min": "Sĩ số tối đa phải ít nhất là 1",
		"any.required": "Sĩ số tối đa là bắt buộc",
	}),
	schedule: Joi.array().items(scheduleItemSchema).min(1).required().messages({
		"array.base": "Lịch học phải là mảng",
		"array.min": "Phải có ít nhất một lịch học",
		"any.required": "Lịch học là bắt buộc",
	}),
}).custom((value, helpers) => {
	// Validate that schedules don't overlap
	const schedules = value.schedule;

	for (let i = 0; i < schedules.length; i++) {
		for (let j = i + 1; j < schedules.length; j++) {
			const scheduleA = schedules[i];
			const scheduleB = schedules[j];

			// If same day, check for period overlap
			if (scheduleA.dayOfWeek === scheduleB.dayOfWeek) {
				// Check if scheduleA overlaps with scheduleB
				const aStartsInB = scheduleA.startPeriod >= scheduleB.startPeriod &&
					scheduleA.startPeriod <= scheduleB.endPeriod;
				const aEndsInB = scheduleA.endPeriod >= scheduleB.startPeriod &&
					scheduleA.endPeriod <= scheduleB.endPeriod;
				const aCoversB = scheduleA.startPeriod <= scheduleB.startPeriod &&
					scheduleA.endPeriod >= scheduleB.endPeriod;

				if (aStartsInB || aEndsInB || aCoversB) {
					return helpers.message({
						custom: `Lịch học bị trùng vào thứ ${scheduleA.dayOfWeek} giữa tiết ${scheduleA.startPeriod}-${scheduleA.endPeriod} và tiết ${scheduleB.startPeriod}-${scheduleB.endPeriod}`
					});
				}
			}
		}
	}

	return value;
}).unknown(false).messages({
	"object.unknown": "Trường '{#label}' không được phép khi tạo lớp học"
});

export const addClassValidator = validateRequest(addClassSchema);