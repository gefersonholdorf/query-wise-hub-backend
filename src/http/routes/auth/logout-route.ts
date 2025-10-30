/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all lint/style/noNonNullAssertion: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { LogoutService } from "../../../services/auth/logout-service";
import { authenticate } from "../../../decorators/authenticate";

const prismaSessionRepository = new PrismaSessionRepository();

export const logoutRoute: FastifyPluginCallbackZod = (app) => {
	const logoutService = new LogoutService(prismaSessionRepository);

	app.post(
		"/auth/logout",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Auth"],
				summary: "Logout User",
				description: "Logout a user.",
				headers: z.object({
					authorization: z.string(),
				}),
				security: [{ BearerAuth: [] }],
				response: {
					200: z.object({}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.profile;

			await logoutService.execute({
				userId: id,
			});

			return reply.status(200).send({});
		},
	);
};
