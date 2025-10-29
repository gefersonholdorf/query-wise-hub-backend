/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";

export function authenticate(app: FastifyInstance) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			return reply.status(401).send({ error: "Token não fornecido" });
		}

		const [, token] = authHeader.split(" ");

		try {
			console.log(token);
			const decode = await app.jwt.verify(token);
		} catch (err) {
			return reply.status(401).send({ error: "Token inválido" });
		}
	};
}
