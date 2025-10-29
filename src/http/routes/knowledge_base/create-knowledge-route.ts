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
				summary: "Create knowledge",
				description: "Creates a new knowledge entry.",
				body: z.object({
					problems: z.array(z.string()),
					solution: z.string(),
					tags: z.string().nullable(),
					isActive: z.boolean(),
				}),
				response: {
					201: z.object({
						solutionId: z.number(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { problems, solution, tags, isActive } = request.body;

			const serviceResponse = await createKnowledgeService.execute({
				problems,
				solution,
				tags: tags ?? null,
				isActive,
			});

			if (serviceResponse.isLeft()) {
				return reply
					.status(500)
					.send({ message: "Erro ao criar o conhecimento." });
			}

			const { solutionId } = serviceResponse.value;

			return reply.status(201).send({ solutionId });
		},
	);
};
