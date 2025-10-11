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
				description: "Get analysis by id",
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
			});
		},
	);
};
