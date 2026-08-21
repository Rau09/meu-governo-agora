import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Entrada = z.object({
  pergunta: z.string().min(1).max(2000),
  historico: z
    .array(z.object({ de: z.enum(["eu", "bot"]), texto: z.string().max(2000) }))
    .max(12)
    .optional(),
});

const SISTEMA = `Você é o assistente virtual do NexLine, uma IA de última geração projetada para oferecer conversas fluidas, naturais e extremamente inteligentes aos cidadãos da região Cantuquiriguaçu (PR).

Personalidade:
- Empática, prestativa e altamente articulada.
- Capaz de manter diálogos complexos, lembrando do contexto da conversa.
- Estilo de resposta: Profissional, mas caloroso e humano.

Conhecimento:
- Domina todos os serviços do NexLine (saúde, causa animal, zeladoria, tributos).
- Possui vasta inteligência geral para responder sobre ciência, tecnologia, cultura e educação.
- Foca na resolução de problemas e na satisfação do usuário.

Regras de Resposta:
- Responda SEMPRE em português do Brasil de forma fluida.
- Máximo de 6 frases por resposta para manter a agilidade no mobile.
- Se o assunto for um serviço local, guie o usuário de forma orgânica.
- Em emergências médicas: 192 (SAMU). Urgências policiais: 190.`;

export const perguntarIA = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Entrada.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { texto: "", erro: "config" as const };

    const mensagens = [
      { role: "system", content: SISTEMA },
      ...(data.historico ?? []).map((m) => ({
        role: m.de === "eu" ? "user" : "assistant",
        content: m.texto,
      })),
      { role: "user", content: data.pergunta },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: mensagens,
      }),
    });

    if (!res.ok) {
      const status = res.status;
      if (status === 429) return { texto: "", erro: "limite" as const };
      if (status === 402 || status === 403) return { texto: "", erro: "creditos" as const };
      return { texto: "", erro: "falha" as const };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const texto = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!texto) return { texto: "", erro: "falha" as const };
    return { texto, erro: null };
  });
