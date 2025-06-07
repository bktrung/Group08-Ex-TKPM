import Joi, { CustomHelpers } from 'joi';
import { Gender, IdentityDocumentType } from "../../models/interfaces/student.interface";
import { validateRequest } from "../../middlewares/validation.middleware";
import configService from "../../configs/init.config";

// Get configuration values
const getAllowedEmailDomains = () => configService.get<string[]>("allowedEmailDomains");
const getPhoneFormats = () => configService.get<Record<string, string>>("phoneFormats");

// Create email validation helper
export const isAllowedEmailDomain = (value: string, helpers: Joi.CustomHelpers) => {
	const allowedDomains = getAllowedEmailDomains();
	if (!allowedDomains || allowedDomains.length === 0) {
		return value;  // If no domains configured, allow all
	}

	const domain = value.split('@')[1];
	if (!allowedDomains.includes(domain)) {
		return helpers.error('string.emailDomain', { domains: allowedDomains.join(', ') });
	}
	return value;
};

// Create phone validation helper that checks against all configured formats
export const isValidPhoneNumber = (value: string, helpers: Joi.CustomHelpers) => {
	const phoneFormats = getPhoneFormats();
	const formats = Object.keys(phoneFormats);

	for (const format of formats) {
		const regex = new RegExp(phoneFormats[format]);
		if (regex.test(value)) {
			return value;
		}
	}

	return helpers.error('string.phoneFormat', { formats: formats.join(', ') });
};

const baseIdentityDocumentSchema = {
	issueDate: Joi.date().required().max('now').messages({
		'date.base': 'Issue date must be a valid date',
		'date.max': 'Issue date cannot be in the future',
		'any.required': 'Issue date is required'
	}),
	issuedBy: Joi.string().required().messages({
		'string.empty': 'Issuing authority cannot be empty',
		'any.required': 'Issuing authority is required'
	}),
	expiryDate: Joi.date().required().min('now').messages({
		'date.base': 'Expiry date must be a valid date',
		'date.min': 'Expiry date must be after current date',
		'any.required': 'Expiry date is required'
	})
};

// CMND schema
const cmndSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.CMND).required(),
	number: Joi.string()
		.pattern(/^[0-9]{9}$/)
		.required()
		.messages({
			'string.empty': 'CMND number cannot be empty',
			'string.pattern.base': 'CMND number must have exactly 9 digits',
			'any.required': 'CMND number is required'
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
			'string.empty': 'CCCD number cannot be empty',
			'string.pattern.base': 'CCCD number must have exactly 12 digits',
			'any.required': 'CCCD number is required'
		}),
	...baseIdentityDocumentSchema,
	hasChip: Joi.boolean().required().messages({
		'any.required': 'Chip information is required'
	})
});

// Passport schema
const passportSchema = Joi.object({
	type: Joi.string().valid(IdentityDocumentType.PASSPORT).required(),
	number: Joi.string()
		.pattern(/^[A-Z][0-9]{8}$/)
		.required()
		.messages({
			'string.empty': 'Passport number cannot be empty',
			'string.pattern.base': 'Passport number must have 1 uppercase letter and 8 digits',
			'any.required': 'Passport number is required'
		}),
	...baseIdentityDocumentSchema,
	issuingCountry: Joi.string().required().messages({
		'string.empty': 'Issuing country cannot be empty',
		'any.required': 'Issuing country is required'
	}),
	notes: Joi.string().optional().allow('').messages({
		'string.base': 'Notes must be a string'
	})
});

// Combined identity document schema with conditional validation
const identityDocumentSchema = Joi.alternatives().try(
	cmndSchema,
	cccdSchema,
	passportSchema
).required().messages({
	'any.required': 'Identity document is required',
	'alternatives.match': 'Identity document is invalid'
});

export const addressSchema = Joi.object({
	houseNumberStreet: Joi.string().required().messages({
		'string.empty': 'House number/street cannot be empty',
		'any.required': 'House number/street is required'
	}),
	wardCommune: Joi.string().required().messages({
		'string.empty': 'Ward/commune cannot be empty',
		'any.required': 'Ward/commune is required'
	}),
	districtCounty: Joi.string().required().messages({
		'string.empty': 'District/county cannot be empty',
		'any.required': 'District/county is required'
	}),
	provinceCity: Joi.string().required().messages({
		'string.empty': 'Province/city cannot be empty',
		'any.required': 'Province/city is required'
	}),
	country: Joi.string().required().messages({
		'string.empty': 'Country cannot be empty',
		'any.required': 'Country is required'
	})
});

export const addStudentSchema = Joi.object({
	studentId: Joi.string()
		.pattern(/^[0-9]{8}$/)
		.required()
		.messages({
			'string.empty': 'Student ID cannot be empty',
			'string.pattern.base': 'Student ID must have exactly 8 digits',
			'any.required': 'Student ID is required'
		}),
	fullName: Joi.string()
		.pattern(/^[A-Za-zÀ-ỹ]+( [A-Za-zÀ-ỹ]+)*$/)
		.required()
		.min(2)
		.max(100)
		.messages({
			'string.empty': 'Full name cannot be empty',
			'string.min': 'Full name must be at least 2 characters',
			'string.max': 'Full name cannot exceed 100 characters',
			'string.pattern.base': 'Full name cannot contain special characters',
			'any.required': 'Full name is required'
		}),
	dateOfBirth: Joi.date().required().max('now').messages({
		'date.base': 'Date of birth must be a valid date',
		'date.max': 'Date of birth cannot be in the future',
		'any.required': 'Date of birth is required'
	}),
	gender: Joi.string().valid(...Object.values(Gender)).required().messages({
		'any.only': `Gender must be one of: ${Object.values(Gender).join(', ')}`,
		'any.required': 'Gender is required'
	}),
	department: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.empty': 'Department ID cannot be empty',
			'string.pattern.base': 'Department ID is invalid (must be MongoDB ObjectId)',
			'any.required': 'Department is required'
		}),
	schoolYear: Joi.number()
		.integer()
		.min(1990)
		.max(new Date().getFullYear())
		.required()
		.messages({
			'number.base': 'School year must be a number',
			'number.integer': 'School year must be an integer',
			'number.min': 'School year must be from 1990 onwards',
			'number.max': `School year cannot exceed current year (${new Date().getFullYear()})`,
			'any.required': 'School year is required'
		}),
	program: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.empty': 'Program ID cannot be empty',
			'string.pattern.base': 'Program ID is invalid (must be MongoDB ObjectId)',
			'any.required': 'Program is required'
		}),
	permanentAddress: addressSchema.optional(),
	temporaryAddress: addressSchema.optional(),
	mailingAddress: addressSchema.required().messages({
		'any.required': 'Mailing address is required'
	}),
	email: Joi.string()
		.email()
		.required()
		.custom(isAllowedEmailDomain)
		.messages({
			'string.email': 'Email is invalid',
			'string.empty': 'Email cannot be empty',
			'any.required': 'Email is required',
			'string.emailDomain': `Email must belong to one of the accepted domains: {#domains}`
		}),
	phoneNumber: Joi.string()
		.required()
		.custom(isValidPhoneNumber)
		.messages({
			'string.empty': 'Phone number cannot be empty',
			'any.required': 'Phone number is required',
			'string.phoneFormat': 'Phone number is invalid (supported formats: {#formats})'
		}),
	status: Joi.string()
		.pattern(/^[0-9a-fA-F]{24}$/)
		.required()
		.messages({
			'string.empty': 'Status ID cannot be empty',
			'string.pattern.base': 'Status ID is invalid (must be MongoDB ObjectId)',
			'any.required': 'Status is required'
		}),
	identityDocument: identityDocumentSchema,
	nationality: Joi.string().required().messages({
		'string.empty': 'Nationality cannot be empty',
		'any.required': 'Nationality is required'
	})
});

export const addStudentValidator = validateRequest(addStudentSchema);