/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import type { QdrantProblemsRepository } from "../../databases/qdrant/qdrant-problems-repository";
import { left, right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import type { Service } from "../service";

export interface CreateKnowledgeServiceRequest {
	title: string;
	problems: string[];
	solution: string;
	tags: string | null;
	isActive: boolean;
	createdById: number;
}

export type CreateKnowledgeServiceResponse = Either<
	Error,
	{ knowledgeId: number }
>;

export class CreateKnowledgeService
	implements
		Service<CreateKnowledgeServiceRequest, CreateKnowledgeServiceResponse>
{
	constructor(
		private readonly problemRepository: QdrantProblemsRepository,
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
	) {}

	async execute(
		request: CreateKnowledgeServiceRequest,
	): Promise<CreateKnowledgeServiceResponse> {
		const { problems, solution, tags, isActive, title, createdById } = request;

		try {
			const newSolution = await this.knowledgeRepository.create({
				solution,
				isActive,
				tags,
				title,
				createdById,
				views: 0,
			});

			const { knowledgeId } = newSolution;

			await Promise.all(
				problems.map(async (problem) => {
					const embedding = await ollamaEmbeddingService(problem);

					const id = crypto.randomUUID();
					const createdAt = new Date().toISOString();

					await this.problemRepository.create({
						id,
						vector: embedding,
						payload: {
							problem,
							knowledgeId,
							createdAt,
						},
					});
				}),
			);

			return right({
				knowledgeId,
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
