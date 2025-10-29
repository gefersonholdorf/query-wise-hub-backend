import type { Problem, ProblemResult } from "../../models/problem";

export interface PaginationParams {
	page?: number;
	quantityPerPage?: number;
}

export interface Filtering {
	problem?: string;
}

export interface ProblemsRepository {
	create(data: Problem): Promise<{ problemId: string }>;
	search(
		params: PaginationParams,
		filtering: Filtering,
	): Promise<{ data: string[] }>;
	searchByKnowledgeId(id: number): Promise<{ data: string[] }>;
	searchMatch(search: number[]): Promise<{ data: ProblemResult[] }>;
	save(data: Problem, knowledgeId: number): Promise<void>;
	delete(problemId: number): Promise<void>;
}
