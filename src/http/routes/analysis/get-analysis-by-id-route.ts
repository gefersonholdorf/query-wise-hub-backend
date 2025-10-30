// routes/knowledge/fetch-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { GetAnalysisByIdService } from "../../../services/analysis/get-analysis-by-id-service";
import { NotFoundError } from "../../../errors/not-found-error";
import { QdrantProblemsRepository } from "../../../databases/qdrant/qdrant-problems-repository";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { authenticate } from "../../../decorators/authenticate";

const qdrantProblemsRepository = new QdrantProblemsRepository();
const prismaKnowledgeRepository = new PrismaKnowledgeRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const getAnalysisByIdRoute: FastifyPluginCallbackZod = (app) => {
	const getAnalysisByIdService = new GetAnalysisByIdService(
		prismaKnowledgeRepository,
		qdrantProblemsRepository,
	);

	app.get(
		"/analysis/:id",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Analysis"],
				summary: "Get Analysys By Id",
				description: "Retrieves a specific analysis by its ID.",
				params: z.object({
					id: z.coerce.number(),
				}),
				response: {
					200: z.object({
						id: z.number(),
						problems: z.array(z.string()),
						solution: z.string(),
						createdAt: z.date(),
						createdById: z.number(),
						tags: z.string().nullable(),
						status: z.enum(["PENDING", "APPROVED", "DENIED"]),
						approvedById: z.number().nullable(),
						approvedAt: z.date().nullable(),
						deniedAt: z.date().nullable(),
						deniedById: z.number().nullable(),
						observation: z.string().nullable(),
						updatedAt: z.date(),
						stockHistory: z.array(
							z.object({
								id: z.number(),
								action: z.string(),
								status: z.enum(["PENDING", "APPROVED", "DENIED"]).nullable(),
								dateAt: z.date(),
							}),
						),
					}),
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
			const { id } = request.params;
			const serviceResponse = await getAnalysisByIdService.execute({ id });

			if (serviceResponse.isLeft()) {
				if (serviceResponse.value instanceof NotFoundError) {
					return reply.status(404).send({ message: "Analysis not found." });
				}
				return reply.status(500).send({ message: "Error listing analyses." });
			}

			const { result } = serviceResponse.value;
			return reply.status(200).send({
				id: result.id,
				problems: result.problems,
				solution: result.solution,
				createdAt: result.createdAt,
				createdById: result.createdById,
				tags: result.tags,
				status: result.status,
				approvedAt: result.approvedAt,
				approvedById: result.approvedById,
				deniedAt: result.deniedAt,
				deniedById: result.deniedById,
				observation: result.observation,
				updatedAt: result.updatedAt,
				stockHistory: result.stockHistory,
			});
		},
	);
};
