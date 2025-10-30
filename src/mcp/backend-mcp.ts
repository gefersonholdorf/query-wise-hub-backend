// import { ConfirmAnalysisService } from "../services/analysis/confirm-analysis-service";
// import { FetchAnalysisService } from "../services/analysis/fetch-analysis-service";
// import { CreateKnowledgeService } from "../services/knowledge/create-knowledge-service";

// export async function backendMCP(message: string) {
// 	const response = await fetch("https://text.pollinations.ai/openai", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({
// 			model: "openai",
// 			messages: [
// 				{
// 					role: "system",
// 					content: `
//                         Você é um assistente de suporte profissional para sistemas empresariais. Voce so pode falar sobre suporte`.trim(),
// 				},
// 				{ role: "user", content: message },
// 			],
// 			tools: [
// 				{
// 					type: "function",
// 					function: {
// 						name: "postKnowledge",
// 						description: "Criação de um novo conhecimento na base de dados.",
// 						parameters: {
// 							type: "object",
// 							properties: {
// 								problems: {
// 									type: "array",
// 									description: "Lista de problemas relacionados",
// 									items: { type: "string" },
// 								},
// 								solution: {
// 									type: "string",
// 									description: "Descrição detalhada da solução",
// 								},
// 								isActive: {
// 									type: "boolean",
// 									description:
// 										"Indica se o conhecimento está true ou false. Por padrão, sempre true.",
// 									default: true,
// 								},
// 							},
// 							required: ["problems", "solution"],
// 						},
// 					},
// 				},
// 				{
// 					type: "function",
// 					function: {
// 						name: "confirmAnalysis",
// 						description: "Confirmação de uma análise.",
// 						parameters: {
// 							type: "object",
// 							properties: {
// 								analysisId: {
// 									type: "number",
// 									description: "ID da análise que está sendo confirmada",
// 								},
// 								status: {
// 									type: "string",
// 									description:
// 										"Define se a análise será APPROVED (aprovado) ou DENIED (negado)",
// 									enum: ["APPROVED", "DENIED"],
// 								},
// 								observation: {
// 									type: "string",
// 									description: "Descrição detalhada da análise",
// 								},
// 							},
// 							required: ["status", "analysisId"],
// 						},
// 					},
// 				},
// 				{
// 					type: "function",
// 					function: {
// 						name: "listAnalysisPending",
// 						description: "Listagem de análises pendentes.",
// 						parameters: {
// 							type: "object",
// 							properties: {},
// 						},
// 					},
// 				},
// 			],
// 		}),
// 	});

// 	const data: any = await response.json();
// 	const toolCall = data.choices[0].message.tool_calls?.[0] ?? undefined;

// 	console.log("Tool call recebida:");
// 	console.dir(toolCall, { depth: null });

// 	const toolResult = await executarTool(toolCall);

// 	if (toolResult.isError) {
// 		return data.choices[0].message.content;
// 	}

// 	const followUp = await fetch("https://text.pollinations.ai/openai", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({
// 			model: "openai",
// 			messages: [
// 				{
// 					role: "system",
// 					content: `
//                         Você é um assistente de suporte profissional para sistemas empresariais.`.trim(),
// 				},
// 				{ role: "user", content: `${message}` },
// 				{ role: "assistant", tool_calls: [toolCall] },
// 				{
// 					role: "tool",
// 					tool_call_id: toolCall.id,
// 					content: JSON.stringify(toolResult),
// 				},
// 			],
// 		}),
// 	});

// 	const finalData: any = await followUp.json();

// 	console.log("\nResposta final do assistente:");
// 	console.log(finalData.choices[0].message.content);
// 	return finalData.choices[0].message.content;
// }

// async function executarTool(toolCall: any) {
// 	if (toolCall === undefined) {
// 		return {
// 			isError: true,
// 		};
// 	}
// 	if (toolCall.function.name === "postKnowledge") {
// 		const args = JSON.parse(toolCall.function.arguments);

// 		const createKnowledgeService = new CreateKnowledgeService();
// 		await createKnowledgeService.execute({
// 			problems: args.problems,
// 			solution: args.solution,
// 			tags: "",
// 			isActive: args.isActive ?? true,
// 		});

// 		return {
// 			success: true,
// 			message: "Registro de conhecimento criado com sucesso",
// 		};
// 	}

// 	if (toolCall.function.name === "confirmAnalysis") {
// 		const args = JSON.parse(toolCall.function.arguments);

// 		const confirmAnalysisService = new ConfirmAnalysisService();
// 		const result = await confirmAnalysisService.execute({
// 			id: args.analysisId,
// 			status: args.status,
// 			observation: args.observation ?? "",
// 		});

// 		if (result.isLeft()) {
// 			return {
// 				sucess: false,
// 				message: "Análise não encontrada",
// 			};
// 		}

// 		return {
// 			success: true,
// 			message: "Análise confirmada com sucesso",
// 		};
// 	}

// 	if (toolCall.function.name === "listAnalysisPending") {
// 		const fetchAnalysisService = new FetchAnalysisService();

// 		const result = await fetchAnalysisService.execute({
// 			status: "PENDING",
// 			page: 1,
// 			totalPerPage: 5,
// 		});

// 		return {
// 			success: true,
// 			message: result,
// 		};
// 	}
// 	return {
// 		isError: true,
// 	};
// }
