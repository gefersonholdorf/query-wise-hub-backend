/** bioGetUserById-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PrismaUserRepository } from "../../../databases/prisma/prisma-user-repository";
import { authenticate } from "../../../decorators/authenticate";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { GetUserByIdService } from "../../../services/users/get-user-by-id-service";
import { NotFoundError } from "../../../errors/not-found-error";

const prismaUserRepository = new PrismaUserRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const getUserByIdRoute: FastifyPluginCallbackZod = (app) => {
	const getUserByIdService = new GetUserByIdService(prismaUserRepository);

	app.get(
		"/users/:id",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Users"],
				summary: "Find User By Id",
				description: "Retrieve user information by ID.",
				params: z.object({
					id: z.coerce.number(),
				}),
				response: {
					200: z.object({
						user: z.object({
							id: z.number(),
							email: z.email(),
							cpf: z.string(),
							username: z.string(),
							fileName: z.string().nullable(),
							fullName: z.string().nullable(),
							role: z.enum(["COMMON", "ADMIN", "EMPLOYEE"]),
							createdAt: z.date(),
							updatedAt: z.date(),
							isActive: z.boolean(),
							lastLogin: z.date().nullable(),
						}),
					}),
					404: z.object({
						message: z.string(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const serviceResponse = await getUserByIdService.execute({
				userId: id,
			});

			if (serviceResponse.isLeft()) {
				if (serviceResponse.value instanceof NotFoundError) {
					return reply
						.status(404)
						.send({ message: serviceResponse.value.message });
				}
				return reply
					.status(500)
					.send({ message: "Internal error listing user." });
			}

			const { user } = serviceResponse.value;

			return reply.status(200).send({
				user: {
					id: user.id,
					email: user.email,
					cpf: user.cpf,
					username: user.username,
					fileName: user.fileName || null,
					fullName: user.fullName || null,
					role: user.role,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					isActive: user.isActive,
					lastLogin: user.lastLogin || null,
				},
			});
		},
	);
};
