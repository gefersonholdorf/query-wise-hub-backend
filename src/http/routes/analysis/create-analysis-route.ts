// // routes/knowledge/create-knowledge-route.ts
// import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
// import { z } from "zod";
// import { CreateAnalysisService } from "../../../services/analysis/create-analysis-service";

// export const createAnalysisRoute: FastifyPluginCallbackZod = (app) => {
// 	const createAnalysisService = new CreateAnalysisService();

// 	app.post(
// 		"/analysis",
// 		{
// 			schema: {
// 				tags: ["Analysis"],
// 				summary: "Create Analysys",
// 				description: "Creates a new analysis.",
// 				body: z.object({
// 					problem: z.string(),
// 					solution: z.string(),
// 					tags: z.string().nullable(),
// 				}),
// 				response: {
// 					201: z.object({
// 						analysisId: z.number(),
// 					}),
// 					500: z.object({
// 						message: z.string(),
// 					}),
// 				},
// 			},
// 		},
// 		async (request, reply) => {
// 			const { problem, solution, tags } = request.body;

// 			const serviceResponse = await createAnalysisService.execute({
// 				problem,
// 				solution,
// 				tags: tags ?? null,
// 			});

// 			if (serviceResponse.isLeft()) {
// 				return reply
// 					.status(500)
// 					.send({ message: "Erro ao criar o conhecimento." });
// 			}

// 			const { analysisId } = serviceResponse.value;

// 			return reply.status(201).send({ analysisId });
// 		},
// 	);
// };
