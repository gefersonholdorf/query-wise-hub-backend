import type { CreateSolution } from "../../models/solution";
import { prismaClient } from "../client";
import type { SolutionRepository } from "../repositories/solution-repository";

export class PrismaSolutionRepository implements SolutionRepository {
	async create(data: CreateSolution): Promise<{ solutionId: number }> {
		const { solution, createdBy, tags, isActive } = data;

		const newSolution = await prismaClient.solutions.create({
			data: {
				solution,
				createdBy,
				tags,
				isActive,
				isAnalysis: false,
				status: "APPROVED",
			},
		});

		return {
			solutionId: newSolution.id,
		};
	}
}
