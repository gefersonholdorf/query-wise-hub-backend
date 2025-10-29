/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import type { SessionRepository } from "../databases/repositories/session-repository";

export function authenticate(
	app: FastifyInstance,
	sessionRepository: SessionRepository,
) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			return reply.status(401).send({ error: "Token not provided." });
		}

		const [, token] = authHeader.split(" "); //Bearer <token>

		try {
			const decode = await app.jwt.verify(token);
			const { userId, role } = decode as { userId: string; role: string };

			const isTokenValid = await sessionRepository.isSessionValid(token);

			if (!isTokenValid) {
				return reply.status(401).send({ error: "Token invalid." });
			}

			request.profile = {
				id: Number(userId),
				role: role as "ADMIN" | "COMMON" | "EMPLOYEE",
			};
		} catch (err) {
			console.error(err);
			return reply.status(401).send({ error: "Token invalid." });
		}
	};
}
