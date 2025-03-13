import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
	NODE_ENV = 'development',
	PORT = '3000',
	MONGO_CONNECTION_URL = 'mongodb://localhost:27017/petstore',
	JWT_SECRET_KEY = 'secret',
	JWT_EXPIRES_IN = '600',
	LOG_FORMAT = ':status - :method :url',
	CORS_ORIGIN = 'http://localhost:3000',
	CORS_CREDENTIALS = 'true'
} = process.env;
