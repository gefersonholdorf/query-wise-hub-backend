/** biome-ignore-all lint/suspicious/noExplicitAny: <!> */
import type {
	KnowledgeBase,
	KnowledgeBasePayloadResult,
	KnowledgeBaseResult,
	KnowledgeSearchResult,
} from "../../models/knowledge";
import { qdrantClient } from "../client";
import type {
	PaginationParams,
	Filtering,
	KnowledgeBaseRepository,
} from "../repositories/knowledge-base-repository";

export class QdrantKnowledgeBase implements KnowledgeBaseRepository {
	async create(data: KnowledgeBase): Promise<{ knowledgeId: string }> {
		await qdrantClient.upsert("knowledge_base", {
			points: [data],
		});

		return {
			knowledgeId: data.id,
		};
	}

	async searchMatch(
		search: number[],
	): Promise<{ data: KnowledgeBaseResult[] }> {
		const result = await qdrantClient.search("knowledge_base", {
			vector: search,
			limit: 5,
		});

		const data: KnowledgeBaseResult[] = result.map((item) => {
			const payload = (item.payload ?? {}) as {
				problem?: string;
				solutionId?: number;
				createdAt?: string;
			};

			return {
				id: String(item.id),
				score: item.score,
				version: item.version,
				payload: {
					problem: payload.problem ?? "",
					solutionId: payload.solutionId ?? 0,
					createdAt: payload.createdAt ?? "",
				},
			};
		});

		return {
			data,
		};
	}

	async search(
		params: PaginationParams,
		filtering: Filtering,
	): Promise<{ data: string[] }> {
		const { page = 1, quantityPerPage = 9 } = params;
		const { problem } = filtering;

		const result = await qdrantClient.scroll("knowledge_base", {
			filter: {
				must: [
					{
						key: "problem",
						match: { text: problem ?? undefined },
					},
				],
			},
			limit: quantityPerPage,
			offset: (page - 1) * quantityPerPage,
			order_by: "createdAt",
			with_payload: true,
			with_vector: false,
		});

		const points: string[] = result.points.map((p) => {
			return String(p.payload?.problem ?? "");
		});

		return { data: points };
	}

	async searchBySolutionId(id: number): Promise<{ data: string[] }> {
		const res = await qdrantClient.scroll("knowledge_base", {
			filter: {
				must: [
					{
						key: "solutionId",
						match: { value: id },
					},
				],
			},
		});

		const points: string[] = res.points.map((p) => {
			return String(p.payload?.problem ?? "");
		});

		return { data: points };
	}

	async save() {
		// const result = await qdrantClient.updateVectors("knowledge_base", {
		// 	points: {
		//         [{}]
		//     }
		// });
	}
}
