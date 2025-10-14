/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { KnowledgeBaseRepository } from "../../databases/repositories/knowledge-base-repository";
import type { SolutionRepository } from "../../databases/repositories/solution-repository";
import { NotFoundError } from "../../errors/not-found-error";
import { left, right, type Either } from "../../utils/either";
import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
import type { Service } from "../service";

export interface UpdateAnalysisServiceRequest {
    id: number
    problems: string[];
    solution: string;
    tags: string | null;
}

export type UpdateAnalysisServiceResponse = Either<
    NotFoundError,
    {}
>;

export class UpdateAnalysisService
    implements
        Service<UpdateAnalysisServiceRequest, UpdateAnalysisServiceResponse>
{

    constructor(
        private readonly qdrantRepository: KnowledgeBaseRepository,
        private readonly solutionRepository: SolutionRepository
    ) {}

    async execute(
        request: UpdateAnalysisServiceRequest,
    ): Promise<UpdateAnalysisServiceResponse> {
        const { id, problems, solution, tags } = request;

        try {
            const existingSolution = await this.solutionRepository.getById(id)

            if(!existingSolution.solution) {
                return left(new NotFoundError())
            }

            const solutionAnalysis = existingSolution.solution

            const solutionId = solutionAnalysis.id;

            await this.qdrantRepository.delete(solutionId)

            await Promise.all(
			problems.map(async (problem) => {
				const embedding = await ollamaEmbeddingService(problem);

				const id = crypto.randomUUID();
				const createdAt = new Date().toISOString();
				const updatedAt = new Date().toISOString();

				try {
					await this.qdrantRepository.create({
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

            return right({})

        } catch (error) {
            console.error(error);
            throw new Error("Erro interno.");
        }

        return right({});
    }
}
