import type express from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from 'openapi-ts-router';
import { SchemaAppError } from '@/gen/v1';

export function errorMiddleware(
	err: unknown,
	_req: express.Request,
	res: express.Response,
	_next: express.NextFunction
): void {
	let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
	const jsonResponse: SchemaAppError = {
		code: '#ERR_UNKNOWN',
		description: 'An unknown error occurred!',
		additionalErrors: []
	};

	// Handle application-specific errors (instances of AppError)
	if (err instanceof AppError) {
		statusCode = err.status;
		jsonResponse.code = err.code;
		jsonResponse.description = err.description;
		jsonResponse.additionalErrors = err.additionalErrors as any;
	}

	// Handle unknown errors
	else if (typeof err === 'object' && err != null) {
		if ('message' in err && typeof err.message === 'string') {
			jsonResponse.description = err.message;
		}
		if ('code' in err && typeof err.code === 'string') {
			jsonResponse.code = err.code;
		}
	}

	res.status(statusCode).json(jsonResponse);
}
