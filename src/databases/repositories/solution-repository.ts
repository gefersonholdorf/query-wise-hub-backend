/** biome-ignore-all lint/complexity/noBannedTypes: <"explanation"> */
import type {
	CreateSolution,
	FetchSolutions,
	Solution,
} from "../../models/solution";

export interface PaginationParams {
	page?: number;
	totalPerPage?: number;
}

export interface FilteringParams {
	status?: "PENDING" | "APPROVED" | "DENIED";
	filter?: string;
}

export interface SolutionCardsSummary {
	totalKnowledges: number;
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
		totalPage: number;
		totalPerPage: number;
	}>;
	getKnowledges(): Promise<{ solutions: FetchSolutions[] }>;
	summary(): Promise<{ summary: SolutionCardsSummary }>;
	getById(id: number): Promise<{ solution: Solution | null }>;
	save(solution: Solution, id: number): Promise<{}>;
}
