import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { AppError } from 'openapi-ts-router';
import { SchemaPetCreate, SchemaPetUpdate } from '@/gen/v1';
import { IPet, PetCategory, PetStatus } from '@/interfaces/pets.interface';
import petsModel from '@/models/pets.model';

export type FindPetsParams = {
	category?: string;
	status?: string;
};

export class PetsService {
	private pets = petsModel;

	public async addPet(userId: string, petsData: SchemaPetCreate): Promise<IPet> {
		return await this.pets.create({
			_ownerId: new Types.ObjectId(userId),
			status: PetStatus.AVAILABLE,
			...petsData
		});
	}

	public async getPetById(userId: string, petId: string): Promise<IPet> {
		const pet = await this.pets.findById(petId);

		if (!pet || pet.ownerId !== userId) {
			throw new AppError('#ERR_NOT_FOUND', StatusCodes.NOT_FOUND, {
				description: 'Pet not found'
			});
		}

		return pet;
	}

	public async findPets(userId: string, params: FindPetsParams): Promise<IPet[]> {
		const query: { [key: string]: string } = {
			_ownerId: userId
		};

		if (params.category) {
			query.category = params.category;
		}

		if (params.status) {
			query.status = params.status;
		}

		return await this.pets.find(query);
	}

	public async updatePet(userId: string, petId: string, petsData: SchemaPetUpdate): Promise<IPet> {
		const pet = await this.pets.findById(petId);

		if (!pet || pet.ownerId !== userId) {
			throw new AppError('#ERR_NOT_FOUND', StatusCodes.NOT_FOUND, {
				description: 'Pet not found'
			});
		}

		pet.name = petsData.name;
		pet.category = petsData.category as PetCategory;

		await pet.save();

		return pet;
	}

	public async deletePet(userId: string, petId: string): Promise<void> {
		const pet = await this.pets.findById(petId);

		if (!pet || pet.ownerId !== userId) {
			throw new AppError('#ERR_NOT_FOUND', StatusCodes.NOT_FOUND, {
				description: 'Pet not found'
			});
		}

		if (pet.status !== PetStatus.AVAILABLE) {
			throw new AppError('#ERR_FORBIDDEN', StatusCodes.FORBIDDEN, {
				description: 'Pet cannot be deleted'
			});
		}

		await this.pets.deleteOne({ _id: pet._id });
	}
}
