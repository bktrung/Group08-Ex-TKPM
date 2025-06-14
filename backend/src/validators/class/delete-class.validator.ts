import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from "../../responses/error.responses";

export const deleteClassValidator = (req: Request, res: Response, next: NextFunction) => {
	const { classCode } = req.params;
	
	// Validate class code format
	if (!classCode || typeof classCode !== 'string') {
		return next(new BadRequestError('Class code is required'));
	}
	
	// Basic format validation
	if (classCode.trim().length === 0) {
		return next(new BadRequestError('Class code cannot be empty'));
	}
	
	next();
}; 