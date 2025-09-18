import fastifySwagger from "@fastify/swagger";
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

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
	openapi: {
		openapi: "3.0.0",
		info: {
			title: "QueryWise",
			description: "Documentação oficial da aplicação QueryWiseHub",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
	transformObject: jsonSchemaTransformObject,
});

app.register(fastifyApiReference, {
	routePrefix: "/docs",
});

app.register(httpCreateRoute);

app.listen({
	host: "0.0.0.0",
	port: env.PORT,
});
