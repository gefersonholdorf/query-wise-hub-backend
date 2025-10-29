import type {
	CreateKnowledge,
	FetchKnowledges,
	Knowledge,
} from "../../models/knowledge";

export interface PaginationParams {
	page?: number;
	totalPerPage?: number;
}

export interface FilteringParams {
	status?: "PENDING" | "APPROVED" | "DENIED";
	filter?: string;
}

export interface KnowledgeCardsSummary {
	totalKnowledges: number;
	totalPendings: number;
	totalApproveds: number;
	totalDenieds: number;
	total: number;
}

export interface GetKnowledgeByIdResponse extends Knowledge {
	stockHistory: {
		id: number;
		action: string;
		status: "PENDING" | "APPROVED" | "DENIED" | null;
		dateAt: Date;
	}[];
}

export interface KnowledgeRepository {
	create(data: CreateKnowledge): Promise<{ knowledgeId: number }>;
	// createAnalysis(data: CreateKnowledge): Promise<{ knowledgeId: number }>;
	getAll(
		pagination: PaginationParams,
		filtering: FilteringParams,
	): Promise<{
		knowledges: FetchKnowledges[];
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
		totalPerPage: number;
	}>;
	getKnowledges(): Promise<{ knowledge: FetchKnowledges[] }>;
	// summary(): Promise<{ summary: KnowledgeCardsSummary }>;
	getById(id: number): Promise<{ knowledge: GetKnowledgeByIdResponse | null }>;
	// save(Knowledge: Knowledge, id: number): Promise<never>;
}
