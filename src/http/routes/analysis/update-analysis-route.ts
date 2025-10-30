// routes/knowledge/update-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { UpdateAnalysisService } from "../../../services/analysis/update-analysis-service";
import { NotFoundError } from "../../../errors/not-found-error";
import { PrismaStockHistoryRepository } from "../../../databases/prisma/prisma-stock-history-repository";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { QdrantProblemsRepository } from "../../../databases/qdrant/qdrant-problems-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { authenticate } from "../../../decorators/authenticate";

const qdrantProblemsRepository = new QdrantProblemsRepository();
const prismaKnowledgeRepository = new PrismaKnowledgeRepository();
const prismaStockHistoryRepository = new PrismaStockHistoryRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const updateAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const updateAnalysisService = new UpdateAnalysisService(
		qdrantProblemsRepository,
		prismaKnowledgeRepository,
		prismaStockHistoryRepository,
	);

	app.put(
		"/analysis/:id",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Analysis"],
				summary: "Update Analysys",
				description: "Updates an existing analysis.",
				body: z.object({
					title: z.string(),
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
			const { problems, solution, title } = request.body;
			const { id } = request.params;

			const serviceResponse = await updateAnalysisService.execute({
				id,
				title,
				problems,
				solution,
				tags: "",
			});

			if (serviceResponse.isLeft()) {
				if (serviceResponse.value instanceof NotFoundError) {
					return reply.status(404).send({
						message: "Analysis not found.",
					});
				}
				return reply.status(500).send({ message: "Error updating analysis." });
			}

			return reply.status(204).send({});
		},
	);
};
