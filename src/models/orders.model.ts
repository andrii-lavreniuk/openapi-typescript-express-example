import { model, Model, Schema, Types } from 'mongoose';
import { IOrder, IOrderVirtuals, OrderStatus } from '@/interfaces/orders.interface';

type OrderModel = Model<IOrder, {}, {}, IOrderVirtuals>;

const orderSchema = new Schema<IOrder, OrderModel, {}, {}, IOrderVirtuals>({
	_id: {
		type: Schema.Types.ObjectId,
		default: new Types.ObjectId()
	},
	_ownerId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	_petId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	status: {
		type: String,
		required: true,
		enum: OrderStatus
	},
	isComplete: {
		type: Boolean,
		required: true,
		default: false
	},
	shipDate: {
		type: Date
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		required: true,
		default: Date.now
	}
});

orderSchema.virtual('id').get(function (): string {
	return this._id.toHexString();
});

orderSchema.virtual('ownerId').get(function (): string {
	return this._ownerId ? this._ownerId.toHexString() : '';
});

orderSchema.virtual('petId').get(function (): string {
	return this._petId ? this._petId.toHexString() : '';
});

orderSchema.pre('save', async function (next) {
	if (this.isModified()) {
		this.updatedAt = new Date();
	}

	next();
});

const petModel = model<IOrder, OrderModel>('Order', orderSchema);

export default petModel;
