import type { CreateSolution, FetchSolutions } from "../../models/solution";
import { prismaClient } from "../client";
import type {
	FilteringParams,
	PaginationParams,
	SolutionCardsSummary,
	SolutionRepository,
} from "../repositories/solution-repository";

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

	async createAnalysis(data: CreateSolution): Promise<{ solutionId: number }> {
		const { solution, createdBy, tags, isActive } = data;

		const newSolution = await prismaClient.solutions.create({
			data: {
				solution,
				createdBy,
				tags,
				isActive,
				isAnalysis: true,
				status: "PENDING",
			},
		});

		return {
			solutionId: newSolution.id,
		};
	}

	async getAll(
		pagination: PaginationParams,
		filtering: FilteringParams,
	): Promise<{
		solutions: FetchSolutions[];
		total: number;
		page: number;
		totalPerPage: number;
	}> {
		const { page = 1, totalPerPage = 10 } = pagination;
		const { status } = filtering;

		const solutions = await prismaClient.solutions.findMany({
			where: {
				isAnalysis: true,
				status: status ?? undefined,
			},
			orderBy: {
				id: "desc",
			},
			take: totalPerPage,
			skip: (page - 1) * totalPerPage,
		});

		const total = await prismaClient.solutions.count({
			where: {
				isAnalysis: true,
				status: status ?? undefined,
			},
		});

		const solutionsFormated: FetchSolutions[] = solutions.map((item) => {
			const {
				id,
				approvedAt,
				approvedBy,
				createdAt,
				createdBy,
				deniedAt,
				deniedBy,
				isActive,
				isAnalysis,
				observation,
				solution,
				status,
				tags,
				updatedAt,
			} = item;
			return {
				id,
				approvedAt,
				approvedBy,
				createdAt,
				createdBy,
				deniedAt,
				deniedBy,
				isActive,
				isAnalysis,
				observation,
				solution,
				status,
				tags,
				updatedAt,
			};
		});

		return {
			solutions: solutionsFormated,
			total,
			page,
			totalPerPage,
		};
	}

	async summary(): Promise<{ summary: SolutionCardsSummary }> {
		const totalPendings = await prismaClient.solutions.count({
			where: {
				isAnalysis: true,
				status: "PENDING",
			},
		});

		const totalApproveds = await prismaClient.solutions.count({
			where: {
				isAnalysis: true,
				status: "APPROVED",
			},
		});

		const totalDenieds = await prismaClient.solutions.count({
			where: {
				isAnalysis: true,
				status: "DENIED",
			},
		});

		const total = totalApproveds + totalDenieds + totalPendings;

		return {
			summary: {
				totalPendings,
				totalApproveds,
				totalDenieds,
				total,
			},
		};
	}
}
