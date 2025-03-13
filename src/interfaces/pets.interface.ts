import { Types } from 'mongoose';

export enum PetCategory {
	DOGS = 'dogs',
	CATS = 'cats',
	FISH = 'fish',
	BIRDS = 'birds',
	REPTILES = 'reptiles',
	OTHER = 'other'
}

export enum PetStatus {
	AVAILABLE = 'available',
	PENDING = 'pending',
	SOLD = 'sold'
}

export interface IPet {
	_id: Types.ObjectId;
	_ownerId: Types.ObjectId;
	_orderId: Types.ObjectId | null;
	id: string;
	ownerId: string;
	orderId: string;
	name: string;
	category: PetCategory;
	status: PetStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface IPetVirtuals {
	id: string;
	ownerId: string;
	orderId: string;
}
