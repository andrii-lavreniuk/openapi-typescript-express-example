import { compare, hash } from 'bcrypt';
import { model, Model, Schema, Types } from 'mongoose';
import { IUser, IUserMethods, IUserVirtuals } from '@/interfaces/users.interface';

type UserModel = Model<IUser, {}, IUserMethods, IUserVirtuals>;

const userSchema = new Schema<IUser, UserModel, IUserMethods, {}, IUserVirtuals>({
	_id: {
		type: Schema.Types.ObjectId,
		default: new Types.ObjectId()
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

userSchema.virtual('id').get(function (): string {
	return this._id.toHexString();
});

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await hash(this.password, 10);
	}

	next();
});

userSchema.method('isValidPassword', async function (password: string): Promise<boolean> {
	return await compare(password, this.password);
});

const userModel = model<IUser, UserModel>('User', userSchema);

export default userModel;
