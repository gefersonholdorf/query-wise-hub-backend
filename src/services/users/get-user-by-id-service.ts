/** bioGetUserById-ignore-all assist/source/organizeImports: <"explanation"> */
/** bioGetUserById-ignore-all lint/correctness/noInvalidUseBeforeDeclaration: <"explanation"> */
import type { PrismaUserRepository } from "../../databases/prisma/prisma-user-repository";
import { NotFoundError } from "../../errors/not-found-error";
import type { User } from "../../models/user";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface GetUserByIdServiceRequest {
	userId: number;
}

export type GetUserByIdServiceResponse = Either<
	NotFoundError | Error,
	{ user: User }
>;

export class GetUserByIdService
	implements Service<GetUserByIdServiceRequest, GetUserByIdServiceResponse>
{
	constructor(private readonly userRepository: PrismaUserRepository) {}

	async execute(
		request: GetUserByIdServiceRequest,
	): Promise<GetUserByIdServiceResponse> {
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
