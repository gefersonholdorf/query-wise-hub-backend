/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyInstance } from "fastify";
import { healthRoute } from "./routes/health/health-route";
import { healthDBRoute } from "./routes/health/health-databases";
import { createUserRoute } from "./routes/users/create-user-route";
import { loginRoute } from "./routes/auth/login-route";
import { logoutRoute } from "./routes/auth/logout-route";
import { meRoute } from "./routes/users/me-user-route";
import { getUserByIdRoute } from "./routes/users/get-user-by-id-route";
import { createKnowledgeRoute } from "./routes/knowledge/create-knowledge-route";
import { matchKnowledgeRoute } from "./routes/knowledge/match-knowledge-route";
import { fetchKnowledgeToAnalyzeRoute } from "./routes/knowledge/fetch-knowledges-route";

export function httpCreateRoute(app: FastifyInstance) {
	app.register(
		async (instance) => {
			instance.register(healthRoute);
			instance.register(healthDBRoute);

			instance.register(createUserRoute);
			instance.register(getUserByIdRoute);
			instance.register(meRoute);

			instance.register(loginRoute);
			instance.register(logoutRoute);

			instance.register(createKnowledgeRoute);
			instance.register(matchKnowledgeRoute);
			instance.register(fetchKnowledgeToAnalyzeRoute);

			// instance.register(createAnalysisRoute);
			// instance.register(fetchAnalysisRoute);
			// instance.register(summaryAnalysisRoute);
			// instance.register(confirmAnalysisRoute);
			// instance.register(getAnalysisByIdRoute);
			// instance.register(updateAnalysisRoute)

			// instance.register(chatRoute);

			// instance.register(summaryDashboardRoute);
		},
		{
			prefix: "/api/v1",
		},
	);
}
