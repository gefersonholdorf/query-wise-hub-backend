// routes/knowledge/fetch-knowledge-route.ts
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { FetchAnalysisService } from "../../../services/analysis/fetch-analysis-service";

export const fetchAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const fetchAnalysisService = new FetchAnalysisService();

	app.get(
		"/analysis",
		{
			schema: {
				tags: ["Analysis"],
				summary: "Fetch Analysys",
				description: "Fetch solutions by isAnalysis is true",
				querystring: z.object({
					page: z.coerce.number().optional(),
					totalPerPage: z.coerce.number().optional(),
					status: z.enum(["PENDING", "APPROVED", "DENIED"]).optional(),
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
						pageSize: z.number(),
						totalPages: z.number(),
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
			const { page, totalPerPage, status } = request.query;
			const serviceResponse = await fetchAnalysisService.execute({
				page,
				totalPerPage,
				status,
			});

			if (serviceResponse.isLeft()) {
				return reply.status(500).send({ message: "Erro ao listar análises." });
			}

			const { result } = serviceResponse.value;
			return reply.status(200).send({
				data: result.data,
				total: result.total,
				pageSize: result.pageSize,
				totalPages: result.totalPages,
				page: result.page,
				totalPerPage: result.totalPerPage,
			});
		},
	);
};
