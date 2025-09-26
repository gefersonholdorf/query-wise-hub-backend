/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
import { right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import { pollinationsGenerateProblems } from "../pollinations/pollinations-generate-problems";
import type { Service } from "../service";

export interface CreateAnalysisServiceRequest {
	problem: string;
	solution: string;
	tags: string | null;
}

export type CreateAnalysisServiceResponse = Either<
	never,
	{ analysisId: number }
>;

export class CreateAnalysisService
	implements
		Service<CreateAnalysisServiceRequest, CreateAnalysisServiceResponse>
{
	analysisRepository = new QdrantKnowledgeBase();
	solutionRepository = new PrismaSolutionRepository();

	async execute(
		request: CreateAnalysisServiceRequest,
	): Promise<CreateAnalysisServiceResponse> {
		const { problem, solution, tags } = request;

		let newSolution: { solutionId: number };

		const problems = await pollinationsGenerateProblems(problem);

		console.log(problems);

		try {
			newSolution = await this.solutionRepository.createAnalysis({
				solution,
				createdBy: "Suporte Lusati",
				isActive: true,
				tags,
			});
		} catch (error) {
			console.error(error);
			throw new Error("Erro interno.");
		}

		const { solutionId } = newSolution;

		await Promise.all(
			problems.map(async (problem) => {
				const embedding = await ollamaEmbeddingService(problem);

				const id = crypto.randomUUID();
				const createdAt = new Date().toISOString();
				const updatedAt = new Date().toISOString();

				try {
					await this.analysisRepository.create({
						id,
						vector: embedding,
						payload: {
							problem,
							solutionId,
							createdAt,
							updatedAt,
						},
					});
				} catch (error) {
					console.error(error);
				}
			}),
		);

		return right({
			analysisId: solutionId,
		});
	}
}
