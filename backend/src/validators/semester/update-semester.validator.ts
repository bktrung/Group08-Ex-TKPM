import Joi from "joi";
import { validateRequest } from "../../middlewares/validation.middleware";

export const updateSemesterSchema = Joi.object({
	academicYear: Joi.string()
		.pattern(/^\d{4}-\d{4}$/)
		.custom((value, helpers) => {
			const [firstYear, secondYear] = value.split('-').map(Number);
			if (secondYear !== firstYear + 1) {
				return helpers.message({
					custom: "Academic year second year must be consecutive to first year (e.g: 2024-2025)"
				});
			}
			return value;
		})
		.optional()
		.messages({
			'string.empty': 'Academic year cannot be empty',
			'string.pattern.base': 'Academic year must be in format YYYY-YYYY (e.g: 2024-2025)'
		}),
	semester: Joi.number()
		.valid(1, 2, 3)
		.optional()
		.messages({
			'number.base': 'Semester must be a number',
			'any.only': 'Semester must be 1, 2, or 3'
		}),
	registrationStartDate: Joi.date()
		.optional()
		.messages({
			'date.base': 'Registration start date must be a valid date'
		}),
	registrationEndDate: Joi.date()
		.optional()
		.when('registrationStartDate', {
			is: Joi.exist(),
			then: Joi.date().greater(Joi.ref('registrationStartDate'))
		})
		.messages({
			'date.base': 'Registration end date must be a valid date',
			'date.greater': 'Registration end date must be after registration start date'
		}),
	dropDeadline: Joi.date()
		.optional()
		.when('registrationEndDate', {
			is: Joi.exist(),
			then: Joi.date().greater(Joi.ref('registrationEndDate'))
		})
		.messages({
			'date.base': 'Drop deadline must be a valid date',
			'date.greater': 'Drop deadline must be after registration end date'
		}),
	semesterStartDate: Joi.date()
		.optional()
		.messages({
			'date.base': 'Semester start date must be a valid date'
		}),
	semesterEndDate: Joi.date()
		.optional()
		.when('semesterStartDate', {
			is: Joi.exist(),
			then: Joi.date().greater(Joi.ref('semesterStartDate'))
		})
		.messages({
			'date.base': 'Semester end date must be a valid date',
			'date.greater': 'Semester end date must be after semester start date'
		}),
}).custom((value, helpers) => {
	// Additional validation for date logic when updating partial fields
	// We need to ensure all date relationships are valid even with partial updates
	const {
		registrationStartDate,
		registrationEndDate,
		dropDeadline,
		semesterStartDate,
		semesterEndDate
	} = value;

	// If both registration dates are provided, validate order
	if (registrationStartDate && registrationEndDate && registrationEndDate <= registrationStartDate) {
		return helpers.message({
			custom: "Registration end date must be after registration start date"
		});
	}

	// If drop deadline and registration end date are provided, validate order
	if (registrationEndDate && dropDeadline && dropDeadline <= registrationEndDate) {
		return helpers.message({
			custom: "Drop deadline must be after registration end date"
		});
	}

	// If both semester dates are provided, validate order
	if (semesterStartDate && semesterEndDate && semesterEndDate <= semesterStartDate) {
		return helpers.message({
			custom: "Semester end date must be after semester start date"
		});
	}

	return value;
});

export const updateSemesterValidator = validateRequest(updateSemesterSchema); 