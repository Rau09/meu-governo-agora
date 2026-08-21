import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Entrada = z.object({
  pergunta: z.string().min(1).max(2000),
  historico: z
    .array(z.object({ de: z.enum(["eu", "bot"]), texto: z.string().max(2000) }))
    .max(12)
    .optional(),
});

const SISTEMA = `Você é o assistente virtual do NexLine, plataforma digital dos municípios da região Cantuquiriguaçu (PR), com foco em saúde comunitária, causa animal, zeladoria urbana e serviços ao cidadão.

Regras:
- Responda SEMPRE em português do Brasil, de forma clara, cordial e objetiva (máximo 6 frases).
- Você pode responder QUALQUER tipo de pergunta (conhecimentos gerais, ciência, tecnologia, educação, dúvidas do dia a dia), não apenas assuntos da prefeitura.
- Quando o assunto for serviço público local, oriente o cidadão sobre o caminho no app (agendamento, medicamentos, ocorrências, causa animal).
- Nunca invente dados oficiais como protocolos, estoques ou horários específicos; nesses casos oriente a consultar a área correspondente do app.
- Em emergências médicas oriente ligar 192 (SAMU); em urgências policiais, 190.`;

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
