import { Types } from 'mongoose';

export interface IUser {
	_id: Types.ObjectId;
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	createdAt: Date;
}

export interface IUserMethods {
	isValidPassword: (password: string) => Promise<boolean>;
}

export interface IUserVirtuals {
	id: string;
}
