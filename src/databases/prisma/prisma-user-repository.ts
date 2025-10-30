import type { CreateUserDTO, User } from "../../models/user";
import { prismaClient } from "../client";
import type { UserRepository } from "../repositories/user-repository";

export class PrismaUserRepository implements UserRepository {
	async createUser(data: CreateUserDTO): Promise<{ userId: number }> {
		const userCreated = await prismaClient.user.create({
			data: {
				cpf: data.cpf,
				email: data.email,
				fullName: data.fullName,
				passwordHash: data.passwordHash,
				username: data.username,
				role: data.role,
				isActive: true,
			},
		});

		return {
			userId: userCreated.id,
		};
	}

	async findByEmailOrCpfOrUsername(
		login: string,
	): Promise<{ user: User | null }> {
		const user = await prismaClient.user.findFirst({
			where: {
				OR: [{ email: login }, { cpf: login }, { username: login }],
			},
		});

		if (!user) {
			return {
				user: null,
			};
		}

		return {
			user,
		};
	}

	async lastLogin(userId: number): Promise<void> {
		await prismaClient.user.update({
			where: {
				id: userId,
			},
			data: {
				lastLogin: new Date(),
			},
		});
	}

	async findById(userId: number): Promise<{ user: User | null }> {
		const user = await prismaClient.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			return {
				user: null,
			};
		}

		return {
			user,
		};
	}
}
