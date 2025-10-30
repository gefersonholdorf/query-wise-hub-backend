/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import type { QdrantProblemsRepository } from "../../databases/qdrant/qdrant-problems-repository";
import { left, right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import type { Service } from "../service";

export interface MatchKnowledgeServiceResponseResult {
	matchs: ({
		id: string;
		version: number;
		score: number;
		problem: string;
		knowledge: {
			knowledgeId: number;
			solution: string;
		};
	} | null)[];
}

export interface MatchKnowledgeServiceRequest {
	message: string;
}

export type MatchKnowledgeServiceResponse = Either<
	Error,
	MatchKnowledgeServiceResponseResult
>;

export class MatchKnowledgeService
	implements
		Service<MatchKnowledgeServiceRequest, MatchKnowledgeServiceResponse>
{
	constructor(
		private readonly problemsRepository: QdrantProblemsRepository,
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
	) {}

	async execute(
		request: MatchKnowledgeServiceRequest,
	): Promise<MatchKnowledgeServiceResponse> {
		const { message } = request;

		const embedding = await ollamaEmbeddingService(message);

		try {
			const result = await this.problemsRepository.searchMatch(embedding);

			const response = result.data
				.filter((item) => item.score >= 0.7)
				.sort((a, b) => b.score - a.score);

			return right({
				matchs: await Promise.all(
					response.map(async (item) => {
						const knowledge = await this.knowledgeRepository.getById(
							item.payload.knowledgeId,
						);

						if (!knowledge.knowledge) {
							return null;
						}

						const { knowledge: knowledgeDetail } = knowledge;
						return {
							id: item.id,
							version: item.version,
							score: item.score,
							problem: item.payload.problem,
							knowledge: {
								knowledgeId: knowledgeDetail.id,
								solution: knowledgeDetail.solution,
							},
						};
					}),
				),
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
