import type {
	KnowledgeBase,
	KnowledgeBaseResult,
} from "../../models/knowledge";
import { qdrantClient } from "../client";
import type { KnowledgeBaseRepository } from "../repositories/knowledge-base-repository";

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
			};

			return {
				id: String(item.id),
				score: item.score,
				version: item.version,
				payload: {
					problem: payload.problem ?? "",
					solution: payload.solution ?? "",
				},
			};
		});

		return {
			data,
		};
	}
}
