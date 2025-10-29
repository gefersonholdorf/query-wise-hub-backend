// routes/knowledge/create-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { QdrantProblemsRepository } from "../../../databases/qdrant/qdrant-problems-repository";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { authenticate } from "../../../decorators/authenticate";
import { FetchKnowledgeService } from "../../../services/knowledge/fetch-knowledge-service";

const problemRepository = new QdrantProblemsRepository();
const knowledgeRepository = new PrismaKnowledgeRepository();
const sessionRepository = new PrismaSessionRepository();

export const fetchKnowledgeToAnalyzeRoute: FastifyPluginCallbackZod = (app) => {
	const fetchKnowledgeService = new FetchKnowledgeService(
		problemRepository,
		knowledgeRepository,
	);

	app.get(
		"/knowledges",
		{
			preHandler: [authenticate(app, sessionRepository)],
			schema: {
				tags: ["Knowledge"],
				summary: "Fetch knowledges",
				description: "Retrieves a list of all knowledge entries.",
				querystring: z.object({
					page: z.coerce.number().optional(),
					totalPerPage: z.coerce.number().optional(),
					problem: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(
							z.object({
								id: z.number(),
								title: z.string(),
								problems: z.array(z.string()),
								solution: z.string(),
								views: z.number(),
								createdAt: z.date(),
								createdById: z.number(),
								tags: z.string().nullable(),
								status: z.enum(["PENDING", "APPROVED", "DENIED"]),
							}),
						),
						total: z.number(),
						page: z.number(),
						totalPages: z.number(),
						perPage: z.number(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { page, totalPerPage, problem } = request.query;

			const serviceResponse = await fetchKnowledgeService.execute({
				page,
				totalPerPage,
				problem,
			});

			if (serviceResponse.isLeft()) {
				return reply.status(500).send({ message: "Error listing knowledge" });
			}

			const { result } = serviceResponse.value;
			return reply.status(200).send({
				data: result.data,
				total: result.total,
				totalPages: result.totalPages,
				page: result.page,
				perPage: result.perPage,
			});
		},
	);
};
