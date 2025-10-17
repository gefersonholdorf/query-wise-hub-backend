/** biome-ignore-all lint/complexity/noBannedTypes: <"explanation"> */
import type {
	CreateSolution,
	FetchSolutions,
	Solution,
} from "../../models/solution";
import { prismaClient } from "../client";
import type {
	FilteringParams,
	GetSolutionByIdResponse,
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
		pageSize: number;
		totalPages: number;
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

		const pageSize = solutions.length;

		const total = await prismaClient.solutions.count({
			where: {
				isAnalysis: true,
				status: status ?? undefined,
			},
		});

		const totalPages = Math.ceil(total / totalPerPage);

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
				views,
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
				views,
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
			pageSize,
			totalPages,
			totalPerPage,
		};
	}

	async getKnowledges(): Promise<{ solutions: FetchSolutions[] }> {
		const solutions = await prismaClient.solutions.findMany({
			where: {
				status: "APPROVED",
			},
			orderBy: {
				id: "desc",
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
				views,
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
				views,
				solution,
				status,
				tags,
				updatedAt,
			};
		});

		return {
			solutions: solutionsFormated,
		};
	}

	async summary(): Promise<{ summary: SolutionCardsSummary }> {
		const totalKnowledges = await prismaClient.solutions.count();

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
				totalKnowledges,
				totalPendings,
				totalApproveds,
				totalDenieds,
				total,
			},
		};
	}

	async getById(
		id: number,
	): Promise<{ solution: GetSolutionByIdResponse | null }> {
		const solution = await prismaClient.solutions.findUnique({
			where: {
				id,
			},
		});

		if (!solution) {
			return {
				solution: null,
			};
		}

		const stockHistory = await prismaClient.stockHistory.findMany({
			where: {
				solutionId: id,
			},
			orderBy: {
				id: "desc",
			},
		});

		return {
			solution: {
				id,
				approvedAt: solution.approvedAt,
				approvedBy: solution.approvedBy,
				createdAt: solution.createdAt,
				createdBy: solution.createdBy,
				deniedAt: solution.deniedAt,
				deniedBy: solution.deniedBy,
				isActive: solution.isActive,
				isAnalysis: solution.isAnalysis,
				observation: solution.observation,
				views: solution.views,
				solution: solution.solution,
				status: solution.status,
				tags: solution.tags,
				updatedAt: solution.updatedAt,
				stockHistory: stockHistory,
			},
		};
	}

	async save(solution: Solution, id: number): Promise<{}> {
		await prismaClient.solutions.update({
			where: {
				id,
			},
			data: {
				solution: solution.solution,
				approvedBy: solution.approvedBy,
				approvedAt: solution.approvedAt,
				createdAt: solution.createdAt,
				createdBy: solution.createdBy,
				deniedAt: solution.deniedAt,
				deniedBy: solution.deniedBy,
				isActive: solution.isActive,
				isAnalysis: solution.isAnalysis,
				observation: solution.observation,
				status: solution.status,
				tags: solution.tags,
				updatedAt: solution.updatedAt,
			},
		});

		return {};
	}
}
