import { Server } from 'http';
import path from 'path';
import compression from 'compression';
import cors from 'cors';
import express, { Router } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { connect, disconnect, set } from 'mongoose';
import morgan from 'morgan';
import {
	CORS_CREDENTIALS,
	CORS_ORIGIN,
	LOG_FORMAT,
	MONGO_CONNECTION_URL,
	NODE_ENV
} from '@/config';
import { AuthMiddleware, errorMiddleware, invalidPathMiddleware } from '@/middlewares';
import { AuthService } from '@/services';
import { logger, stream } from '@/utils/logger';

class App {
	private server: Server | null = null;
	private app: express.Application;

	constructor(router: Router, authService: AuthService) {
		this.app = express();

		this.app.use(express.json());
		this.app.use(morgan(LOG_FORMAT, { stream }));
		this.app.use(cors({ origin: CORS_ORIGIN, credentials: CORS_CREDENTIALS === 'true' }));
		this.app.use(hpp());
		this.app.use(helmet());
		this.app.use(compression());
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));

		this.app.use(['/api/v1/pets', '/api/v1/store'], AuthMiddleware(authService));
		this.app.use('/api/v1', router);

		const options = {
			root: path.resolve(__dirname, '..', 'gen')
		};

		this.app.get('/docs', (req, res) => {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Content-Security-Policy', 'script-src blob:');
			res.header('Content-Security-Policy', 'worker-src blob:');

			res.sendFile('v1.html', options);
		});

		this.app.use(invalidPathMiddleware);
		this.app.use(errorMiddleware);
	}

	private async listen(port: string): Promise<void> {
		return new Promise((resolve) => {
			this.server = this.app.listen(port, () => {
				logger.info(`Server is running on http://localhost:${port}`);
				logger.info(`API documentation is available on http://localhost:${port}/docs`);

				resolve();
			});
		});
	}

	private async connectToMongoDB(): Promise<void> {
		if (NODE_ENV !== 'production') {
			set('debug', true);
		}

		await connect(MONGO_CONNECTION_URL);
		logger.info('MongoDB connected');
	}

	public async start(port: string): Promise<void> {
		await this.connectToMongoDB();
		await this.listen(port);
	}

	public async stop(): Promise<void> {
		await new Promise((resolve, reject) => {
			if (!this.server) {
				return reject(new Error('Server is not running'));
			}

			this.server.close((err) => {
				if (err) {
					return reject(err);
				}

				logger.info('Server closed');

				resolve(void 0);
			});
		});

		await disconnect();
		logger.info('MongoDB connection closed');
	}
}

export default App;
