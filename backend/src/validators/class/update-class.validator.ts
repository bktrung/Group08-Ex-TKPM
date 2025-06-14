import Joi from "joi";
import { validateRequest } from "../../middlewares/validation.middleware";
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from "../../responses/error.responses";

// Validator for individual schedule items (reused from add-class.validator.ts)
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

const updateClassSchema = Joi.object({
	schedule: Joi.array().items(scheduleItemSchema).min(1).optional().messages({
		"array.base": "Lịch học phải là mảng",
		"array.min": "Phải có ít nhất một lịch học",
	}),
	maxCapacity: Joi.number().integer().min(1).optional().messages({
		"number.base": "Sức chứa tối đa phải là số",
		"number.integer": "Sức chứa tối đa phải là số nguyên",
		"number.min": "Sức chứa tối đa phải ít nhất là 1",
	}),
	instructor: Joi.string().optional().messages({
		"string.base": "Giảng viên phải là chuỗi",
	}),
}).custom((value, helpers) => {
	// Validate that schedules don't overlap (if schedule is provided)
	if (value.schedule) {
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
	}

	return value;
}).unknown(false).messages({
	"object.unknown": "Trường '{#label}' không được phép khi cập nhật lớp học"
});

// Class code parameter validator
export const classCodeValidator = (req: Request, res: Response, next: NextFunction) => {
	const { classCode } = req.params;
	
	// Validate class code format
	if (!classCode || typeof classCode !== 'string') {
		return next(new BadRequestError('Class code is required'));
	}
	
	// Basic format validation (you can adjust this pattern as needed)
	if (classCode.trim().length === 0) {
		return next(new BadRequestError('Class code cannot be empty'));
	}
	
	next();
};

// Body validator for update
export const updateClassBodyValidator = validateRequest(updateClassSchema);

export const updateClassValidator = [classCodeValidator, updateClassBodyValidator]; 