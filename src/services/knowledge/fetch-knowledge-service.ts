/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all lint/complexity/useOptionalChain: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import type { QdrantProblemsRepository } from "../../databases/qdrant/qdrant-problems-repository";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface FetchKnowledgeServiceRequest {
	page?: number;
	totalPerPage?: number;
	problem?: string;
}

export type FetchKnowledgeServiceResponse = Either<
	Error,
	{
		result: {
			data: {
				id: number;
				title: string;
				problems: string[];
				solution: string;
				views: number;
				createdAt: Date;
				createdById: number;
				tags: string | null;
				status: "PENDING" | "APPROVED" | "DENIED";
			}[];
			page: number;
			perPage: number;
			total: number;
			totalPages: number;
		};
	}
>;

export class FetchKnowledgeService
	implements
		Service<FetchKnowledgeServiceRequest, FetchKnowledgeServiceResponse>
{
	constructor(
		private readonly problemsRepository: QdrantProblemsRepository,
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
	) {}

	async execute(
		request: FetchKnowledgeServiceRequest,
	): Promise<FetchKnowledgeServiceResponse> {
		const { problem, page = 1, totalPerPage = 9 } = request;

		try {
			const fetchKnowledge = await this.knowledgeRepository.getKnowledges();

			const { knowledge } = fetchKnowledge;

			const knowledgeResult = await Promise.all(
				knowledge.map(async (item) => {
					const {
						id,
						title,
						solution,
						createdAt,
						createdById,
						tags,
						status,
						views,
					} = item;

					const { data } =
						await this.problemsRepository.searchByKnowledgeId(id);

					return {
						id,
						title,
						problems: data,
						solution,
						views,
						createdAt,
						createdById,
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
						totalPages: Math.ceil(totalItems / totalPerPage),
						perPage: totalPerPage,
					},
				});
			}

			const dataFiltering = knowledgeResult.filter((item) => {
				const title = item.title;
				return title && title.toLowerCase().includes(problem.toLowerCase());
			});

			const totalItems = dataFiltering.length;

			const startIndex = 0;
			const endIndex = startIndex + totalPerPage;

			const paginatedData = dataFiltering.slice(startIndex, endIndex);

			return right({
				result: {
					data: paginatedData,
					page: page,
					total: totalItems,
					totalPages: Math.ceil(totalItems / totalPerPage),
					perPage: totalPerPage,
				},
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Error fetching knowledge"));
		}
	}
}
