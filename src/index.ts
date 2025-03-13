import { Router } from 'express';
import { createExpressOpenApiRouter } from 'openapi-ts-router';
import App from '@/app';
import { PORT } from '@/config';
import { type paths } from '@/gen/v1';
import { registerAuthHandlers, registerOrdersHandlers, registerPetsHandlers } from '@/handlers';
import { AuthService, OrdersService, PetsService } from '@/services';
import { logger } from '@/utils/logger';

const authService = new AuthService();
const petsService = new PetsService();
const ordersService = new OrdersService();

const router: Router = Router();
const openApiRouter = createExpressOpenApiRouter<paths>(router);

registerAuthHandlers(openApiRouter, authService);
registerPetsHandlers(openApiRouter, petsService);
registerOrdersHandlers(openApiRouter, ordersService);

const app = new App(router, authService);

app.start(PORT).catch((err) => {
	logger.error(err);
	process.exit(1);
});

process.on('SIGTERM', () => {
	app.stop().then(() => {
		logger.info('Application stopped');
	});
});
