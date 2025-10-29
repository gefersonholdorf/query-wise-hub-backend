// /** biome-ignore-all assist/source/organizeImports: <"explanation"> */
// /** biome-ignore-all lint/suspicious/noRedeclare: <"explanation"> */
// import type { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
// import type { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
// import { NotFoundError } from "../../errors/not-found-error";
// import { left, right, type Either } from "../../utils/either";
// import type { Service } from "../service";

// export interface GetAnalysisByIdServiceRequest {
// 	id: number;
// }

// export type GetAnalysisByIdServiceResponse = Either<
// 	NotFoundError,
// 	{
// 		result: {
// 			id: number;
// 			problems: string[];
// 			solution: string;
// 			createdAt: Date;
// 			createdBy: string;
// 			tags: string | null;
// 			status: "PENDING" | "APPROVED" | "DENIED";
// 			approvedBy: string | null;
// 			approvedAt: Date | null;
// 			deniedAt: Date | null;
// 			deniedBy: string | null;
// 			observation: string | null;
// 			updatedAt: Date;
// 			stockHistory: {
// 				id: number;
// 				action: string;
// 				status: "PENDING" | "APPROVED" | "DENIED" | null;
// 				dateAt: Date;
// 			}[];
// 		};
// 	}
// >;

// export class GetAnalysisByIdService
// 	implements
// 		Service<GetAnalysisByIdServiceRequest, GetAnalysisByIdServiceResponse>
// {
// 	constructor(
// 		private readonly solutionRepository: PrismaSolutionRepository,
// 		private readonly qdrantRepository: QdrantKnowledgeBase,
// 	) {}

// 	async execute(
// 		request: GetAnalysisByIdServiceRequest,
// 	): Promise<GetAnalysisByIdServiceResponse> {
// 		const { id: analysisId } = request;

// 		try {
// 			const existingSlution = await this.solutionRepository.getById(analysisId);

// 			const { solution: data } = existingSlution;

// 			if (!data) {
// 				return left(new NotFoundError());
// 			}

// 			const {
// 				id,
// 				solution,
// 				status,
// 				createdAt,
// 				createdBy,
// 				tags,
// 				approvedBy,
// 				approvedAt,
// 				deniedAt,
// 				deniedBy,
// 				observation,
// 				updatedAt,
// 				stockHistory,
// 			} = data;

// 			const problems = await this.qdrantRepository.searchBySolutionId(id);

// 			return right({
// 				result: {
// 					id,
// 					problems: problems.data,
// 					solution,
// 					status,
// 					createdAt,
// 					createdBy,
// 					tags,
// 					approvedAt,
// 					approvedBy,
// 					deniedAt,
// 					deniedBy,
// 					observation,
// 					updatedAt,
// 					stockHistory,
// 				},
// 			});
// 		} catch (error) {
// 			console.error(error);
// 			throw new Error("Erro interno.");
// 		}
// 	}
// }
