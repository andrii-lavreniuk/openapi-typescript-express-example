import { StatusCodes } from 'http-status-codes';
import mongoose, { Types } from 'mongoose';
import { AppError } from 'openapi-ts-router';
import { SchemaOrderCreate } from '@/gen/v1';
import { IOrder, OrderStatus } from '@/interfaces/orders.interface';
import { PetStatus } from '@/interfaces/pets.interface';
import ordersModel from '@/models/orders.model';
import petsModel from '@/models/pets.model';

export type FindOrdersParams = {
	status?: string;
};

export class OrdersService {
	private pets = petsModel;
	private orders = ordersModel;

	public async createOrder(userId: string, orderData: SchemaOrderCreate): Promise<IOrder> {
		const pet = await this.pets.findById(orderData.petId);

		if (!pet) {
			throw new AppError('#ERR_NOT_FOUND', StatusCodes.NOT_FOUND, {
				description: 'Pet not available'
			});
		}

		if (pet.status !== PetStatus.AVAILABLE) {
			throw new AppError('#ERR_FORBIDDEN', StatusCodes.FORBIDDEN, {
				description: 'Pet not available'
			});
		}

		const session = await mongoose.startSession();

		const order = await session.withTransaction<IOrder>(async (): Promise<IOrder> => {
			const order = await this.orders.create({
				_ownerId: new Types.ObjectId(userId),
				_petId: pet._id,
				status: OrderStatus.PLACED
			});

			pet.status = PetStatus.PENDING;
			pet._orderId = order._id;

			await pet.save();

			return order;
		});

		await session.endSession();

		return order;
	}

	public async getOrderById(userId: string, orderId: string): Promise<IOrder> {
		const order = await this.orders.findById(orderId);

		if (!order || order.ownerId !== userId) {
			throw new AppError('#ERR_NOT_FOUND', StatusCodes.NOT_FOUND, {
				description: 'Order not found'
			});
		}

		return order;
	}

	public async findOrders(userId: string, params: FindOrdersParams): Promise<IOrder[]> {
		const query: { [key: string]: string } = {
			_ownerId: userId
		};

		if (params.status) {
			query.status = params.status;
		}

		return await this.orders.find(query);
	}

	public async cancelOrder(userId: string, orderId: string): Promise<void> {
		const order = await this.orders.findById(orderId);

		if (!order || order.ownerId !== userId) {
			throw new AppError('#ERR_NOT_FOUND', StatusCodes.NOT_FOUND, {
				description: 'Order not found'
			});
		}

		if (order.status !== OrderStatus.PLACED) {
			throw new AppError('#ERR_FORBIDDEN', StatusCodes.FORBIDDEN, {
				description: 'Order cannot be cancelled'
			});
		}

		const session = await mongoose.startSession();

		await session.withTransaction(async () => {
			const pet = await this.pets.findById(order.petId);

			if (!pet) {
				throw new AppError('#ERR_NOT_FOUND', StatusCodes.NOT_FOUND, {
					description: 'Pet not available'
				});
			}

			pet.status = PetStatus.AVAILABLE;
			pet._orderId = null;

			order.status = OrderStatus.CANCELLED;

			await pet.save();
			await order.save();
		});
	}
}
