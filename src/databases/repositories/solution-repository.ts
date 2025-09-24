import type { CreateSolution } from "../../models/solution";

export interface SolutionRepository {
	create(data: CreateSolution): Promise<{ solutionId: number }>;
}
