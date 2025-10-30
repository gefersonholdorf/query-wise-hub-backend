/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import type { PrismaStockHistoryRepository } from "../../databases/prisma/prisma-stock-history-repository";
import type { QdrantProblemsRepository } from "../../databases/qdrant/qdrant-problems-repository";
import { left, right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import { pollinationsGenerateProblems } from "../pollinations/pollinations-generate-problems";
import type { Service } from "../service";

export interface CreateAnalysisServiceRequest {
	title: string;
	problem: string;
	solution: string;
	tags: string | null;
}

export type CreateAnalysisServiceResponse = Either<
	Error,
	{ analysisId: number }
>;

export class CreateAnalysisService
	implements
		Service<CreateAnalysisServiceRequest, CreateAnalysisServiceResponse>
{
	constructor(
		private readonly problemsRepository: QdrantProblemsRepository,
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
		private readonly stockHistoryRepository: PrismaStockHistoryRepository,
	) {}

	async execute(
		request: CreateAnalysisServiceRequest,
	): Promise<CreateAnalysisServiceResponse> {
		const { title, problem, solution, tags } = request;

		const problems = await pollinationsGenerateProblems(problem);

		try {
			const newKnowledge = await this.knowledgeRepository.createAnalysis({
				title,
				solution,
				createdById: 1,
				isActive: true,
				tags,
				views: 0,
			});

			await this.stockHistoryRepository.create(
				"Criado por ADMIN",
				newKnowledge.knowledgeId,
			);

			const { knowledgeId } = newKnowledge;

			await Promise.all(
				problems.map(async (problem) => {
					const embedding = await ollamaEmbeddingService(problem);

					const id = crypto.randomUUID();
					const createdAt = new Date().toISOString();

					try {
						await this.problemsRepository.create({
							id,
							vector: embedding,
							payload: {
								problem,
								knowledgeId,
								createdAt,
							},
						});
					} catch (error) {
						console.error(error);
					}
				}),
			);

			return right({
				analysisId: knowledgeId,
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
