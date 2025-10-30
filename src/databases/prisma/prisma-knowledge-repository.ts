/** biome-ignore-all lint/complexity/noBannedTypes: <"explanation"> */
import type {
	CreateKnowledge,
	FetchKnowledges,
	Knowledge,
} from "../../models/knowledge";
import { prismaClient } from "../client";
import type {
	FilteringParams,
	GetKnowledgeByIdResponse,
	KnowledgeCardsSummary,
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

	async createAnalysis(
		data: CreateKnowledge,
	): Promise<{ knowledgeId: number }> {
		const { title, solution, createdById, tags, isActive } = data;
		const newSolution = await prismaClient.knowledge.create({
			data: {
				title,
				solution,
				createdById,
				tags,
				isActive,
				isAnalysis: true,
				status: "PENDING",
			},
		});
		return {
			knowledgeId: newSolution.id,
		};
	}

	async getAll(
		pagination: PaginationParams,
		filtering: FilteringParams,
	): Promise<{
		knowledges: FetchKnowledges[];
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	}> {
		const { page = 1, totalPerPage = 10 } = pagination;
		const { status, title } = filtering;
		const knowledge = await prismaClient.knowledge.findMany({
			where: {
				isAnalysis: true,
				status: status ?? undefined,
				title: title ?? undefined,
			},
			orderBy: {
				id: "desc",
			},
			take: totalPerPage,
			skip: (page - 1) * totalPerPage,
		});

		const total = await prismaClient.knowledge.count({
			where: {
				isAnalysis: true,
				status: status ?? undefined,
				title: title ?? undefined,
			},
		});

		const totalPages = Math.ceil(total / totalPerPage);
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
			knowledges: knowledgeFormated,
			page,
			perPage: totalPerPage,
			total,
			totalPages,
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

	async summary(): Promise<{ summary: KnowledgeCardsSummary }> {
		const totalKnowledges = await prismaClient.knowledge.count();
		const totalPendings = await prismaClient.knowledge.count({
			where: {
				isAnalysis: true,
				status: "PENDING",
			},
		});
		const totalApproveds = await prismaClient.knowledge.count({
			where: {
				isAnalysis: true,
				status: "APPROVED",
			},
		});
		const totalDenieds = await prismaClient.knowledge.count({
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

	async getAnalysisById(
		id: number,
	): Promise<{ knowledge: GetKnowledgeByIdResponse | null }> {
		const knowledge = await prismaClient.knowledge.findUnique({
			where: {
				id,
				isAnalysis: true,
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

	async save(knowledge: Knowledge, id: number): Promise<void> {
		await prismaClient.knowledge.update({
			where: {
				id,
			},
			data: {
				solution: knowledge.solution,
				approvedById: knowledge.approvedById,
				approvedAt: knowledge.approvedAt,
				createdAt: knowledge.createdAt,
				createdById: knowledge.createdById,
				deniedAt: knowledge.deniedAt,
				deniedById: knowledge.deniedById,
				isActive: knowledge.isActive,
				isAnalysis: knowledge.isAnalysis,
				observation: knowledge.observation,
				status: knowledge.status,
				tags: knowledge.tags,
				updatedAt: knowledge.updatedAt,
			},
		});
	}
}
