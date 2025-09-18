import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";

export const healthRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/health",
		{
			schema: {
				tags: ["Health"],
				summary: "Verifica a saúde da aplicação.",
				description: "Responsável por verificar se a API esta UP.",
				response: {
					200: z.object({
						status: z.string(),
					}),
				},
			},
		},
		async (_, reply) => {
			return reply.status(200).send({ status: "up" });
		},
	);
};
