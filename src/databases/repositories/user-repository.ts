import type { CreateUserDTO, User } from "../../models/user";

export interface UserRepository {
	createUser(data: CreateUserDTO): Promise<{ userId: number }>;
	findByEmailOrCpfOrUsername(login: string): Promise<{ user: User | null }>;
	lastLogin(userId: number): Promise<void>;
	findById(userId: number): Promise<{ user: User | null }>;
}
