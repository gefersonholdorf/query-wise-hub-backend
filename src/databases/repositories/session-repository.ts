export interface CreateSessionDTO {
	userId: number;
	token: string;
	expiresAt: Date;
	ip: string;
	userAgent: string;
}

export interface SessionRepository {
	createSession(data: CreateSessionDTO): Promise<void>;
	invalidateSession(token: string): Promise<void>;
	isSessionValid(token: string): Promise<boolean>;
}
