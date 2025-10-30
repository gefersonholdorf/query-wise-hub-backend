// routes/knowledge/create-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { CreateAnalysisService } from "../../../services/analysis/create-analysis-service";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { PrismaStockHistoryRepository } from "../../../databases/prisma/prisma-stock-history-repository";
import { QdrantProblemsRepository } from "../../../databases/qdrant/qdrant-problems-repository";
import { authenticate } from "../../../decorators/authenticate";

const qdrantProblemsRepository = new QdrantProblemsRepository();
const prismaKnowledgeRepository = new PrismaKnowledgeRepository();
const prismaStockHistoryRepository = new PrismaStockHistoryRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const createAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const createAnalysisService = new CreateAnalysisService(
		qdrantProblemsRepository,
		prismaKnowledgeRepository,
		prismaStockHistoryRepository,
	);

	app.post(
		"/analysis",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Analysis"],
				summary: "Create Analysys",
				description: "Creates a new analysis.",
				body: z.object({
					title: z.string(),
					problem: z.string(),
					solution: z.string(),
					tags: z.string().nullable(),
				}),
				response: {
					201: z.object({
						analysisId: z.number(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { title, problem, solution, tags } = request.body;

			const serviceResponse = await createAnalysisService.execute({
				title,
				problem,
				solution,
				tags: tags ?? null,
                
			});

			if (serviceResponse.isLeft()) {
				return reply
					.status(500)
					.send({ message: "Erro ao criar o conhecimento." });
			}

			const { analysisId } = serviceResponse.value;

			return reply.status(201).send({ analysisId });
		},
	);
};
