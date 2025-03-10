import { Response } from 'express';

interface StatusCodesType {
	OK: number;
	CREATED: number;
	ACCEPTED: number;
	NO_CONTENT: number;
}

interface ReasonPhrasesType {
	OK: string;
	CREATED: string;
	ACCEPTED: string;
	NO_CONTENT: string;
}

const StatusCodes: StatusCodesType = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204
};

const ReasonPhrases: ReasonPhrasesType = {
	OK: 'OK',
	CREATED: 'Created',
	ACCEPTED: 'Accepted',
	NO_CONTENT: 'No Content'
};

interface SuccessResponseOptions {
	message?: string;
	statusCode?: number;
	reasonStatusCode?: string;
	metadata?: Record<string, any>;
}

export class SuccessResponse {
	message: string;
	status: number;
	metadata: Record<string, any>;

	constructor({
		message,
		statusCode = StatusCodes.OK,
		reasonStatusCode = ReasonPhrases.OK,
		metadata = {},
	}: SuccessResponseOptions) {
		this.message = message || reasonStatusCode;
		this.status = statusCode;
		this.metadata = metadata;
	}

	send(res: Response, headers: Record<string, string> = {}): Response {
		return res.status(this.status).json(this);
	}
}

interface ResponseOptions {
	message?: string;
	metadata?: Record<string, any>;
}

export class OK extends SuccessResponse {
	constructor({ message, metadata }: ResponseOptions = {}) {
		super({
			message,
			statusCode: StatusCodes.OK,
			reasonStatusCode: ReasonPhrases.OK,
			metadata,
		});
	}
}

export class CREATED extends SuccessResponse {
	constructor({ message, metadata }: ResponseOptions = {}) {
		super({
			message,
			statusCode: StatusCodes.CREATED,
			reasonStatusCode: ReasonPhrases.CREATED,
			metadata,
		});
	}
}

export class ACCEPTED extends SuccessResponse {
	constructor({ message, metadata }: ResponseOptions = {}) {
		super({
			message,
			statusCode: StatusCodes.ACCEPTED,
			reasonStatusCode: ReasonPhrases.ACCEPTED,
			metadata,
		});
	}
}

export class NO_CONTENT extends SuccessResponse {
	constructor({ message, metadata }: ResponseOptions = {}) {
		super({
			message,
			statusCode: StatusCodes.NO_CONTENT,
			reasonStatusCode: ReasonPhrases.NO_CONTENT,
			metadata,
		});
	}
}