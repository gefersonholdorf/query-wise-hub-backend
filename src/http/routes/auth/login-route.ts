import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PrismaUserRepository } from "../../../databases/prisma/prisma-user-repository";
import { LoginService } from "../../../services/auth/login-service";
import { CredentialsInvalidError } from "../../../errors/credentials-invalid";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";

const prismaUserRepository = new PrismaUserRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const loginRoute: FastifyPluginCallbackZod = (app) => {
	const loginService = new LoginService(
		prismaUserRepository,
		prismaSessionRepository,
		app,
	);

	app.post(
		"/auth/login",
		{
			schema: {
				tags: ["Auth"],
				summary: "Login User",
				description: "Login a user.",
				body: z.object({
					email: z.email().optional().or(z.literal("")),
					cpf: z.string().optional(),
					username: z.string().optional(),
					password: z.string(),
				}),
				response: {
					200: z.object({
						token: z.string(),
					}),
					401: z.object({
						message: z.string(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { email, cpf, username, password } = request.body;

			const ip = request.ip;
			const userAgent = request.headers["user-agent"] || "";

			const serviceResponse = await loginService.execute({
				email,
				cpf,
				username,
				password,
				ip,
				userAgent,
			});

			if (serviceResponse.isLeft()) {
				if (serviceResponse.value instanceof CredentialsInvalidError) {
					return reply
						.status(401)
						.send({ message: serviceResponse.value.message });
				}
				return reply
					.status(500)
					.send({ message: "Internal error login user." });
			}

			const { token } = serviceResponse.value;

			return reply.status(200).send({ token });
		},
	);
};
