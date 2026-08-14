import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Phone, MessageCircle, CalendarPlus, FileText, Construction, GraduationCap, Ambulance, Pill, Camera, ArrowRight } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { responder } from "@/lib/cantu-ia";


type Busca = { protocolo?: string };
export const Route = createFileRoute("/atendimento")({
  validateSearch: (search: Record<string, unknown>): Busca =>
    typeof search['protocolo'] === "string" ? { protocolo: search['protocolo'] } : {},
  head: () => ({
    meta: [
      { title: "Atendimento 24/7 — Cantu Conecta" },
      {
        name: "description",
        content: "Assistente virtual da Cantuquiriguaçu disponível 24 horas para tirar dúvidas e facilitar o acesso a serviços regionais.",
      },
      { property: "og:title", content: "Atendimento 24/7 — Cantu Conecta" },
      { property: "og:description", content: "Respostas imediatas sobre saúde, causa animal e serviços urbanos em toda a região Cantu." },
    ],
  }),
  component: Atendimento,
});

type Msg = { de: "bot" | "eu"; texto: string; acao?: { rotulo: string; para: string } };

const sugestoes = [
  "Como agendar consulta?",
  "Tem dipirona na UBS?",
  "Tem buraco na minha rua",
  "Segunda via do IPTU",
  "Andamento do meu protocolo",
  "Quero adotar um cachorro",
  "Como denunciar maus-tratos?",
  "Vaga em creche",
  "Horário de atendimento",
];

const atalhos = [
  { icon: CalendarPlus, titulo: "Agendar", texto: "Como agendar consulta?" },
  { icon: FileText, titulo: "IPTU", texto: "Segunda via do IPTU" },
  { icon: Construction, titulo: "Rua/Lixo", texto: "Tem buraco na minha rua" },
  { icon: Pill, titulo: "Remédio", texto: "Quero saber sobre medicamentos" },
  { icon: GraduationCap, titulo: "Escola", texto: "Vaga em creche" },
];


function Atendimento() {
  const { protocolo } = Route.useSearch();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      de: "bot",
      texto:
        "Olá! Sou a assistente do Cantu Conecta. Estou disponível 24 horas para ajudar você com serviços da região Cantuquiriguaçu.",
    },
  ]);

  useEffect(() => {
    if (protocolo) {
      enviar(`Andamento do protocolo ${protocolo}`);
    }
  }, [protocolo]);
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
    setTimeout(() => {
      const r = responder(pergunta);
      setMsgs((m) => [...m, { de: "bot", texto: r.texto, ...(r.acao ? { acao: r.acao } : {}) }]);
    }, 450);
  }

  return (
    <AppShell librasMensagem="Atendimento 24 horas. Escreva sua dúvida e a assistente responde na hora.">
      <TopBar titulo="Atendimento 24/7" subtitulo="Assistente virtual sempre disponível" />

      <div className="-mt-5 space-y-3 px-4">
        <div className="grid grid-cols-3 gap-2">
          <a
            href="https://wa.me/554699999999"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-success text-[11px] font-bold text-success-foreground shadow-card"
          >
            <MessageCircle className="size-5" /> WhatsApp
          </a>
          <a
            href="tel:+554699999999"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-card text-[11px] font-bold shadow-card"
          >
            <Phone className="size-5" /> Ligar
          </a>
          <a
            href="tel:192"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-destructive text-[11px] font-bold text-destructive-foreground shadow-card"
          >
            <Ambulance className="size-5" /> SAMU 192
          </a>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {atalhos.map(({ icon: Icon, titulo, texto }) => (
            <button
              key={titulo}
              type="button"
              onClick={() => enviar(texto)}
              className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card text-[11px] font-semibold shadow-card"
            >
              <Icon className="size-5 text-primary" />
              {titulo}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/agendamento"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-card"
          >
            <CalendarPlus className="size-4" /> Agendar
          </Link>
          <Link
            to="/ocorrencia"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-accent-gradient text-sm font-bold text-accent-foreground shadow-card"
          >
            <Camera className="size-4" /> Comunicar
          </Link>
        </div>
      </div>

      <div className="mt-5 space-y-3 px-4 pb-44">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.de === "eu" ? "justify-end" : "justify-start"}`}>
            {m.de === "bot" && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Bot className="size-4" />
              </span>
            )}
            <div className="max-w-[78%] space-y-2">
              <p
                className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[15px] leading-snug shadow-card ${
                  m.de === "eu"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-card text-card-foreground"
                }`}
              >
                {m.texto}
              </p>
              {m.acao && (
                <Link
                  to={m.acao.para}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary-soft px-4 text-xs font-bold text-primary"
                >
                  {m.acao.rotulo} <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
        <div ref={fim} />
      </div>

      <div className="fixed bottom-[8.5rem] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        <div className="flex w-max gap-2">
          {sugestoes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => enviar(s)}
              className="min-h-10 whitespace-nowrap rounded-full border border-border bg-card px-4 text-xs font-semibold shadow-card"
            >
              {s}
            </button>
          ))}
        </div>
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
