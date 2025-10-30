import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../src/env";

const client = new QdrantClient({
	url: env.QDRANT_URL,
});

async function createCollection() {
	await client.createCollection("problems", {
		vectors: { size: 1024, distance: "Cosine" },
	});

	console.log("Collection created successfully!");
}

createCollection();
