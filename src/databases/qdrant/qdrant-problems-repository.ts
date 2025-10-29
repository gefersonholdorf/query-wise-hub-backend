/** biome-ignore-all lint/suspicious/noExplicitAny: <!> */
import type { Problem, ProblemResult } from "../../models/problem";
import { qdrantClient } from "../client";
import type {
	Filtering,
	PaginationParams,
	ProblemsRepository,
} from "../repositories/problems-repository";

export class QdrantProblemsRepository implements ProblemsRepository {
	async create(data: Problem): Promise<{ problemId: string }> {
		await qdrantClient.upsert("problems", {
			points: [data],
		});

		return {
			problemId: data.id,
		};
	}

	async searchMatch(search: number[]): Promise<{ data: ProblemResult[] }> {
		const result = await qdrantClient.search("problems", {
			vector: search,
			limit: 5,
		});

		const data: ProblemResult[] = result.map((item) => {
			const payload = (item.payload ?? {}) as {
				problem?: string;
				knowledgeId?: number;
				createdAt?: string;
			};

			return {
				id: String(item.id),
				score: item.score,
				version: item.version,
				payload: {
					problem: payload.problem ?? "",
					knowledgeId: payload.knowledgeId ?? 0,
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

		const result = await qdrantClient.scroll("problems", {
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

	async searchByKnowledgeId(id: number): Promise<{ data: string[] }> {
		const res = await qdrantClient.scroll("problems", {
			filter: {
				must: [
					{
						key: "knowledgeId",
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

	async save(data: Problem, knowledgeId: number): Promise<void> {
		await qdrantClient.updateVectors("problems", {
			points: [data],
		});
	}

	async delete(solutionId: number): Promise<void> {
		await qdrantClient.delete("problems", {
			filter: {
				must: [
					{
						key: "solutionId",
						match: { value: solutionId },
					},
				],
			},
		});
	}
}
