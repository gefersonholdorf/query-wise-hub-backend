// routes/knowledge/summary-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { SummaryAnalysisService } from "../../../services/analysis/summary-analysis-service";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { authenticate } from "../../../decorators/authenticate";

const prismaKnowledgeRepository = new PrismaKnowledgeRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const summaryAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const summaryAnalysisService = new SummaryAnalysisService(
		prismaKnowledgeRepository,
	);

	app.get(
		"/analysis/summary",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Analysis"],
				summary: "Summary Analysis",
				description: "Retrieves a summary of analyses.",
				response: {
					200: z.object({
						totalPendings: z.number(),
						totalApproveds: z.number(),
						totalDenieds: z.number(),
						total: z.number(),
						approvalRate: z.number(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (_, reply) => {
			const serviceResponse = await summaryAnalysisService.execute();

			if (serviceResponse.isLeft()) {
				return reply
					.status(500)
					.send({ message: "Error listing analysis summary." });
			}

			const {
				totalPendings,
				totalApproveds,
				totalDenieds,
				total,
				approvalRate,
			} = serviceResponse.value.result;
			return reply.status(200).send({
				totalPendings,
				totalApproveds,
				totalDenieds,
				total,
				approvalRate,
			});
		},
	);
};
