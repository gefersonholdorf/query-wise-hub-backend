// /** biome-ignore-all assist/source/organizeImports: <"explanation"> */
// import type { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
// import { right, type Either } from "../../utils/either";
// import type { Service } from "../service";

// export type SummaryDashboardServiceResponse = Either<
// 	never,
// 	{
// 		result: {
// 			totalKnowledges: number;
// 			totalViews: number;
// 			totalAnalysis: number;
// 			totalUsers: number;
// 			totalPendings: number;
// 			totalApproveds: number;
// 			totalDenieds: number;
// 			approvalRate: number;
// 			knowledgesUsed: number;
// 			effectiveKnowledges: number;
// 			ineffectiveKnowledges: number;
// 			averageAnalysisTime: number;
// 		};
// 	}
// >;

// export class SummaryDashboardService
// 	implements Service<never, SummaryDashboardServiceResponse>
// {
// 	constructor(private readonly solutionRepository: PrismaSolutionRepository) {}

// 	async execute(): Promise<SummaryDashboardServiceResponse> {
// 		try {
// 			const summaryDashboard = await this.solutionRepository.summary();

// 			const {
// 				total,
// 				totalApproveds,
// 				totalDenieds,
// 				totalPendings,
// 				totalKnowledges,
// 			} = summaryDashboard.summary;

// 			const approvalRate = Math.ceil(
// 				(totalApproveds / (totalApproveds + totalDenieds)) * 100,
// 			);

// 			return right({
// 				result: {
// 					totalKnowledges,
// 					totalViews: 1,
// 					totalAnalysis: total,
// 					totalUsers: 5,
// 					totalPendings,
// 					totalApproveds,
// 					totalDenieds,
// 					approvalRate,
// 					knowledgesUsed: 10,
// 					effectiveKnowledges: 1,
// 					ineffectiveKnowledges: 9,
// 					averageAnalysisTime: 5,
// 				},
// 			});
// 		} catch (error) {
// 			console.error(error);
// 			throw new Error("Erro interno.");
// 		}
// 	}
// }
