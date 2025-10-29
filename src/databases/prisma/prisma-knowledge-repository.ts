/** biome-ignore-all lint/complexity/noBannedTypes: <"explanation"> */
import type { CreateKnowledge, FetchKnowledges } from "../../models/knowledge";
import { prismaClient } from "../client";
import type {
	FilteringParams,
	GetKnowledgeByIdResponse,
	KnowledgeRepository,
	PaginationParams,
} from "../repositories/knowledge-repository";

export class PrismaKnowledgeRepository implements KnowledgeRepository {
	async create(data: CreateKnowledge): Promise<{ knowledgeId: number }> {
		const { solution, createdById, tags, isActive, title, views } = data;
		const newSolution = await prismaClient.knowledge.create({
			data: {
				solution,
				createdById,
				tags,
				isActive,
				title,
				views,
				isAnalysis: false,
				status: "APPROVED",
			},
		});
		return {
			knowledgeId: newSolution.id,
		};
	}
	// async createAnalysis(data: CreateSolution): Promise<{ solutionId: number }> {
	// 	const { solution, createdBy, tags, isActive } = data;
	// 	const newSolution = await prismaClient.knowledge.create({
	// 		data: {
	// 			solution,
	// 			createdBy,
	// 			tags,
	// 			isActive,
	// 			isAnalysis: true,
	// 			status: "PENDING",
	// 		},
	// 	});
	// 	return {
	// 		solutionId: newSolution.id,
	// 	};
	// }
	async getAll(
		pagination: PaginationParams,
		filtering: FilteringParams,
	): Promise<{
		solutions: FetchKnowledges[];
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
		totalPerPage: number;
	}> {
		const { page = 1, totalPerPage = 10 } = pagination;
		const { status } = filtering;
		const knowledge = await prismaClient.knowledge.findMany({
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
	async getKnowledges(): Promise<{ knowledge: FetchKnowledges[] }> {
		const knowledge = await prismaClient.knowledge.findMany({
			where: {
				status: "APPROVED",
			},
			orderBy: {
				id: "desc",
			},
		});
		const knowledgeFormated: FetchKnowledges[] = knowledge.map((item) => {
			const {
				id,
				title,
				approvedAt,
				approvedById,
				createdAt,
				createdById,
				deniedAt,
				deniedById,
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
				title,
				approvedAt,
				approvedById,
				createdAt,
				createdById,
				deniedAt,
				deniedById,
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
			knowledge: knowledgeFormated,
		};
	}
	// async summary(): Promise<{ summary: SolutionCardsSummary }> {
	// 	const totalKnowledges = await prismaClient.solutions.count();
	// 	const totalPendings = await prismaClient.solutions.count({
	// 		where: {
	// 			isAnalysis: true,
	// 			status: "PENDING",
	// 		},
	// 	});
	// 	const totalApproveds = await prismaClient.solutions.count({
	// 		where: {
	// 			isAnalysis: true,
	// 			status: "APPROVED",
	// 		},
	// 	});
	// 	const totalDenieds = await prismaClient.solutions.count({
	// 		where: {
	// 			isAnalysis: true,
	// 			status: "DENIED",
	// 		},
	// 	});
	// 	const total = totalApproveds + totalDenieds + totalPendings;
	// 	return {
	// 		summary: {
	// 			totalKnowledges,
	// 			totalPendings,
	// 			totalApproveds,
	// 			totalDenieds,
	// 			total,
	// 		},
	// 	};
	// }
	async getById(
		id: number,
	): Promise<{ knowledge: GetKnowledgeByIdResponse | null }> {
		const knowledge = await prismaClient.knowledge.findUnique({
			where: {
				id,
			},
		});
		if (!knowledge) {
			return {
				knowledge: null,
			};
		}
		const stockHistory = await prismaClient.stockHistory.findMany({
			where: {
				knowledgeId: id,
			},
			orderBy: {
				id: "desc",
			},
		});
		return {
			knowledge: {
				id,
				title: knowledge.title,
				approvedAt: knowledge.approvedAt,
				approvedById: knowledge.approvedById,
				createdAt: knowledge.createdAt,
				createdById: knowledge.createdById,
				deniedAt: knowledge.deniedAt,
				deniedById: knowledge.deniedById,
				isActive: knowledge.isActive,
				isAnalysis: knowledge.isAnalysis,
				observation: knowledge.observation,
				views: knowledge.views,
				solution: knowledge.solution,
				status: knowledge.status,
				tags: knowledge.tags,
				updatedAt: knowledge.updatedAt,
				stockHistory: stockHistory,
			},
		};
	}
	// async save(solution: Solution, id: number): Promise<{}> {
	// 	await prismaClient.solutions.update({
	// 		where: {
	// 			id,
	// 		},
	// 		data: {
	// 			solution: solution.solution,
	// 			approvedBy: solution.approvedBy,
	// 			approvedAt: solution.approvedAt,
	// 			createdAt: solution.createdAt,
	// 			createdBy: solution.createdBy,
	// 			deniedAt: solution.deniedAt,
	// 			deniedBy: solution.deniedBy,
	// 			isActive: solution.isActive,
	// 			isAnalysis: solution.isAnalysis,
	// 			observation: solution.observation,
	// 			status: solution.status,
	// 			tags: solution.tags,
	// 			updatedAt: solution.updatedAt,
	// 		},
	// 	});
	// 	return {};
	// }
}
