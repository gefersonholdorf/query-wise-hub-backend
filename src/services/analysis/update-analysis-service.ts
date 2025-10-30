/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { KnowledgeRepository } from "../../databases/repositories/knowledge-repository";
import type { ProblemsRepository } from "../../databases/repositories/problems-repository";
import type { StockHistoryRepository } from "../../databases/repositories/stock-history-repository";
import { NotFoundError } from "../../errors/not-found-error";
import { left, right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import type { Service } from "../service";

export interface UpdateAnalysisServiceRequest {
	id: number;
	title: string;
	problems: string[];
	solution: string;
	tags: string | null;
}

export type UpdateAnalysisServiceResponse = Either<NotFoundError | Error, void>;

export class UpdateAnalysisService
	implements
		Service<UpdateAnalysisServiceRequest, UpdateAnalysisServiceResponse>
{
	constructor(
		private readonly problemsRepository: ProblemsRepository,
		private readonly knowledgeRepository: KnowledgeRepository,
		private readonly stockHistoryRepository: StockHistoryRepository,
	) {}

	async execute(
		request: UpdateAnalysisServiceRequest,
	): Promise<UpdateAnalysisServiceResponse> {
		const { id, title, problems, solution } = request;

		try {
			const existingAnalysis = await this.knowledgeRepository.getById(id);

			if (!existingAnalysis.knowledge) {
				return left(new NotFoundError());
			}

			const knowledgeAnalysis = existingAnalysis.knowledge;

			const analysisId = knowledgeAnalysis.id;

			await this.problemsRepository.delete(analysisId);

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
								knowledgeId: analysisId,
								createdAt,
							},
						});
					} catch (error) {
						console.error(error);
					}
				}),
			);

			existingAnalysis.knowledge.solution = solution;
			existingAnalysis.knowledge.title = title;

			await this.knowledgeRepository.save(existingAnalysis.knowledge, id);

			await this.stockHistoryRepository.create("Atualizado por ADMIN", id);

			return right(undefined);
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
