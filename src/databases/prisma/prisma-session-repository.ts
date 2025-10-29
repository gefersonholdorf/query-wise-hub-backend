import { prismaClient } from "../client";
import type {
	CreateSessionDTO,
	SessionRepository,
} from "../repositories/session-repository";

export class PrismaSessionRepository implements SessionRepository {
	async createSession(data: CreateSessionDTO): Promise<void> {
		const { expiresAt, ip, token, userAgent, userId } = data;

		await prismaClient.session.create({
			data: {
				userId,
				token,
				expiresAt,
				isActive: true,
				ipAddress: ip,
				userAgent,
			},
		});
	}

	async invalidateSession(userId: number): Promise<void> {
		await prismaClient.session.updateMany({
			where: {
				userId,
			},
			data: {
				isActive: false,
				revokedAt: new Date(),
			},
		});
	}

	async isSessionValid(token: string): Promise<boolean> {
		const session = await prismaClient.session.findUnique({
			where: {
				token,
			},
		});

		if (!session) return false;

		const isExpired = session.expiresAt < new Date();
		const isRevoked = !!session.revokedAt;

		return session.isActive && !isExpired && !isRevoked;
	}
}
