import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { prismaClient } from "../../../databases/client";
import { env } from "../../../env";

export const healthDBRoute: FastifyPluginCallbackZod = (app) => {
	app.get(
		"/health-db",
		{
			schema: {
				tags: ["Health"],
				summary: "Database Health Check",
				description: "Verifies the health status of the databases.",
				response: {
					200: z.object({
						mysql: z.boolean(),
						qdrant: z.boolean(),
					}),
				},
			},
		},
		async (_, reply) => {
			let mysqlUp = false;
			let qdrantUp = false;

			try {
				await prismaClient.$queryRaw`SELECT 1`;
				mysqlUp = true;
			} catch (err) {
				console.error("❌ MySQL fora do ar:", err);
			}

			try {
				const res = await fetch(`${env.QDRANT_URL}/healthz`);
				const data = await res.text();
				if (data === "healthz check passed") qdrantUp = true;
			} catch (err) {
				console.error("❌ Qdrant fora do ar:", err);
			}

			return reply.status(200).send({
				mysql: mysqlUp,
				qdrant: qdrantUp,
			});
		},
	);
};
