import Joi from "joi";
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from "../../responses/error.responses";

export const deleteProgramValidator = (req: Request, res: Response, next: NextFunction) => {
	const { id } = req.params;
	
	// Validate ObjectId format
	if (!id || typeof id !== 'string') {
		return next(new BadRequestError('Program ID is required'));
	}
	
	// Check if it's a valid ObjectId (24 character hex string)
	if (!/^[0-9a-fA-F]{24}$/.test(id)) {
		return next(new BadRequestError('Program ID must be a valid ObjectId'));
	}
	
	next();
}; 