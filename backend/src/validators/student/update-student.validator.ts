import Joi from "joi";
import { Gender, IdentityDocumentType } from "../../models/interfaces/student.interface";
import { validateRequest } from "../../middlewares/validation.middleware";
import { addressSchema } from "./add-student.validator";
import { isAllowedEmailDomain, isValidPhoneNumber } from "./add-student.validator";

const baseUpdateIdentityDocumentSchema = {
	issueDate: Joi.date().max('now').messages({
		'date.base': 'Issue date must be a valid date',
		'date.max': 'Issue date cannot be in the future'
	}),
	issuedBy: Joi.string().messages({
		'string.empty': 'Issuing authority cannot be empty'
	}),
	expiryDate: Joi.date().min('now').messages({
		'date.base': 'Expiry date must be a valid date',
		'date.min': 'Expiry date must be after current date'
	})
};

// CMND schema for updates
const updateCmndSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.CMND),
	number: Joi.string()
		.pattern(/^[0-9]{9}$/)
		.messages({
			'string.empty': 'CMND number cannot be empty',
			'string.pattern.base': 'CMND number must have exactly 9 digits',
			'any.required': 'CMND number is required'
		}),
	...baseUpdateIdentityDocumentSchema
});

// CCCD schema for updates
const updateCccdSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.CCCD),
	number: Joi.string()
		.pattern(/^[0-9]{12}$/)
		.messages({
			'string.empty': 'CCCD number cannot be empty',
			'string.pattern.base': 'CCCD number must have exactly 12 digits',
			'any.required': 'CCCD number is required'
		}),
	...baseUpdateIdentityDocumentSchema,
	hasChip: Joi.boolean().messages({
		'boolean.base': 'Chip information must be a boolean value'
	})
});

// Passport schema for updates
const updatePassportSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.PASSPORT),
	number: Joi.string()
		.pattern(/^[A-Z][0-9]{8}$/)
		.messages({
			'string.empty': 'Passport number cannot be empty',
			'string.pattern.base': 'Passport number must have 1 uppercase letter and 8 digits',
			'any.required': 'Passport number is required'
		}),
	...baseUpdateIdentityDocumentSchema,
	issuingCountry: Joi.string().messages({
		'string.empty': 'Issuing country cannot be empty'
	}),
	notes: Joi.string().allow('').messages({
		'string.base': 'Notes must be a string'
	})
});

// Combined identity document schema for updates
const updateIdentityDocumentSchema = Joi.alternatives().try(
	updateCmndSchema,
	updateCccdSchema,
	updatePassportSchema
).messages({
	'alternatives.match': 'Identity document is invalid'
});

const updateStudentDto = Joi.object({
	fullName: Joi.string()
		.pattern(/^[A-Za-zÀ-ỹ]+( [A-Za-zÀ-ỹ]+)*$/)
		.min(2)
		.max(100)
		.messages({
			'string.empty': 'Full name cannot be empty',
			'string.min': 'Full name must be at least 2 characters',
			'string.max': 'Full name cannot exceed 100 characters',
			'string.pattern.base': 'Full name cannot contain special characters'
		}),
	dateOfBirth: Joi.date().max('now').messages({
		'date.base': 'Date of birth must be a valid date',
		'date.max': 'Date of birth cannot be in the future'
	}),
	gender: Joi.string().valid(...Object.values(Gender)).messages({
		'any.only': `Gender must be one of: ${Object.values(Gender).join(', ')}`
	}),
	department: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.messages({
			'string.empty': 'Department ID cannot be empty',
			'string.pattern.base': 'Department ID is invalid (must be MongoDB ObjectId)'
		}),
	schoolYear: Joi.number()
		.integer()
		.min(1990)
		.max(new Date().getFullYear())
		.messages({
			'number.base': 'School year must be a number',
			'number.integer': 'School year must be an integer',
			'number.min': 'School year must be from 1990 onwards',
			'number.max': `School year cannot exceed current year (${new Date().getFullYear()})`
		}),
	program: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.messages({
			'string.empty': 'Program ID cannot be empty',
			'string.pattern.base': 'Program ID is invalid (must be MongoDB ObjectId)'
		}),
	permanentAddress: addressSchema.optional(),
	temporaryAddress: addressSchema.optional(),
	mailingAddress: addressSchema.optional(),
	email: Joi.string()
		.email()
		.custom(isAllowedEmailDomain)
		.messages({
			'string.email': 'Email is invalid',
			'string.empty': 'Email cannot be empty',
			'string.emailDomain': `Email must belong to one of the accepted domains: {#domains}`
		}),
	phoneNumber: Joi.string()
		.custom(isValidPhoneNumber)
		.messages({
			'string.empty': 'Phone number cannot be empty',
			'string.phoneFormat': 'Phone number is invalid (supported formats: {#formats})'
		}),
	status: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.messages({
			'string.empty': 'Status ID cannot be empty',
			'string.pattern.base': 'Status ID is invalid (must be MongoDB ObjectId)'
		}),
	identityDocument: updateIdentityDocumentSchema,
	nationality: Joi.string().messages({
		'string.empty': 'Nationality cannot be empty'
	})
}).min(1).messages({
	'object.min': 'At least one field must be provided for update'
}).unknown(false).messages({
	'object.unknown': 'Field "{#label}" is not allowed in student update'
});

export const updateStudentValidator = validateRequest(updateStudentDto);