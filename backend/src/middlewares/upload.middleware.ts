import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../responses/error.responses";
import importService from "../services/import.service";

export const fileUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
	importService.getUploader()(req, res, (err) => {
		if (err) {
			// Handle multer-specific errors
			return next(new BadRequestError(`File upload error: ${err.message}`));
		}
		// Continue to the next middleware or controller
		next();
	});
};