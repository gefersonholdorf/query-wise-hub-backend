// routes/knowledge/fetch-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { FetchAnalysisService } from "../../../services/analysis/fetch-analysis-service";
import { QdrantProblemsRepository } from "../../../databases/qdrant/qdrant-problems-repository";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { authenticate } from "../../../decorators/authenticate";

const qdrantProblemsRepository = new QdrantProblemsRepository();
const prismaKnowledgeRepository = new PrismaKnowledgeRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const fetchAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const fetchAnalysisService = new FetchAnalysisService(
		prismaKnowledgeRepository,
		qdrantProblemsRepository,
	);

	app.get(
		"/analysis",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Analysis"],
				summary: "Fetch Analysys",
				description: "Retrieves a list of all analyses.",
				querystring: z.object({
					page: z.coerce.number().optional(),
					totalPerPage: z.coerce.number().optional(),
					status: z.enum(["PENDING", "APPROVED", "DENIED"]).optional(),
					title: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(
							z.object({
								id: z.number(),
								problems: z.array(z.string()),
								solution: z.string(),
								createdAt: z.date(),
								createdById: z.number(),
								tags: z.string().nullable(),
								status: z.enum(["PENDING", "APPROVED", "DENIED"]),
							}),
						),
						page: z.number(),
						perPage: z.number(),
						total: z.number(),
						totalPages: z.number(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { page, totalPerPage, status, title } = request.query;
			const serviceResponse = await fetchAnalysisService.execute({
				page,
				totalPerPage,
				status,
				title,
			});

			if (serviceResponse.isLeft()) {
				return reply.status(500).send({ message: "Error listing analyses." });
			}

			const { result } = serviceResponse.value;
			return reply.status(200).send({
				data: result.data,
				page: result.page,
				perPage: result.perPage,
				total: result.total,
				totalPages: result.totalPages,
			});
		},
	);
};
