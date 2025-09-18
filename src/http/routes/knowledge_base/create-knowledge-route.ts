// routes/knowledge/create-knowledge-route.ts
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { CreateKnowledgeService } from "../../../services/knowledge/create-knowledge-service";

export const createKnowledgeRoute: FastifyPluginCallbackZod = (app) => {
	const createKnowledgeService = new CreateKnowledgeService();

	app.post(
		"/knowledges",
		{
			schema: {
				tags: ["Knowledge"],
				summary: "Responsável por criar um conhecimento",
				description:
					"Este endpoint permite criar um novo conhecimento. É necessário informar os dados obrigatórios (problema, solução).",
				body: z.object({
					problem: z.string(),
					solution: z.string(),
				}),
				response: {
					201: z.object({
						knowledgeId: z.string(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { problem, solution } = request.body;

			const serviceResponse = await createKnowledgeService.execute({
				problem,
				solution,
			});

			if (serviceResponse.isLeft()) {
				return reply
					.status(500)
					.send({ message: "Erro ao criar o conhecimento." });
			}

			const { knowledgeId } = serviceResponse.value;

			return reply.status(201).send({ knowledgeId });
		},
	);
};
