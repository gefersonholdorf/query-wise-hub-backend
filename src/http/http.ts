import type { FastifyInstance } from "fastify";
import { healthRoute } from "./routes/health/health-route";
import { createKnowledgeRoute } from "./routes/knowledge_base/create-knowledge-route";
import { matchKnowledgeRoute } from "./routes/knowledge_base/match-knowledge-route";

export function httpCreateRoute(app: FastifyInstance) {
	app.register(
		async (instance) => {
			instance.register(healthRoute);

			instance.register(createKnowledgeRoute);
			instance.register(matchKnowledgeRoute);
		},
		{
			prefix: "/api/v1",
		},
	);
}
