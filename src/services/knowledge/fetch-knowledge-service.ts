/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
import type { KnowledgeSearchResult } from "../../models/knowledge";
import { right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface FetchKnowledgeServiceRequest {
	cursor?: string;
	limit?: number;
	problem?: string;
}

export type FetchKnowledgeServiceResponse = Either<
	never,
	{ result: KnowledgeSearchResult }
>;

export class FetchKnowledgeService
	implements
		Service<FetchKnowledgeServiceRequest, FetchKnowledgeServiceResponse>
{
	knowledgeRepository = new QdrantKnowledgeBase();

	async execute(
		request: FetchKnowledgeServiceRequest,
	): Promise<FetchKnowledgeServiceResponse> {
		const { problem, cursor, limit } = request;

		const resultRepository = await this.knowledgeRepository.search(
			{
				cursor,
				limit,
			},
			{
				problem,
			},
		);

		const { data, hasMore, nextCursor } = resultRepository;

		return right({
			result: {
				data,
				hasMore,
				nextCursor,
			},
		});
	}
}
