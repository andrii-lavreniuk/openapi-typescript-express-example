import { StatusCodes } from 'http-status-codes';
import { sign, verify } from 'jsonwebtoken';
import { AppError } from 'openapi-ts-router';
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from '@/config';
import { SchemaSignin, SchemaSignup } from '@/gen/v1';
import { DataStoredInToken, TokenData } from '@/interfaces/auth.interface';
import { IUser } from '@/interfaces/users.interface';
import userModel from '@/models/users.model';

export class AuthService {
	private users = userModel;

	public async signup(userData: SchemaSignup): Promise<IUser> {
		const findUser = await this.users.findOne({ email: userData.email });
		if (findUser) {
			throw new AppError('#ERR_CONFLICT', StatusCodes.CONFLICT, {
				description: `User with email ${userData.email} already exists`
			});
		}

		return await this.users.create(userData);
	}

	public async signin(userData: SchemaSignin): Promise<TokenData> {
		const findUser = await this.users.findOne({ email: userData.email });
		if (!findUser) {
			throw new AppError('#ERR_UNAUTHORIZED', StatusCodes.UNAUTHORIZED, {
				description: 'Email or password is incorrect'
			});
		}

		const isValidPassword = await findUser.isValidPassword(userData.password);
		if (!isValidPassword) {
			throw new AppError('#ERR_UNAUTHORIZED', StatusCodes.UNAUTHORIZED, {
				description: 'Email or password is incorrect'
			});
		}

		return this.createToken(findUser);
	}

	public verifyToken(token: string): Promise<IUser | null> {
		const secretKey: string = JWT_SECRET_KEY;
		const verificationResponse = verify(token, secretKey) as DataStoredInToken;
		return this.users.findById(verificationResponse.userId);
	}

	public createToken(user: IUser): TokenData {
		const dataStoredInToken: DataStoredInToken = { userId: user.id };
		const secretKey: string = JWT_SECRET_KEY;
		const expiresIn: number = parseInt(JWT_EXPIRES_IN, 10);

		return { expiresIn, accessToken: sign(dataStoredInToken, secretKey, { expiresIn }) };
	}
}
