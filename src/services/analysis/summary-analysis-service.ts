/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export type SummaryAnalysisServiceResponse = Either<
	Error,
	{
		result: {
			totalPendings: number;
			totalApproveds: number;
			totalDenieds: number;
			total: number;
			approvalRate: number;
		};
	}
>;

export class SummaryAnalysisService
	implements Service<never, SummaryAnalysisServiceResponse>
{
	constructor(
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
	) {}

	async execute(): Promise<SummaryAnalysisServiceResponse> {
		try {
			const summaryAnalysis = await this.knowledgeRepository.summary();

			const { total, totalApproveds, totalDenieds, totalPendings } =
				summaryAnalysis.summary;

			const approvalRate = Math.ceil(
				(totalApproveds / (totalApproveds + totalDenieds)) * 100 || 0,
			);

			return right({
				result: {
					totalPendings,
					totalApproveds,
					totalDenieds,
					total,
					approvalRate,
				},
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
