import Joi from "joi";
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from "../../responses/error.responses";

export const deleteStudentStatusValidator = (req: Request, res: Response, next: NextFunction) => {
	const { statusId } = req.params;
	
	// Validate ObjectId format
	if (!statusId || typeof statusId !== 'string') {
		return next(new BadRequestError('Status ID is required'));
	}
	
	// Check if it's a valid ObjectId (24 character hex string)
	if (!/^[0-9a-fA-F]{24}$/.test(statusId)) {
		return next(new BadRequestError('Status ID must be a valid ObjectId'));
	}
	
	next();
}; 