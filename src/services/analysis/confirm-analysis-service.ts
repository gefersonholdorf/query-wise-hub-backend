/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
/** biome-ignore-all lint/complexity/noBannedTypes: <"explanation"> */
import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
import { PrismaStockHistoryRepository } from "../../databases/prisma/prisma-stock-history-repository";
import { NotFoundError } from "../../errors/not-found-error";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export interface ConfirmAnalysisServiceRequest {
	id: number;
	status: "APPROVED" | "DENIED";
	observation?: string;
}

export type ConfirmAnalysisServiceResponse = Either<NotFoundError, {}>;

export class ConfirmAnalysisService
	implements
		Service<ConfirmAnalysisServiceRequest, ConfirmAnalysisServiceResponse>
{
	solutionRepository = new PrismaSolutionRepository();
	stockHistoryRepository = new PrismaStockHistoryRepository();

	async execute(
		request: ConfirmAnalysisServiceRequest,
	): Promise<ConfirmAnalysisServiceResponse> {
		const { id, status, observation } = request;

		try {
			const getSolution = await this.solutionRepository.getById(id);

			const { solution } = getSolution;

			if (!solution) {
				return left(new NotFoundError());
			}

			solution.status = status;
			solution.observation = observation || null;

			if (status === "APPROVED") {
				solution.approvedAt = new Date();
				solution.approvedBy = "ADMIN";
			}

			if (status === "DENIED") {
				solution.deniedAt = new Date();
				solution.deniedBy = "ADMIN";
			}

			await this.solutionRepository.save(solution, id);

			await this.stockHistoryRepository.create(
				"Análise revisada por ADMIN",
				id,
				status,
			);

			return right({});
		} catch (error) {
			console.error(error);
			throw new Error("Erro interno.");
		}
	}
}
