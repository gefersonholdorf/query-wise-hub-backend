// import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
// import { QdrantKnowledgeBase } from "../../databases/qdrant/qdrant-knowledge-repository";
// import { right, type Either } from "../../utils/either";
// import { ollamaEmbeddingService } from "../ollama/ollama-embedding";
// import type { Service } from "../service";

// export interface CreateKnowledgeServiceRequest {
// 	problems: string[];
// 	solution: string;
// 	tags: string | null;
// 	isActive: boolean;
// }

// export type CreateKnowledgeServiceResponse = Either<
// 	never,
// 	{ solutionId: number }
// >;

// export class CreateKnowledgeService
// 	implements
// 		Service<CreateKnowledgeServiceRequest, CreateKnowledgeServiceResponse>
// {
// 	knowledgeRepository = new QdrantKnowledgeBase();
// 	solutionRepository = new PrismaSolutionRepository();

// 	async execute(
// 		request: CreateKnowledgeServiceRequest,
// 	): Promise<CreateKnowledgeServiceResponse> {
// 		const { problems, solution, tags, isActive } = request;

// 		let newSolution: { solutionId: number };

// 		try {
// 			newSolution = await this.solutionRepository.create({
// 				solution,
// 				createdBy: "Suporte Lusati",
// 				isActive,
// 				tags,
// 			});
// 		} catch (error) {
// 			console.error(error);
// 			throw new Error("Erro interno.");
// 		}

// 		const { solutionId } = newSolution;

// 		await Promise.all(
// 			problems.map(async (problem) => {
// 				const embedding = await ollamaEmbeddingService(problem);

// 				const id = crypto.randomUUID();
// 				const createdAt = new Date().toISOString();
// 				const updatedAt = new Date().toISOString();

// 				try {
// 					await this.knowledgeRepository.create({
// 						id,
// 						vector: embedding,
// 						payload: {
// 							problem,
// 							solutionId,
// 							createdAt,
// 							updatedAt,
// 						},
// 					});
// 				} catch (error) {
// 					console.error(error);
// 				}
// 			}),
// 		);

// 		return right({
// 			solutionId,
// 		});
// 	}
// }
