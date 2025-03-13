import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from 'openapi-ts-router';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { AuthService } from '@/services';

export function AuthMiddleware(authService: AuthService) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = (req.header('Authorization') || '').split('Bearer ')[1] || null;

			if (!token) {
				return next(
					new AppError('#ERR_UNAUTHORIZED', StatusCodes.UNAUTHORIZED, {
						description: 'Authentication token is missing'
					})
				);
			}

			const user = await authService.verifyToken(token);
			if (!user) {
				return next(
					new AppError('#ERR_UNAUTHORIZED', StatusCodes.UNAUTHORIZED, {
						description: 'Wrong authentication token'
					})
				);
			}

			(req as RequestWithUser<typeof req>).user = user;

			next();
		} catch (error: unknown) {
			let description = 'An unknown error occurred!';

			if (error instanceof Error) {
				description = error.message;
			} else if (
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof error.message === 'string'
			) {
				description = error.message;
			} else if (typeof error === 'string') {
				description = error;
			}

			return next(
				new AppError('#ERR_UNAUTHORIZED', StatusCodes.UNAUTHORIZED, {
					description
				})
			);
		}
	};
}
