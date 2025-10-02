// routes/knowledge/create-knowledge-route.ts
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { FetchKnowledgeService } from "../../../services/knowledge/fetch-knowledge-service";

export const fetchKnowledgeToAnalyzeRoute: FastifyPluginCallbackZod = (app) => {
	const fetchKnowledgeService = new FetchKnowledgeService();

	app.get(
		"/knowledges",
		{
			schema: {
				tags: ["Knowledge"],
				summary: "Fetch knowledges by cursor pagination and filterings",
				description:
					"Este endpoint permite criar um novo conhecimento através de curadoria. É necessário informar os dados obrigatórios (problema, solução).",
				querystring: z.object({
					cursor: z.string().optional(),
					limit: z.coerce.number().optional(),
					problem: z.string().optional(),
				}),
				response: {
					200: z.object({
						data: z.array(
							z.object({
								id: z.string(),
								payload: z.object({
									problem: z.string(),
									solution: z.string(),
									createdAt: z.string(),
								}),
							}),
						),
						nextCursor: z.string().nullable(),
						hasMore: z.boolean(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { cursor, limit, problem } = request.query;

			const resultService = await fetchKnowledgeService.execute({
				cursor,
				limit,
				problem,
			});

			if (resultService.isLeft()) {
				return reply.status(500).send({
					message: "Erro ao consultar os conhecimentos.",
				});
			}

			const { data, hasMore, nextCursor } = resultService.value.result;

			return reply.status(200).send({
				data,
				nextCursor,
				hasMore,
			});
		},
	);
};
