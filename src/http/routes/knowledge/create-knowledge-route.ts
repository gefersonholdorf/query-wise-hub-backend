// routes/knowledge/create-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { CreateKnowledgeService } from "../../../services/knowledge/create-knowledge-service";
import { QdrantProblemsRepository } from "../../../databases/qdrant/qdrant-problems-repository";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { authenticate } from "../../../decorators/authenticate";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";

const problemRepository = new QdrantProblemsRepository();
const knowledgeRepository = new PrismaKnowledgeRepository();
const sessionRepository = new PrismaSessionRepository();

export const createKnowledgeRoute: FastifyPluginCallbackZod = (app) => {
	const createKnowledgeService = new CreateKnowledgeService(
		problemRepository,
		knowledgeRepository,
	);

	app.post(
		"/knowledges",
		{
			preHandler: [authenticate(app, sessionRepository)],
			schema: {
				tags: ["Knowledge"],
				summary: "Create knowledge",
				description: "Creates a new knowledge entry.",
				body: z.object({
					title: z.string().min(1, "Title is required."),
					problems: z.array(z.string().min(1, "Problem cannot be empty.")),
					solution: z.string().min(1, "Solution is required."),
					tags: z.string().nullable(),
					isActive: z.boolean(),
				}),
				response: {
					201: z.object({
						knowledgeId: z.number(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { title, problems, solution, tags, isActive } = request.body;
			const { id: userId } = request.profile;

			const serviceResponse = await createKnowledgeService.execute({
				title,
				createdById: userId,
				problems,
				solution,
				tags: tags ?? null,
				isActive,
			});

			if (serviceResponse.isLeft()) {
				return reply
					.status(500)
					.send({ message: "Internal error in knowledge creation." });
			}

			const { knowledgeId } = serviceResponse.value;

			return reply.status(201).send({ knowledgeId });
		},
	);
};
