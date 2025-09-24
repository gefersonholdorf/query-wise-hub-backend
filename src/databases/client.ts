import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../env";
import { PrismaClient } from "@prisma/client";

export const qdrantClient = new QdrantClient({
	url: env.QDRANT_URL,
});

export const prismaClient = new PrismaClient({
	log: ["query", "error", "info", "warn"],
});
