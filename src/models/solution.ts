import type { status } from "@prisma/client";

export interface Solution {
	id: number;
	solution: string;
	createdBy: string;
	status: "PENDING" | "APPROVED" | "DENIED";
	approvedAt: Date | null;
	approvedBy: string | null;
	deniedAt: Date | null;
	deniedBy: string | null;
	observation: string | null;
	tags: string | null;
	isAnalysis: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateSolution
	extends Omit<
		Solution,
		| "id"
		| "status"
		| "approvedAt"
		| "approvedBy"
		| "deniedAt"
		| "deniedBy"
		| "observation"
		| "isAnalysis"
		| "createdAt"
		| "updatedAt"
	> {}

export interface FetchSolutions extends Solution {}
