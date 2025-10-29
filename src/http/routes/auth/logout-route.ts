import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { PrismaUserRepository } from "../../../databases/prisma/prisma-user-repository";
import { LogoutService } from "../../../services/auth/logout-service";
import { authenticate } from "../../../decorators/authenticate";

// const prismaUserRepository = new PrismaUserRepository();
// const prismaSessionRepository = new PrismaSessionRepository();

export const logoutRoute: FastifyPluginCallbackZod = (app) => {
	// const logoutService = new LogoutService(
	// 	prismaUserRepository,
	// 	prismaSessionRepository,
	// 	app,
	// );

	app.post(
		"/auth/logout",
		{
			preHandler: [authenticate(app)],
			schema: {
				tags: ["Auth"],
				summary: "Logout User",
				description: "Logout a user.",
				headers: z.object({
					authorization: z.string(),
				}),
				response: {
					200: z.object({}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			// Aqui você já tem o request.user disponível
			const user = (request as any).user;
			console.log(user);

			// Exemplo: desativar sessão no banco
			// await logoutService.execute(user.id, token);

			return reply.status(200).send({});
		},
	);
};
