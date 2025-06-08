import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../responses/error.responses';

// Extend Request interface to include i18n - using any to avoid complex typing issues
interface RequestWithI18n extends Request {
	t: any;
}

export const validateRequest = (schema: Joi.ObjectSchema) => {
	return (req: RequestWithI18n, res: Response, next: NextFunction) => {
		const { error } = schema.validate(req.body, {
			abortEarly: false,
			stripUnknown: true
		});

		if (error) {
			// Map validation errors with the new structured key system and fallback
			const translatedErrors = error.details.map(detail => {
				// 1. Build the new structured key (fieldName.errorType)
				const structuredKey = detail.path.join('.') + '.' + detail.type;
				
				// 2. Try to translate with the new structured key first
				let translatedMessage = req.t(structuredKey, detail.context);
				
				// 3. Check if translation failed (i18next returns the key if not found)
				if (translatedMessage === structuredKey) {
					// Fallback to the old method using the full message as key
					translatedMessage = req.t(detail.message, detail.context);
				}
				
				return translatedMessage;
			});

			const errorMessage = translatedErrors.join(', ');
			return next(new BadRequestError(errorMessage));
		}

		next();
	};
};