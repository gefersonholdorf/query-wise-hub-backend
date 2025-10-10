/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all lint/complexity/useOptionalChain: <"explanation"> */
import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
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
			totalPage: number;
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
		const { problem, page = 1, totalPerPage = 9 } = request;

		try {
			const fetchSolutions = await this.solutionRepository.getKnowledges();

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
				const totalItems = knowledgeResult.length;

				const startIndex = (page - 1) * totalPerPage;
				const endIndex = startIndex + totalPerPage;

				const paginatedData = knowledgeResult.slice(startIndex, endIndex);

				return right({
					result: {
						data: paginatedData,
						page: page,
						total: totalItems,
						totalPage: paginatedData.length,
						totalPerPage: totalPerPage,
					},
				});
			}

			const dataFiltering = knowledgeResult.filter((item) => {
				const firstProblem = item.problems[0];
				return (
					firstProblem &&
					firstProblem.toLowerCase().includes(problem.toLowerCase())
				);
			});

			const totalItems = dataFiltering.length;

			const startIndex = (page - 1) * totalPerPage;
			const endIndex = startIndex + totalPerPage;

			const paginatedData = knowledgeResult.slice(startIndex, endIndex);

			return right({
				result: {
					data: paginatedData,
					page: page,
					total: totalItems,
					totalPage: paginatedData.length,
					totalPerPage: totalPerPage,
				},
			});
		} catch (error) {
			console.error(error);
			throw new Error("Erro interno.");
		}
	}
}
