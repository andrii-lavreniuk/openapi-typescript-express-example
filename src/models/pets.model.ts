import { model, Model, Schema, Types } from 'mongoose';
import { IPet, IPetVirtuals, PetCategory, PetStatus } from '@/interfaces/pets.interface';

type PetModel = Model<IPet, {}, {}, IPetVirtuals>;

const petSchema = new Schema<IPet, PetModel, {}, {}, IPetVirtuals>({
	_id: {
		type: Schema.Types.ObjectId,
		default: new Types.ObjectId()
	},
	_ownerId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	_orderId: {
		type: Schema.Types.ObjectId
	},
	name: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true,
		enum: PetCategory
	},
	status: {
		type: String,
		required: true,
		enum: PetStatus
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

petSchema.virtual('id').get(function (): string {
	return this._id.toHexString();
});

petSchema.virtual('ownerId').get(function (): string {
	return this._ownerId ? this._ownerId.toHexString() : '';
});

petSchema.virtual('orderId').get(function (): string {
	return this._orderId ? this._orderId.toHexString() : '';
});

petSchema.pre('save', async function (next) {
	if (this.isModified()) {
		this.updatedAt = new Date();
	}

	next();
});

const petModel = model<IPet, PetModel>('Pet', petSchema);

export default petModel;
