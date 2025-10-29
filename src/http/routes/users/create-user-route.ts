import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { CreateUserService } from "../../../services/users/create-user-service";
import { EntityAlreadyExistsError } from "../../../errors/entity-already-exists-error";
import { PrismaUserRepository } from "../../../databases/prisma/prisma-user-repository";

const prismaUserRepository = new PrismaUserRepository()

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
	const createUserService = new CreateUserService(prismaUserRepository);

	app.post(
		"/users",
		{
			schema: {
				tags: ["Users"],
				summary: "Create User",
				description: "Create a new user.",
				body: z.object({
					email: z.email(),
                    cpf: z.string(),
                    username: z.string(),
                    fullName: z.string().optional(),
                    password: z.string().min(6, "Password must be at least 6 characters long."),
					role: z.enum(["COMMON", "ADMIN", "EMPLOYEE"]).default("COMMON"),
				}),
				response: {
					201: z.object({
						userId: z.number(),
					}),
                    409: z.object({
                        message: z.string()
                    }),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { email, cpf, username, fullName, password, role} = request.body;

			const serviceResponse = await createUserService.execute({
				email,
				cpf,
				username,
                fullName,
                password,
                role,
			});

			if (serviceResponse.isLeft()) {
                if (serviceResponse.value instanceof EntityAlreadyExistsError) {
                    return reply
                        .status(409)
                        .send({ message: serviceResponse.value.message });
                }
				return reply
					.status(500)
					.send({ message: "Internal error creating user." });
			}

			const { userId } = serviceResponse.value;

			return reply.status(201).send({ userId });
		},
	);
};
