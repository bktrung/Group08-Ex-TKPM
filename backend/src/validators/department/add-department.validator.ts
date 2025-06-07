import * as Joi from 'joi';

export const addDepartmentSchema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Department name cannot be empty',
		'any.required': 'Department is required'
	})
}); 