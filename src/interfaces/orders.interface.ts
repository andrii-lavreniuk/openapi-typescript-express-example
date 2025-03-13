import { Types } from 'mongoose';

export enum OrderStatus {
	PLACED = 'placed',
	APPROVED = 'approved',
	CANCELLED = 'canceled',
	DELIVERED = 'delivered'
}

export interface IOrder {
	_id: Types.ObjectId;
	_ownerId: Types.ObjectId;
	_petId: Types.ObjectId;
	id: string;
	ownerId: string;
	petId: string;
	status: OrderStatus;
	isComplete: boolean;
	shipDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface IOrderVirtuals {
	id: string;
	ownerId: string;
	petId: string;
}
