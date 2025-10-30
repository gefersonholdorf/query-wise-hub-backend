/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import type { PrismaKnowledgeRepository } from "../../databases/prisma/prisma-knowledge-repository";
import { left, right, type Either } from "../../utils/either";
import type { Service } from "../service";

export type SummaryDashboardServiceResponse = Either<
	Error,
	{
		result: {
			totalKnowledges: number;
			totalViews: number;
			totalAnalysis: number;
			totalUsers: number;
			totalPendings: number;
			totalApproveds: number;
			totalDenieds: number;
			approvalRate: number;
			knowledgesUsed: number;
			effectiveKnowledges: number;
			ineffectiveKnowledges: number;
			averageAnalysisTime: number;
		};
	}
>;

export class SummaryDashboardService
	implements Service<never, SummaryDashboardServiceResponse>
{
	constructor(
		private readonly knowledgeRepository: PrismaKnowledgeRepository,
	) {}

	async execute(): Promise<SummaryDashboardServiceResponse> {
		try {
			const summaryDashboard = await this.knowledgeRepository.summary();

			console.log(summaryDashboard);

			const {
				total,
				totalApproveds,
				totalDenieds,
				totalPendings,
				totalKnowledges,
			} = summaryDashboard.summary;

			const approvalRate = Math.ceil(
				(totalApproveds / (totalApproveds + totalDenieds)) * 100 || 0,
			);

			return right({
				result: {
					totalKnowledges,
					totalViews: 1,
					totalAnalysis: total,
					totalUsers: 5,
					totalPendings,
					totalApproveds,
					totalDenieds,
					approvalRate,
					knowledgesUsed: 10,
					effectiveKnowledges: 1,
					ineffectiveKnowledges: 9,
					averageAnalysisTime: 5,
				},
			});
		} catch (error) {
			console.error(error);
			return left(new Error("Internal error."));
		}
	}
}
