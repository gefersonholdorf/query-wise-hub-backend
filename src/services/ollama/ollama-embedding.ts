import { env } from "../../env";
import type { OllamaEmbeddingResponse } from "../../models/ollama-embedding-response";

export async function ollamaEmbeddingService(text: string) {
	const response = await fetch(`${env.OLLAMA_API_URL}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: env.OLLAMA_EMBEDDING_MODEL,
			prompt: text,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`Falha ao gerar embedding do texto: ${response.statusText}`,
		);
	}

	const data = (await response.json()) as OllamaEmbeddingResponse;

	return data.embedding;
}
