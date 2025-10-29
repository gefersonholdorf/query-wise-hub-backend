// routes/knowledge/update-knowledge-route.ts
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { QdrantKnowledgeBase } from "../../../databases/qdrant/qdrant-knowledge-repository";
import { PrismaSolutionRepository } from "../../../databases/prisma/prisma-solution-repository";
import { UpdateAnalysisService } from "../../../services/analysis/update-analysis-service";
import { NotFoundError } from "../../../errors/not-found-error";
import { PrismaStockHistoryRepository } from "../../../databases/prisma/prisma-stock-history-repository";

const qdrantRepository = new QdrantKnowledgeBase();
const solutionRepository = new PrismaSolutionRepository();
const stockHistoryRepository = new PrismaStockHistoryRepository();

export const updateAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const updateAnalysisService = new UpdateAnalysisService(
		qdrantRepository,
		solutionRepository,
		stockHistoryRepository,
	);

	app.put(
		"/analysis/:id",
		{
			schema: {
				tags: ["Analysis"],
				summary: "Update Analysys",
				description: "Updates an existing analysis.",
				body: z.object({
					problems: z.array(z.string()),
					solution: z.string(),
				}),
				params: z.object({
					id: z.coerce.number(),
				}),
				response: {
					204: z.object({}),
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
			const { problems, solution } = request.body;
			const { id } = request.params;

			const serviceResponse = await updateAnalysisService.execute({
				id,
				problems,
				solution,
				tags: "",
			});

			if (serviceResponse.isLeft()) {
				if (serviceResponse.value instanceof NotFoundError) {
					return reply.status(404).send({
						message: "Análise não encontrada.",
					});
				}
				return reply
					.status(500)
					.send({ message: "Erro ao atualizar a análise." });
			}

			return reply.status(204).send({});
		},
	);
};
