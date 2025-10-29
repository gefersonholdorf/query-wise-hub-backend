export interface CreateSessionDTO {
	userId: number;
	token: string;
	expiresAt: Date;
	ip: string;
	userAgent: string;
}

export interface SessionRepository {
	createSession(data: CreateSessionDTO): Promise<void>;
	invalidateSession(userId: number): Promise<void>;
	isSessionValid(token: string): Promise<boolean>;
}
