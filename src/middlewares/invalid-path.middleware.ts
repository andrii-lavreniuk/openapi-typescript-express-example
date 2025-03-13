import type express from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from 'openapi-ts-router';

export function invalidPathMiddleware(
	req: express.Request,
	_res: express.Response,
	next: express.NextFunction
): void {
	next(
		new AppError('#ERR_PATH_NOT_FOUND', StatusCodes.NOT_FOUND, {
			description: `The specified path '${req.path}' does not exist!`
		})
	);
}
