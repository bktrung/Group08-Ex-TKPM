import { Request, Response, NextFunction } from 'express';
import Logger from '../services/logger.service';
import mongoose from 'mongoose';

export const errorLogger = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Get the status code
	const statusCode = err.status || err.statusCode || 500;

	// For now only log server error
	if (statusCode === 500) {
		// Determine error category
		let errorCategory = 'SERVER';

		// Check for MongoDB related errors
		if (
			err.name === 'MongoError' ||
			err.name === 'MongoServerError' ||
			err instanceof mongoose.Error
		) {
			errorCategory = 'DATABASE';
		}

		// Base log data without stack trace
		const logData = {
			url: req.originalUrl,
			method: req.method,
			statusCode: statusCode
		};

		// Only include stack trace in development
		if (process.env.NODE_ENV === 'dev') {
			Logger.error(`[${errorCategory}] ${err.message}`, {
				...logData,
				stack: err.stack || 'No stack trace available'
			});
		} else {
			// In production, log without stack trace
			Logger.error(`[${errorCategory}] ${err.message}`, logData);
		}
	}

	next(err);
};