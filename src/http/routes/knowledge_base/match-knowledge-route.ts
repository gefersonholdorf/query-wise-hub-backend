import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { MatchKnowledgeService } from "../../../services/knowledge/match-knowledge-service";

export const matchKnowledgeRoute: FastifyPluginCallbackZod = (app) => {
	const matchKnowledgeService = new MatchKnowledgeService();

	app.post(
		"/knowledges/match",
		{
			schema: {
				summary: "Search for similarity of knowledge",
				tags: ["Knowledge"],
				description:
					"Este endpoint permite verificar a similaridade de uma mensagem com os conhecimentos ja cadastrados no sistema retornando os conhecimento mais próximos realizado através de um cálculo de similaridades com embeddings.",
				body: z.object({
					message: z.string(),
				}),
				response: {
					200: z.object({
						bestMatch: z
							.object({
								id: z.string(),
								version: z.number(),
								score: z.number(),
								problem: z.string(),
								solution: z.string(),
							})
							.nullable(),
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
				return reply
					.status(500)
					.send({ message: "Erro ao obter as correspondências." });
			}

			const { bestMatch } = serviceResponse.value;

			if (!bestMatch) {
				return reply.status(200).send({
					bestMatch: null,
				});
			}

			return reply.status(200).send({
				bestMatch: {
					id: String(bestMatch.id),
					version: bestMatch.version,
					score: bestMatch.score,
					problem: bestMatch.payload.problem,
					solution: bestMatch.payload.solution,
				},
			});
		},
	);
};
