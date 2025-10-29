/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { MatchKnowledgeService } from "../../../services/knowledge/match-knowledge-service";
import { QdrantProblemsRepository } from "../../../databases/qdrant/qdrant-problems-repository";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { authenticate } from "../../../decorators/authenticate";

const problemRepository = new QdrantProblemsRepository();
const knowledgeRepository = new PrismaKnowledgeRepository();
const sessionRepository = new PrismaSessionRepository();

export const matchKnowledgeRoute: FastifyPluginCallbackZod = (app) => {
	const matchKnowledgeService = new MatchKnowledgeService(
		problemRepository,
		knowledgeRepository,
	);

	app.post(
		"/knowledges/match",
		{
			preHandler: [authenticate(app, sessionRepository)],
			schema: {
				summary: "Search for similarity of knowledge",
				tags: ["Knowledge"],
				description: "Searches for knowledge entries based on similarity.",
				body: z.object({
					message: z.string(),
				}),
				response: {
					200: z.object({
						matchs: z.array(
							z
								.object({
									id: z.string(),
									version: z.number(),
									score: z.number(),
									problem: z.string(),
									knowledge: z.object({
										knowledgeId: z.number(),
										knowledge: z.string(),
									}),
								})
								.nullable(),
						),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { message } = request.body;

			const serviceResponse = await matchKnowledgeService.execute({
				message,
			});

			if (serviceResponse.isLeft()) {
				return reply.status(500).send({ message: "Error retrieving matches." });
			}

			const { matchs } = serviceResponse.value;

			return reply.status(200).send({
				matchs: matchs.map((item) => {
					if (!item) {
						return null;
					}
					return {
						id: item.id,
						version: item.version,
						score: item.score,
						problem: item.problem,
						knowledge: {
							knowledgeId: item.knowledge.knowledgeId,
							knowledge: item.knowledge.knowledge,
						},
					};
				}),
			});
		},
	);
};
