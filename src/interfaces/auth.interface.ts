import { IUser } from '@/interfaces/users.interface';

export interface DataStoredInToken {
	userId: string;
}

export interface TokenData {
	accessToken: string;
	expiresIn: number;
}

export type RequestWithUser<T> = T & {
	user: IUser;
};
