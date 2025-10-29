/** biome-ignore-all assist/source/organizeImports: <"explanation"> */
import fastifySwagger from "@fastify/swagger";
import fastifyJwt from "@fastify/jwt";
import fastifyApiReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
	jsonSchemaTransform,
	jsonSchemaTransformObject,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { httpCreateRoute } from "./http/http";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
	origin: "*",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
	openapi: {
		openapi: "3.0.0",
		info: {
			title: "QueryWise",
			description: "Official documentation for the QueryWiseHub application.",
			version: "1.0.0",
		},
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "Enter your token.",
				},
			},
		},
		security: [],
	},
	transform: jsonSchemaTransform,
	transformObject: jsonSchemaTransformObject,
});

app.register(fastifyApiReference, {
	routePrefix: "/docs",
});

app.register(fastifyJwt, {
	secret: env.SECRET_KEY,
});

app.register(httpCreateRoute);

app.listen({
	host: "0.0.0.0",
	port: env.PORT,
});
