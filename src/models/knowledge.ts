export interface Knowledge {
	id: number;
	title: string;
	solution: string;
	createdById: number;
	status: "PENDING" | "APPROVED" | "DENIED";
	approvedAt: Date | null;
	approvedById: number | null;
	deniedAt: Date | null;
	deniedById: number | null;
	observation: string | null;
	tags: string | null;
	views: number;
	isAnalysis: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateKnowledge
	extends Omit<
		Knowledge,
		| "id"
		| "status"
		| "approvedAt"
		| "approvedById"
		| "deniedAt"
		| "deniedById"
		| "observation"
		| "isAnalysis"
		| "createdAt"
		| "updatedAt"
	> {}

export interface FetchKnowledges extends Knowledge {}
