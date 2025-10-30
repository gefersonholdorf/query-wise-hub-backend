/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all lint/complexity/noBannedTypes: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import type { PrismaStockHistoryRepository } from "../../databases/prisma/prisma-stock-history-repository";
import { NotFoundError } from "../../errors/not-found-error";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface ConfirmAnalysisServiceRequest {
	id: number;
	status: "APPROVED" | "DENIED";
	observation?: string;
	userId: number;
}

export type ConfirmAnalysisServiceResponse = Either<NotFoundError | Error, {}>;

export class ConfirmAnalysisService
	implements
		Service<ConfirmAnalysisServiceRequest, ConfirmAnalysisServiceResponse>
{
	constructor(
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
		private readonly stockHistoryRepository: PrismaStockHistoryRepository,
	) {}

	async execute(
		request: ConfirmAnalysisServiceRequest,
	): Promise<ConfirmAnalysisServiceResponse> {
		const { id, status, observation, userId } = request;

		try {
			const getSolution = await this.knowledgeRepository.getAnalysisById(id);

			const { knowledge } = getSolution;

			if (!knowledge) {
				return left(new NotFoundError());
			}

			knowledge.status = status;
			knowledge.observation = observation || null;

			if (status === "APPROVED") {
				knowledge.approvedAt = new Date();
				knowledge.approvedById = userId;
			}

			if (status === "DENIED") {
				knowledge.deniedAt = new Date();
				knowledge.deniedById = userId;
			}

			await this.knowledgeRepository.save(knowledge, id);

			await this.stockHistoryRepository.create(
				"Análise revisada por ADMIN",
				id,
				status,
			);

			return right({});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
