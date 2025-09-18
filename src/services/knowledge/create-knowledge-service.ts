import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
import { right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import type { Service } from "../service";

export interface CreateKnowledgeServiceRequest {
	problem: string;
	solution: string;
}

export type CreateKnowledgeServiceResponse = Either<
	never,
	{ knowledgeId: string }
>;

export class CreateKnowledgeService
	implements
		Service<CreateKnowledgeServiceRequest, CreateKnowledgeServiceResponse>
{
	knowledgeRepository = new QdrantKnowledgeBase();

	async execute(
		request: CreateKnowledgeServiceRequest,
	): Promise<CreateKnowledgeServiceResponse> {
		const { problem, solution } = request;

		const embedding = await ollamaEmbeddingService(problem);

		const id = crypto.randomUUID();

		const newKnowledge = await this.knowledgeRepository.create({
			id,
			vector: embedding,
			payload: {
				problem,
				solution,
			},
		});

		const { knowledgeId } = newKnowledge;

		return right({
			knowledgeId,
		});
	}
}
