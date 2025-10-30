import "fastify";

declare module "fastify" {
	interface FastifyRequest {
		profile: {
			id: number;
			role: "ADMIN" | "COMMON" | "EMPLOYEE";
		};
	}
}
