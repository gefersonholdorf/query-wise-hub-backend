import type { CreateSolution, FetchSolutions } from "../../models/solution";

export interface PaginationParams {
	page?: number;
	totalPerPage?: number;
}

export interface FilteringParams {
	status?: "PENDING" | "APPROVED" | "DENIED";
}

export interface SolutionCardsSummary {
	totalPendings: number;
	totalApproveds: number;
	totalDenieds: number;
	total: number;
}

export interface SolutionRepository {
	create(data: CreateSolution): Promise<{ solutionId: number }>;
	createAnalysis(data: CreateSolution): Promise<{ solutionId: number }>;
	getAll(
		pagination: PaginationParams,
		filtering: FilteringParams,
	): Promise<{
		solutions: FetchSolutions[];
		total: number;
		page: number;
		totalPerPage: number;
	}>;
	summary(): Promise<{ summary: SolutionCardsSummary }>;
}
