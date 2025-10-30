/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import type { QdrantProblemsRepository } from "../../databases/qdrant/qdrant-problems-repository";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface FetchAnalysisServiceRequest {
	page?: number;
	totalPerPage?: number;
	status?: "PENDING" | "APPROVED" | "DENIED";
	title?: string;
}

export type FetchAnalysisServiceResponse = Either<
	Error,
	{
		result: {
			data: {
				id: number;
				title: string;
				problems: string[];
				solution: string;
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

export class FetchAnalysisService
	implements Service<FetchAnalysisServiceRequest, FetchAnalysisServiceResponse>
{
	constructor(
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
		private readonly problemsRepository: QdrantProblemsRepository,
	) {}

	async execute(
		request: FetchAnalysisServiceRequest,
	): Promise<FetchAnalysisServiceResponse> {
		const { page = 1, totalPerPage = 10, status, title } = request;

		try {
			const fetchSolutions = await this.knowledgeRepository.getAll(
				{
					page,
					totalPerPage,
				},
				{
					status,
					title,
				},
			);

			const { knowledges } = fetchSolutions;

			const knowledgeResult = await Promise.all(
				knowledges.map(async (item) => {
					const { id, title, solution, createdAt, createdById, tags, status } =
						item;

					const { data } =
						await this.problemsRepository.searchByKnowledgeId(id);

					return {
						id,
						title,
						problems: data,
						solution,
						createdAt,
						createdById,
						tags,
						status,
					};
				}),
			);

			return right({
				result: {
					data: knowledgeResult,
					page: fetchSolutions.page,
					perPage: fetchSolutions.perPage,
					total: fetchSolutions.total,
					totalPages: fetchSolutions.totalPages,
				},
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
