import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
import type { KnowledgeBaseResult } from "../../models/knowledge";
import { right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import type { Service } from "../service";

export interface MatchKnowledgeServiceRequest {
	message: string;
}

export type MatchKnowledgeServiceResponse = Either<
	never,
	{ bestMatch: KnowledgeBaseResult | null }
>;

export class MatchKnowledgeService
	implements
		Service<MatchKnowledgeServiceRequest, MatchKnowledgeServiceResponse>
{
	knowledgeRepository = new QdrantKnowledgeBase();

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

			if (response.length > 0) {
				return right({
					bestMatch: response[0],
				});
			}

			return right({
				bestMatch: null,
			});
		} catch (error) {
			console.error(error);
		}

		return right({
			bestMatch: null,
		});
	}
}
