import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Phone, MessageCircle, CalendarPlus, FileText, Construction, GraduationCap, Ambulance } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";


export const Route = createFileRoute("/atendimento")({
  head: () => ({
    meta: [
      { title: "Atendimento 24/7 — QI Cidadão" },
      {
        name: "description",
        content: "Assistente virtual da Prefeitura de Quedas do Iguaçu disponível 24 horas para tirar dúvidas e resolver serviços.",
      },
      { property: "og:title", content: "Atendimento 24/7 — QI Cidadão" },
      { property: "og:description", content: "Respostas imediatas sobre saúde, educação e serviços urbanos, a qualquer hora." },
    ],
  }),
  component: Atendimento,
});

type Msg = { de: "bot" | "eu"; texto: string };

const RESPOSTAS: { chaves: string[]; texto: string }[] = [
  {
    chaves: ["consulta", "medico", "médico", "saude", "saúde", "ubs"],
    texto:
      "Para consultas, use a aba Agendar > Saúde. Você escolhe a UBS e o horário. Casos de urgência: procure o Pronto Atendimento ou ligue 192.",
  },
  {
    chaves: ["vacina", "vacinação"],
    texto: "A vacinação é por ordem de chegada nas UBS das 08h às 16h, e você também pode agendar horário no app.",
  },
  {
    chaves: ["iptu", "imposto", "boleto"],
    texto: "A segunda via do IPTU pode ser emitida em Serviços > Cidadania e Tributos, com o número do cadastro do imóvel.",
  },
  {
    chaves: ["matricula", "matrícula", "escola", "creche"],
    texto: "Matrículas e vagas em creche ficam em Serviços > Educação. Leve RG, CPF e comprovante de residência no dia.",
  },
  {
    chaves: ["buraco", "lixo", "entulho", "luz", "iluminação", "poda"],
    texto: "Solicitações urbanas (tapa-buraco, coleta, iluminação e poda) são abertas em Serviços > Serviços Urbanos e viram protocolo na hora.",
  },
  {
    chaves: ["horario", "horário", "funcionamento", "aberto"],
    texto: "O app funciona 24 horas por dia. O atendimento presencial no Paço Municipal é das 08h às 17h.",
  },
];

function responder(pergunta: string) {
  const p = pergunta.toLowerCase();
  const achou = RESPOSTAS.find((r) => r.chaves.some((c) => p.includes(c)));
  return (
    achou?.texto ??
    "Anotei sua solicitação e ela foi encaminhada para o setor responsável. Você também pode abrir um protocolo em Serviços ou agendar um atendimento presencial."
  );
}

const sugestoes = ["Como agendar consulta?", "Segunda via do IPTU", "Tem buraco na minha rua", "Vaga em creche"];

function Atendimento() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      de: "bot",
      texto:
        "Olá! Sou a assistente virtual da Prefeitura de Quedas do Iguaçu. Estou disponível 24 horas. Como posso ajudar?",
    },
  ]);
  const [texto, setTexto] = useState("");
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function enviar(valor: string) {
    const pergunta = valor.trim();
    if (!pergunta) return;
    setMsgs((m) => [...m, { de: "eu", texto: pergunta }]);
    setTexto("");
    setTimeout(() => setMsgs((m) => [...m, { de: "bot", texto: responder(pergunta) }]), 450);
  }

  return (
    <AppShell librasMensagem="Atendimento 24 horas. Escreva sua dúvida e a assistente responde na hora.">
      <TopBar titulo="Atendimento 24/7" subtitulo="Assistente virtual sempre disponível" />

      <div className="-mt-5 px-4">
        <div className="flex gap-2">
          <a
            href="https://wa.me/554635320000"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-success text-xs font-bold text-success-foreground shadow-card"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a
            href="tel:+554635320000"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-card text-xs font-bold shadow-card"
          >
            <Phone className="size-4" /> Ligar
          </a>
        </div>
      </div>

      <div className="mt-5 space-y-3 px-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.de === "eu" ? "justify-end" : "justify-start"}`}>
            {m.de === "bot" && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Bot className="size-4" />
              </span>
            )}
            <p
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-snug shadow-card ${
                m.de === "eu"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-card text-card-foreground"
              }`}
            >
              {m.texto}
            </p>
          </div>
        ))}
        <div ref={fim} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 px-4">
        {sugestoes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => enviar(s)}
            className="min-h-11 rounded-full bg-secondary px-4 text-xs font-semibold text-secondary-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="fixed bottom-20 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 gap-2 bg-background/95 px-4 py-3 backdrop-blur"
      >
        <label className="flex-1">
          <span className="sr-only">Escreva sua mensagem</span>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva sua dúvida..."
            className="min-h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <button
          type="submit"
          aria-label="Enviar mensagem"
          className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Send className="size-5" />
        </button>
      </form>
    </AppShell>
  );
}
