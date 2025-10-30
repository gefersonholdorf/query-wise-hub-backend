/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { PrismaSessionRepository } from "../../databases/prisma/prisma-session-repository";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface LogoutServiceRequest {
	userId: number;
}

export type LogoutServiceResponse = Either<Error, void>;

export class LogoutService
	implements Service<LogoutServiceRequest, LogoutServiceResponse>
{
	constructor(private readonly sessionRepository: PrismaSessionRepository) {}

	async execute(request: LogoutServiceRequest): Promise<LogoutServiceResponse> {
		const { userId } = request;

		try {
			await this.sessionRepository.invalidateSession(userId);
			return right(undefined);
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
