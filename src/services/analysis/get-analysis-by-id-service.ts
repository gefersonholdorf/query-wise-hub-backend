/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all lint/suspicious/noRedeclare: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import type { QdrantProblemsRepository } from "../../databases/qdrant/qdrant-problems-repository";
import { NotFoundError } from "../../errors/not-found-error";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface GetAnalysisByIdServiceRequest {
	id: number;
}

export type GetAnalysisByIdServiceResponse = Either<
	NotFoundError | Error,
	{
		result: {
			id: number;
			title: string;
			problems: string[];
			solution: string;
			createdAt: Date;
			createdById: number;
			tags: string | null;
			status: "PENDING" | "APPROVED" | "DENIED";
			approvedById: number | null;
			approvedAt: Date | null;
			deniedAt: Date | null;
			deniedById: number | null;
			observation: string | null;
			updatedAt: Date;
			stockHistory: {
				id: number;
				action: string;
				status: "PENDING" | "APPROVED" | "DENIED" | null;
				dateAt: Date;
			}[];
		};
	}
>;

export class GetAnalysisByIdService
	implements
		Service<GetAnalysisByIdServiceRequest, GetAnalysisByIdServiceResponse>
{
	constructor(
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
		private readonly problemsRepository: QdrantProblemsRepository,
	) {}

	async execute(
		request: GetAnalysisByIdServiceRequest,
	): Promise<GetAnalysisByIdServiceResponse> {
		const { id: analysisId } = request;

		try {
			const existingSlution =
				await this.knowledgeRepository.getAnalysisById(analysisId);

			const { knowledge: data } = existingSlution;

			if (!data) {
				return left(new NotFoundError());
			}

			const {
				id,
				title,
				solution,
				status,
				createdAt,
				createdById,
				tags,
				approvedById,
				approvedAt,
				deniedAt,
				deniedById,
				observation,
				updatedAt,
				stockHistory,
			} = data;

			const problems = await this.problemsRepository.searchByKnowledgeId(id);

			return right({
				result: {
					id,
					title,
					problems: problems.data,
					solution,
					status,
					createdAt,
					createdById,
					tags,
					approvedAt,
					approvedById,
					deniedAt,
					deniedById,
					observation,
					updatedAt,
					stockHistory,
				},
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
