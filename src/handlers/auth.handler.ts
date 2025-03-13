import { TOpenApiExpressFeature, TOpenApiRouter } from 'openapi-ts-router';
import { zValidator } from 'validation-adapters/zod';
import * as z from 'zod';
import { type paths } from '@/gen/v1';
import { AuthService } from '@/services';

export const registerAuthHandlers = (
	router: TOpenApiRouter<[TOpenApiExpressFeature<paths>]>,
	authService: AuthService
) => {
	router.post('/auth/signup', {
		bodyValidator: zValidator(
			z.object({
				firstName: z.string(),
				lastName: z.string(),
				email: z.string().email(),
				password: z.string().min(8)
			})
		),
		handler: async (req, res) => {
			const user = await authService.signup(req.body);

			res.send({
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				createdAt: user.createdAt.toISOString()
			});
		}
	});

	router.post('/auth/signin', {
		bodyValidator: zValidator(
			z.object({
				email: z.string().email(),
				password: z.string().min(8)
			})
		),
		handler: async (req, res) => {
			const { accessToken } = await authService.signin(req.body);

			res.send({
				accessToken
			});
		}
	});
};
