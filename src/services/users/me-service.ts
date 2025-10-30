/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all lint/correctness/noInvalidUseBeforeDeclaration: <"explanation"> */
import type { PrismaUserRepository } from "../../databases/prisma/prisma-user-repository";
import { NotFoundError } from "../../errors/not-found-error";
import type { User } from "../../models/user";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface MeServiceRequest {
	userId: number;
}

export type MeServiceResponse = Either<NotFoundError | Error, { user: User }>;

export class MeService implements Service<MeServiceRequest, MeServiceResponse> {
	constructor(private readonly userRepository: PrismaUserRepository) {}

	async execute(request: MeServiceRequest): Promise<MeServiceResponse> {
		const { userId } = request;

		try {
			const existingUser = await this.userRepository.findById(userId);

			if (!existingUser.user) {
				return left(new NotFoundError());
			}

			return right({
				user: existingUser.user,
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
