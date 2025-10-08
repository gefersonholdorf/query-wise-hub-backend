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
				summary: "Fetch knowledges",
				description:
					"Este endpoint permite criar um novo conhecimento através de curadoria. É necessário informar os dados obrigatórios (problema, solução).",
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
								problems: z.array(z.string()),
								solution: z.string(),
								createdAt: z.date(),
								createdBy: z.string(),
								tags: z.string().nullable(),
								status: z.enum(["PENDING", "APPROVED", "DENIED"]),
							}),
						),
						total: z.number(),
						page: z.number(),
						totalPerPage: z.number(),
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
				return reply
					.status(500)
					.send({ message: "Erro ao listar conhecimentos." });
			}

			const { result } = serviceResponse.value;
			return reply.status(200).send({
				data: result.data,
				total: result.total,
				page: result.page,
				totalPerPage: result.totalPerPage,
			});
		},
	);
};
