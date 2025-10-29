/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { FastifyInstance } from "fastify";
import type { PrismaUserRepository } from "../../databases/prisma/prisma-user-repository";
import { CredentialsInvalidError } from "../../errors/credentials-invalid";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";
import bcryptjs from "bcryptjs";
import type { PrismaSessionRepository } from "../../databases/prisma/prisma-session-repository";

export interface LogoutServiceRequest {
	email?: string;
	cpf?: string;
	username?: string;
	password: string;
	ip: string;
	userAgent: string;
}

export type LogoutServiceResponse = Either<
	CredentialsInvalidError | Error,
	{ token: string }
>;

export class LogoutService
	implements Service<LogoutServiceRequest, LogoutServiceResponse>
{
	constructor(
		private readonly userRepository: PrismaUserRepository,
		private readonly sessionRepository: PrismaSessionRepository,
		private readonly app: FastifyInstance,
	) {}

	async execute(request: LogoutServiceRequest): Promise<LogoutServiceResponse> {
		const { email, cpf, username, password, ip, userAgent } = request;

		try {
			const existingUser = await this.userRepository.findByEmailOrCpfOrUsername(
				email,
				cpf,
				username,
			);

			if (!existingUser.user) {
				return left(new CredentialsInvalidError("Credentials invalid"));
			}

			const isPasswordValid = await bcryptjs.compare(
				password,
				existingUser.user.passwordHash,
			);

			console.log(isPasswordValid);

			if (!isPasswordValid) {
				return left(new CredentialsInvalidError("Credentials invalid"));
			}

			const token = await this.app.jwt.sign(
				{
					userId: existingUser.user.id,
					role: existingUser.user.role,
				},
				{
					expiresIn: "1d",
				},
			);

			await this.sessionRepository.createSession({
				userId: existingUser.user.id,
				token,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
				ip,
				userAgent,
			});

			return right({
				token,
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
