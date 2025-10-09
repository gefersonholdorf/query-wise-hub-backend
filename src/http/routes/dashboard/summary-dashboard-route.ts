// routes/knowledge/summary-knowledge-route.ts
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { PrismaSolutionRepository } from "../../../databases/prisma/prisma-solution-repository";
import { SummaryDashboardService } from "../../../services/dashboard/summary-dashboard-service";

const prismaSolutionRepository = new PrismaSolutionRepository();

export const summaryDashboardRoute: FastifyPluginCallbackZod = (app) => {
	const summaryDashboardService = new SummaryDashboardService(
		prismaSolutionRepository,
	);

	app.get(
		"/dashboard",
		{
			schema: {
				tags: ["Dashboard"],
				summary: "Summary Dashboard",
				description: "Summary dashboard all",
				response: {
					200: z.object({
						totalKnowledges: z.number(),
						totalViews: z.number(),
						totalAnalysis: z.number(),
						totalUsers: z.number(),
						totalPendings: z.number(),
						totalApproveds: z.number(),
						totalDenieds: z.number(),
						approvalRate: z.number(),
						knowledgesUsed: z.number(),
						effectiveKnowledges: z.number(),
						ineffectiveKnowledges: z.number(),
						averageAnalysisTime: z.number(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (_, reply) => {
			const serviceResponse = await summaryDashboardService.execute();

			if (serviceResponse.isLeft()) {
				return reply
					.status(500)
					.send({ message: "Erro ao listar resumo do dashboard." });
			}

			const {
				totalKnowledges,
				totalViews,
				totalAnalysis,
				totalUsers,
				totalPendings,
				totalApproveds,
				totalDenieds,
				approvalRate,
				knowledgesUsed,
				effectiveKnowledges,
				ineffectiveKnowledges,
				averageAnalysisTime,
			} = serviceResponse.value.result;

			return reply.status(200).send({
				totalKnowledges,
				totalViews,
				totalAnalysis,
				totalUsers,
				totalPendings,
				totalApproveds,
				totalDenieds,
				approvalRate,
				knowledgesUsed,
				effectiveKnowledges,
				ineffectiveKnowledges,
				averageAnalysisTime,
			});
		},
	);
};
