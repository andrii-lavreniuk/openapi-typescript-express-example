import { StatusCodes } from 'http-status-codes';
import { TOpenApiExpressFeature, TOpenApiRouter } from 'openapi-ts-router';
import { zValidator } from 'validation-adapters/zod';
import * as z from 'zod';
import { type paths } from '@/gen/v1';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { OrdersService } from '@/services';

export const registerOrdersHandlers = (
	router: TOpenApiRouter<[TOpenApiExpressFeature<paths>]>,
	ordersService: OrdersService
) => {
	router.post('/store/orders', {
		bodyValidator: zValidator(
			z.object({
				petId: z.string()
			})
		),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const order = await ordersService.createOrder(userId, req.body);

			res.send({
				id: order.id,
				petId: order.petId,
				status: order.status,
				isComplete: order.isComplete,
				createdAt: order.createdAt.toISOString()
			});
		}
	});

	router.get('/store/orders', {
		queryValidator: zValidator(
			z.object({
				status: z.enum(['placed', 'approved', 'canceled', 'delivered']).optional()
			})
		),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const params = {
				status: req.query.status
			};

			const orders = await ordersService.findOrders(userId, params);

			res.send(
				orders.map((order) => ({
					id: order.id,
					petId: order.petId,
					status: order.status,
					isComplete: order.isComplete,
					createdAt: order.createdAt.toISOString()
				}))
			);
		}
	});

	router.get('/store/orders/{orderId}', {
		pathValidator: zValidator(
			z.object({
				orderId: z.string()
			})
		),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const order = await ordersService.getOrderById(userId, req.params.orderId);

			res.send({
				id: order.id,
				petId: order.petId,
				status: order.status,
				isComplete: order.isComplete,
				createdAt: order.createdAt.toISOString()
			});
		}
	});

	router.post('/store/orders/{orderId}/cancel', {
		pathValidator: zValidator(
			z.object({
				orderId: z.string()
			})
		),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;

			await ordersService.cancelOrder(userId, req.params.orderId);

			res.status(StatusCodes.OK);
			res.send();
		}
	});
};
