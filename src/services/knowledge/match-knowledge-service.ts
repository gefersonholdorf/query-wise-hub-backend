/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
import { right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import type { Service } from "../service";

export interface MatchKnowledgeServiceResponseResult {
	matchs: {
		id: string;
		version: number;
		score: number;
		problem: string;
		solution: {
			solutionId: number;
			solution: string;
		};
	}[];
}

export interface MatchKnowledgeServiceRequest {
	message: string;
}

export type MatchKnowledgeServiceResponse = Either<
	never,
	MatchKnowledgeServiceResponseResult
>;

export class MatchKnowledgeService
	implements
		Service<MatchKnowledgeServiceRequest, MatchKnowledgeServiceResponse>
{
	knowledgeRepository = new QdrantKnowledgeBase();
	solutionRepository = new PrismaSolutionRepository();

	async execute(
		request: MatchKnowledgeServiceRequest,
	): Promise<MatchKnowledgeServiceResponse> {
		const { message } = request;

		const embedding = await ollamaEmbeddingService(message);

		try {
			const result = await this.knowledgeRepository.searchMatch(embedding);

			const response = result.data
				.filter((item) => item.score >= 0.7)
				.sort((a, b) => b.score - a.score);

			return right({
				matchs: await Promise.all(
					response.map(async (item) => {
						const solution = await this.solutionRepository.getById(
							item.payload.solutionId,
						);
						return {
							id: item.id,
							version: item.version,
							score: item.score,
							problem: item.payload.problem,
							solution: {
								solutionId: solution.solution?.id || 0,
								solution: solution.solution?.solution || "",
							},
						};
					}),
				),
			});
		} catch (error) {
			console.error(error);
		}

		return right({
			matchs: [],
		});
	}
}
