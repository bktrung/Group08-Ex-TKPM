interface StatusCodesType {
	CONFLICT: number;
	BAD_REQUEST: number;
	UNAUTHORIZED: number;
	NOT_FOUND: number;
	FORBIDDEN: number;
}

interface ReasonPhrasesType {
	CONFLICT: string;
	BAD_REQUEST: string;
	UNAUTHORIZED: string;
	NOT_FOUND: string;
	FORBIDDEN: string;
}

const StatusCodes: StatusCodesType = {
	CONFLICT: 409,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
	FORBIDDEN: 403,
}

const ReasonPhrases: ReasonPhrasesType = {
	CONFLICT: 'Conflict',
	BAD_REQUEST: 'Bad Request',
	UNAUTHORIZED: 'Unauthorized',
	NOT_FOUND: 'Not Found',
	FORBIDDEN: 'Forbidden',
}

export class ErrorResponse extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;

		// This is necessary for proper instanceof checks with extended Error classes
		Object.setPrototypeOf(this, new.target.prototype);
		Error.captureStackTrace(this, this.constructor);
	}
}

export class ConflictRequestError extends ErrorResponse {
	constructor(
		message: string = ReasonPhrases.CONFLICT,
		statusCode: number = StatusCodes.CONFLICT
	) {
		super(message, statusCode);
	}
}

export class BadRequestError extends ErrorResponse {
	constructor(
		message: string = ReasonPhrases.BAD_REQUEST,
		statusCode: number = StatusCodes.BAD_REQUEST
	) {
		super(message, statusCode);
	}
}

export class AuthFailureError extends ErrorResponse {
	constructor(
		message: string = ReasonPhrases.UNAUTHORIZED,
		statusCode: number = StatusCodes.UNAUTHORIZED
	) {
		super(message, statusCode);
	}
}

export class NotFoundError extends ErrorResponse {
	constructor(
		message: string = ReasonPhrases.NOT_FOUND,
		statusCode: number = StatusCodes.NOT_FOUND
	) {
		super(message, statusCode);
	}
}

export class ForbiddenError extends ErrorResponse {
	constructor(
		message: string = ReasonPhrases.FORBIDDEN,
		statusCode: number = StatusCodes.FORBIDDEN
	) {
		super(message, statusCode);
	}
}