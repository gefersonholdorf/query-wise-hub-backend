/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
import { right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface FetchAnalysisServiceRequest {
	page?: number;
	totalPerPage?: number;
	status?: "PENDING" | "APPROVED" | "DENIED";
}

export type FetchAnalysisServiceResponse = Either<
	never,
	{
		result: {
			data: {
				id: number;
				problems: string[];
				solution: string;
				createdAt: Date;
				createdBy: string;
				tags: string | null;
				status: "PENDING" | "APPROVED" | "DENIED";
			}[];
			total: number;
			page: number;
			pageSize: number;
			totalPages: number;
			totalPerPage: number;
		};
	}
>;

export class FetchAnalysisService
	implements Service<FetchAnalysisServiceRequest, FetchAnalysisServiceResponse>
{
	qdrantRepository = new QdrantKnowledgeBase();
	solutionRepository = new PrismaSolutionRepository();

	async execute(
		request: FetchAnalysisServiceRequest,
	): Promise<FetchAnalysisServiceResponse> {
		const { page = 1, totalPerPage = 10, status } = request;

		try {
			const fetchSolutions = await this.solutionRepository.getAll(
				{
					page,
					totalPerPage,
				},
				{
					status,
				},
			);

			const { solutions } = fetchSolutions;

			const knowledgeResult = await Promise.all(
				solutions.map(async (item) => {
					const { id, solution, createdAt, createdBy, tags, status } = item;

					const { data } = await this.qdrantRepository.searchBySolutionId(id);

					return {
						id,
						problems: data,
						solution,
						createdAt,
						createdBy,
						tags,
						status,
					};
				}),
			);

			return right({
				result: {
					data: knowledgeResult,
					page: fetchSolutions.page,
					total: fetchSolutions.total,
					pageSize: fetchSolutions.pageSize,
					totalPages: fetchSolutions.totalPages,
					totalPerPage: fetchSolutions.totalPerPage,
				},
			});
		} catch (error) {
			console.error(error);
			throw new Error("Erro interno.");
		}
	}
}
