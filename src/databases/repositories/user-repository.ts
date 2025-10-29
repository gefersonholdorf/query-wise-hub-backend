import type { CreateUserDTO, User } from "../../models/user";

export interface UserRepository {
	createUser(data: CreateUserDTO): Promise<{ userId: number }>;
	findByEmailOrCpfOrUsername(
		email?: string,
		cpf?: string,
		username?: string,
	): Promise<{ user: User | null }>;
	lastLogin(userId: number): Promise<void>;
}
