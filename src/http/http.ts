import type { FastifyInstance } from "fastify";
import { healthRoute } from "./routes/health/health-route";
import { createKnowledgeRoute } from "./routes/knowledge_base/create-knowledge-route";
import { matchKnowledgeRoute } from "./routes/knowledge_base/match-knowledge-route";
import { fetchKnowledgeToAnalyzeRoute } from "./routes/knowledge_base/fetch-knowledges-route";
import { createAnalysisRoute } from "./routes/analysis/create-analysis-route";
import { healthDBRoute } from "./routes/health/health-databases";
import { fetchAnalysisRoute } from "./routes/analysis/fetch-analysis-route";
import { summaryAnalysisRoute } from "./routes/analysis/summary-analysis-route";
import { confirmAnalysisRoute } from "./routes/analysis/confirm-analysis-route";

export function httpCreateRoute(app: FastifyInstance) {
	app.register(
		async (instance) => {
			instance.register(healthRoute);
			instance.register(healthDBRoute);

			instance.register(createKnowledgeRoute);
			instance.register(matchKnowledgeRoute);
			instance.register(fetchKnowledgeToAnalyzeRoute);

			instance.register(createAnalysisRoute);
			instance.register(fetchAnalysisRoute);
			instance.register(summaryAnalysisRoute);
			instance.register(confirmAnalysisRoute);
		},
		{
			prefix: "/api/v1",
		},
	);
}
