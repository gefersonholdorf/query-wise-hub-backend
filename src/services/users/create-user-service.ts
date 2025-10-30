import type { PrismaUserRepository } from "../../databases/prisma/prisma-user-repository";
import { EntityAlreadyExistsError } from "../../errors/entity-already-exists-error";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";
import bcryptjs from "bcryptjs";

export interface CreateUserServiceRequest {
	email: string;
	cpf: string;
	username: string;
	password: string;
	fullName?: string;
	role: "COMMON" | "ADMIN" | "EMPLOYEE";
}

export type CreateUserServiceResponse = Either<
	EntityAlreadyExistsError | Error,
	{ userId: number }
>;

export class CreateUserService
	implements Service<CreateUserServiceRequest, CreateUserServiceResponse>
{
	constructor(private readonly userRepository: PrismaUserRepository) {}

	async execute(
		request: CreateUserServiceRequest,
	): Promise<CreateUserServiceResponse> {
		const { email, cpf, username, password, fullName, role } = request;

		try {
			const existingUser =
				await this.userRepository.findByEmailOrCpfOrUsername(email);

			if (existingUser.user) {
				return left(
					new EntityAlreadyExistsError(
						"User with given email, cpf or username already exists.",
					),
				);
			}

			const passwordHash = await bcryptjs.hash(password, 8);

			const { userId } = await this.userRepository.createUser({
				email,
				cpf,
				username,
				passwordHash,
				fullName,
				role,
			});

			return right({
				userId,
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
