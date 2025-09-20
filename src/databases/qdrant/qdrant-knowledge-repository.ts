/** biome-ignore-all lint/suspicious/noExplicitAny: <!> */
import type {
	KnowledgeBase,
	KnowledgeBasePayloadResult,
	KnowledgeBaseResult,
	KnowledgeSearchResult,
} from "../../models/knowledge";
import { qdrantClient } from "../client";
import type {
	CursorPaginationParams,
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
				solution?: string;
				createdAt?: string;
			};

			return {
				id: String(item.id),
				score: item.score,
				version: item.version,
				payload: {
					problem: payload.problem ?? "",
					solution: payload.solution ?? "",
					createdAt: payload.createdAt ?? "",
				},
			};
		});

		return {
			data,
		};
	}

	async search(
		params: CursorPaginationParams,
		filtering: Filtering,
	): Promise<KnowledgeSearchResult> {
		const { cursor, limit = 1 } = params;
		const { problem } = filtering;

		const result = await qdrantClient.scroll("knowledge_base", {
			filter: cursor
				? { must: [{ key: "createdAt", range: { lt: cursor } }] }
				: undefined,
			limit: limit + 1,
			with_payload: true,
			with_vector: false,
		});

		let points: KnowledgeBasePayloadResult[] = result.points.map((p) => {
			const payload = p.payload ?? {};
			return {
				id: String(p.id),
				payload: {
					problem: (payload?.problem as string) ?? "",
					solution: (payload?.solution as string) ?? "",
					createdAt: (payload?.createdAt as string) ?? "",
				},
			};
		});

		if (problem) {
			points = points.filter((p) =>
				p.payload.problem.toLowerCase().includes(problem.toLowerCase()),
			);
		}

		const hasMore = points.length > limit;
		const data = hasMore ? points.slice(0, limit) : points;
		const nextCursor =
			data.length > 0 ? data[data.length - 1].payload.createdAt : null;

		return { data, nextCursor, hasMore };
	}

	async save() {
		const result = await qdrantClient.updateVectors("knowledge_base", {
			points: {
                [{}]
            }
		});
	}
}
