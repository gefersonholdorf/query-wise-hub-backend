// routes/knowledge/fetch-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { QdrantKnowledgeBase } from "../../../databases/qdrant/qdrant-knowledge-repository";
import { PrismaSolutionRepository } from "../../../databases/prisma/prisma-solution-repository";
import { GetAnalysisByIdService } from "../../../services/analysis/get-analysis-by-id-service";
import { NotFoundError } from "../../../errors/not-found-error";

const qdrantRepository = new QdrantKnowledgeBase();
const solutionRepository = new PrismaSolutionRepository();

export const getAnalysisByIdRoute: FastifyPluginCallbackZod = (app) => {
	const getAnalysisByIdService = new GetAnalysisByIdService(
		solutionRepository,
		qdrantRepository,
	);

	app.get(
		"/analysis/:id",
		{
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
						createdBy: z.string(),
						tags: z.string().nullable(),
						status: z.enum(["PENDING", "APPROVED", "DENIED"]),
						approvedBy: z.string().nullable(),
						approvedAt: z.date().nullable(),
						deniedAt: z.date().nullable(),
						deniedBy: z.string().nullable(),
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
					return reply.status(404).send({ message: "Análise não encontrada." });
				}
				return reply.status(500).send({ message: "Erro ao listar análises." });
			}

			const { result } = serviceResponse.value;
			return reply.status(200).send({
				id: result.id,
				problems: result.problems,
				solution: result.solution,
				createdAt: result.createdAt,
				createdBy: result.createdBy,
				tags: result.tags,
				status: result.status,
				approvedAt: result.approvedAt,
				approvedBy: result.approvedBy,
				deniedAt: result.deniedAt,
				deniedBy: result.deniedBy,
				observation: result.observation,
				updatedAt: result.updatedAt,
				stockHistory: result.stockHistory,
			});
		},
	);
};
