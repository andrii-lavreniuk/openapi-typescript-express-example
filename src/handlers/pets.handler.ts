import { StatusCodes } from 'http-status-codes';
import { TOpenApiExpressFeature, TOpenApiRouter } from 'openapi-ts-router';
import { zValidator } from 'validation-adapters/zod';
import * as z from 'zod';
import { type paths } from '@/gen/v1';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { FindPetsParams, PetsService } from '@/services';

export const registerPetsHandlers = (
	router: TOpenApiRouter<[TOpenApiExpressFeature<paths>]>,
	petsService: PetsService
) => {
	router.post('/pets', {
		bodyValidator: zValidator(
			z.object({
				name: z.string(),
				category: z.enum(['cats', 'dogs', 'fish', 'reptiles', 'birds', 'other'])
			})
		),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const pet = await petsService.addPet(userId, req.body);

			res.send({
				id: pet.id,
				name: pet.name,
				category: pet.category,
				status: pet.status,
				createdAt: pet.createdAt.toISOString()
			});
		}
	});

	router.get('/pets', {
		queryValidator: zValidator(
			z.object({
				category: z.enum(['cats', 'dogs', 'fish', 'reptiles', 'birds', 'other']).optional(),
				status: z.enum(['available', 'pending', 'sold']).optional()
			})
		),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const params: FindPetsParams = {
				category: req.query.category,
				status: req.query.status
			};

			const pets = await petsService.findPets(userId, params);

			res.send(
				pets.map((pet) => ({
					id: pet.id,
					name: pet.name,
					category: pet.category,
					status: pet.status,
					createdAt: pet.createdAt.toISOString()
				}))
			);
		}
	});

	router.get('/pets/{petId}', {
		pathValidator: zValidator(z.object({ petId: z.string() })),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const petId = req.params.petId;

			const pet = await petsService.getPetById(userId, petId);

			res.send({
				id: pet.id,
				name: pet.name,
				category: pet.category,
				status: pet.status,
				createdAt: pet.createdAt.toISOString()
			});
		}
	});

	router.put('/pets/{petId}', {
		pathValidator: zValidator(z.object({ petId: z.string() })),
		bodyValidator: zValidator(
			z.object({
				name: z.string(),
				category: z.enum(['cats', 'dogs', 'fish', 'reptiles', 'birds', 'other'])
			})
		),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const petId = req.params.petId;

			const pet = await petsService.updatePet(userId, petId, req.body);

			res.send({
				id: pet.id,
				name: pet.name,
				category: pet.category,
				status: pet.status,
				createdAt: pet.createdAt.toISOString()
			});
		}
	});

	router.del('/pets/{petId}', {
		pathValidator: zValidator(z.object({ petId: z.string() })),
		handler: async (req, res) => {
			const userId = (req as RequestWithUser<typeof req>).user.id;
			const petId = req.params.petId;

			await petsService.deletePet(userId, petId);

			res.status(StatusCodes.NO_CONTENT);
			res.send();
		}
	});
};
