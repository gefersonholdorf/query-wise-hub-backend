// // routes/knowledge/summary-knowledge-route.ts
// import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
// import { z } from "zod";
// import { SummaryAnalysisService } from "../../../services/analysis/summary-analysis-service";

// export const summaryAnalysisRoute: FastifyPluginCallbackZod = (app) => {
// 	const summaryAnalysisService = new SummaryAnalysisService();

// 	app.get(
// 		"/analysis/summary",
// 		{
// 			schema: {
// 				tags: ["Analysis"],
// 				summary: "Summary Analysis",
// 				description: "Retrieves a summary of analyses.",
// 				response: {
// 					200: z.object({
// 						totalPendings: z.number(),
// 						totalApproveds: z.number(),
// 						totalDenieds: z.number(),
// 						total: z.number(),
// 						approvalRate: z.number(),
// 					}),
// 					500: z.object({
// 						message: z.string(),
// 					}),
// 				},
// 			},
// 		},
// 		async (_, reply) => {
// 			const serviceResponse = await summaryAnalysisService.execute();

// 			if (serviceResponse.isLeft()) {
// 				return reply
// 					.status(500)
// 					.send({ message: "Erro ao listar resumo de análises." });
// 			}

// 			const {
// 				totalPendings,
// 				totalApproveds,
// 				totalDenieds,
// 				total,
// 				approvalRate,
// 			} = serviceResponse.value.result;
// 			return reply.status(200).send({
// 				totalPendings,
// 				totalApproveds,
// 				totalDenieds,
// 				total,
// 				approvalRate,
// 			});
// 		},
// 	);
// };
