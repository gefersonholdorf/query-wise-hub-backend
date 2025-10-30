// routes/knowledge/confirm-knowledge-route.ts
/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFoundError } from "../../../errors/not-found-error";
import { ConfirmAnalysisService } from "../../../services/analysis/confirm-analysis-service";
import { PrismaKnowledgeRepository } from "../../../databases/prisma/prisma-knowledge-repository";
import { PrismaStockHistoryRepository } from "../../../databases/prisma/prisma-stock-history-repository";
import { PrismaSessionRepository } from "../../../databases/prisma/prisma-session-repository";
import { authenticate } from "../../../decorators/authenticate";

const prismaKnowledgeRepository = new PrismaKnowledgeRepository();
const prismaStockHistoryRepository = new PrismaStockHistoryRepository();
const prismaSessionRepository = new PrismaSessionRepository();

export const confirmAnalysisRoute: FastifyPluginCallbackZod = (app) => {
	const confirmAnalysisService = new ConfirmAnalysisService(
		prismaKnowledgeRepository,
		prismaStockHistoryRepository,
	);

	app.post(
		"/analysis/confirm/:id",
		{
			preHandler: [authenticate(app, prismaSessionRepository)],
			schema: {
				tags: ["Analysis"],
				summary: "Confirm Analysys",
				description: "Confirms an existing analysis.",
				body: z.object({
					status: z.enum(["APPROVED", "DENIED"]),
					observation: z.string().optional(),
				}),
				params: z.object({
					id: z.coerce.number(),
				}),
				response: {
					204: z.object(),
					404: z.object({
						message: z.string(),
					}),
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { status, observation } = request.body;
			const { id } = request.params;
			const { id: userId } = request.profile;

			const serviceResponse = await confirmAnalysisService.execute({
				id,
				status,
				observation,
				userId,
			});

			if (serviceResponse.isLeft()) {
				if (serviceResponse.value instanceof NotFoundError) {
					return reply.status(404).send({
						message: "Analysis not found.",
					});
				}

				return reply
					.status(500)
					.send({ message: "Error in creating knowledge." });
			}

			return reply.status(204).send({});
		},
	);
};
