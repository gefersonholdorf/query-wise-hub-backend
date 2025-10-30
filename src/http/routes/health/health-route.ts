import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";

export const healthRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/health",
		{
			schema: {
				tags: ["Health"],
				summary: "Application Health Check",
				description: "Verifies the health status of the application.",
				response: {
					200: z.object({
						status: z.boolean(),
					}),
				},
			},
		},
		async (_, reply) => {
			return reply.status(200).send({ status: true });
		},
	);
};
