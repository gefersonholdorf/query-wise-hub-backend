// routes/knowledge/summary-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { SummaryDashboardService } from "../../../services/dashboard/summary-dashboard-service";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { authenticate } from "../../../decorators/authenticate";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";

const prismaKnowledgeRepository = new PrismaKnowledgeRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const summaryDashboardRoute: FastifyPluginCallbackZod = (app) => {
	const summaryDashboardService = new SummaryDashboardService(
		prismaKnowledgeRepository,
	);

	app.get(
		"/dashboard",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Dashboard"],
				summary: "Summary Dashboard",
				description: "Retrieves a summary of dashboard.",
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
					.send({ message: "Error listing dashboard summary." });
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
