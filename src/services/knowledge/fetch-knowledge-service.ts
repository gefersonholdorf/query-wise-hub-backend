/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
import type { KnowledgeSearchResult } from "../../models/knowledge";
import { right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface FetchKnowledgeServiceRequest {
	page?: number;
	totalPerPage?: number;
	problem?: string;
}

export type FetchKnowledgeServiceResponse = Either<
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
			totalPerPage: number;
		};
	}
>;

export class FetchKnowledgeService
	implements
		Service<FetchKnowledgeServiceRequest, FetchKnowledgeServiceResponse>
{
	qdrantRepository = new QdrantKnowledgeBase();
	solutionRepository = new PrismaSolutionRepository();

	async execute(
		request: FetchKnowledgeServiceRequest,
	): Promise<FetchKnowledgeServiceResponse> {
		const { problem, page, totalPerPage } = request;

		try {
			const fetchSolutions = await this.solutionRepository.getAll(
				{
					page,
					totalPerPage,
				},
				{
					status: "APPROVED",
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

			if (!problem) {
				return right({
					result: {
						data: knowledgeResult,
						page: fetchSolutions.page,
						total: fetchSolutions.total,
						totalPerPage: fetchSolutions.totalPerPage,
					},
				});
			}

			const dataFiltering = knowledgeResult.filter((item) =>
				item.problems.some((p) =>
					p.toLowerCase().includes(problem.toLowerCase()),
				),
			);

			return right({
				result: {
					data: dataFiltering,
					page: fetchSolutions.page,
					total: fetchSolutions.total,
					totalPerPage: fetchSolutions.totalPerPage,
				},
			});
		} catch (error) {
			console.error(error);
			throw new Error("Erro interno.");
		}
	}
}
