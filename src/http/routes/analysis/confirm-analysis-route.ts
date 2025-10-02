// routes/knowledge/confirm-knowledge-route.ts
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFoundError } from "../../../errors/not-found-error";
import { ConfirmAnalysisService } from "../../../services/analysis/confirm-analysis-service";

export const confirmAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const confirmAnalysisService = new ConfirmAnalysisService();

	app.post(
		"/analysis/confirm/:id",
		{
			schema: {
				tags: ["Analysis"],
				summary: "Confirm Analysys",
				description: "Approve or deny analysis",
				body: z.object({
					status: z.enum(["APPROVED", "DENIED"]),
					observation: z.string().optional(),
				}),
				params: z.object({
					id: z.coerce.number(),
				}),
				response: {
					204: z.object(),
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
			const { status, observation } = request.body;
			const { id } = request.params;

			const serviceResponse = await confirmAnalysisService.execute({
				id,
				status,
				observation,
			});

			if (serviceResponse.isLeft()) {
				if (serviceResponse.value instanceof NotFoundError) {
					return reply.status(404).send({
						message: "Recurso não encontrado.",
					});
				}

				return reply
					.status(500)
					.send({ message: "Erro ao criar o conhecimento." });
			}

			return reply.status(204).send({});
		},
	);
};
