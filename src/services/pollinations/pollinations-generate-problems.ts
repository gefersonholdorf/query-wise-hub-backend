import { env } from "../../env";

export async function pollinationsGenerateProblems(problem: string) {
	const apiUrl = env.POLLINATIONS_URL;
	const prompt = `
                Você receberá um contexto de exemplo, que descreve um problema ou situação. Sua tarefa é gerar 6 problemas novos e semelhantes ao contexto, mantendo o mesmo tipo ou área de interesse.
                - Responda apenas no formato: Problema e depois coloque virgula e informe o próximo problema
                - Não adicione explicações, numerais extras ou texto fora do formato.
                - Os problemas devem ser variantes do contexto, com ideias novas, mas similares.

                Exemplo de entrada (contexto):
                Usuário não consegue enviar mensagens pelo aplicativo móvel, mesmo com internet funcionando.

                Exemplo de saída esperada:
                Mensagens não são entregues no chat do app, Aplicativo trava ao tentar enviar mensagem, Notificações de envio de mensagem não aparecem

                Contexto atual: ${problem}
            `;
	const encodedPrompt = encodeURIComponent(prompt);
	const res = await fetch(`${apiUrl}/${encodedPrompt}`);

	if (!res.ok) {
		throw new Error("Erro ao gerar novos problemas");
	}

	const response = await res.text();

	const problems = response
		.split(",")
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	return problems;
}
