import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod/v4";
import { backendMCP } from "../../../mcp/backend-mcp";

export const chatRoute: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/chat",
		{
			schema: {
				summary: "Send a chat message",
				description:
					"Use this route to send a user message to the chat system.",
				tags: ["Chat"],
				body: z.object({
					message: z.string().min(1, "A mensagem não pode ser vazia."),
				}),
			},
		},
		async (request, reply) => {
			const { message } = request.body;
			const result = await backendMCP(message);
			return reply.send({ message: result });
		},
	);
};
