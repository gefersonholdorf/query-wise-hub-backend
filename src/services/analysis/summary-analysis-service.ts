// /** biome-ignore-all assist/source/organizeImports: <"explanation"> */
// import { PrismaSolutionRepository } from "../../databases/prisma/prisma-solution-repository";
// import { right, type Either } from "../../utils/either";
// import type { Service } from "../service";

// export type SummaryAnalysisServiceResponse = Either<
// 	never,
// 	{
// 		result: {
// 			totalPendings: number;
// 			totalApproveds: number;
// 			totalDenieds: number;
// 			total: number;
// 			approvalRate: number;
// 		};
// 	}
// >;

// export class SummaryAnalysisService
// 	implements Service<never, SummaryAnalysisServiceResponse>
// {
// 	solutionRepository = new PrismaSolutionRepository();

// 	async execute(): Promise<SummaryAnalysisServiceResponse> {
// 		try {
// 			const summaryAnalysis = await this.solutionRepository.summary();

// 			const { total, totalApproveds, totalDenieds, totalPendings } =
// 				summaryAnalysis.summary;

// 			const approvalRate = Math.ceil(
// 				(totalApproveds / (totalApproveds + totalDenieds)) * 100,
// 			);

// 			return right({
// 				result: {
// 					totalPendings,
// 					totalApproveds,
// 					totalDenieds,
// 					total,
// 					approvalRate,
// 				},
// 			});
// 		} catch (error) {
// 			console.error(error);
// 			throw new Error("Erro interno.");
// 		}
// 	}
// }
