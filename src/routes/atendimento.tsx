import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, Phone, MessageCircle, CalendarPlus, Pill, Camera, ArrowRight, MapPin, Activity, CheckCircle2, AlertTriangle, Building2, Search, Info, Ambulance } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { responder, type Resposta } from "@/lib/cantu-ia";
import { statusMedicamento, STATUS_OCORRENCIA, type Medicamento, type Ocorrencia } from "@/lib/cantu-store";

type Busca = { protocolo?: string };

export const Route = createFileRoute("/atendimento")({
  validateSearch: (search: Record<string, unknown>): Busca =>
    typeof search['protocolo'] === "string" ? { protocolo: search['protocolo'] } : {},
  head: () => ({
    meta: [
      { title: "Assistente do Cidadão — Cantu Conecta" },
      {
        name: "description",
        content: "IA Municipal de Quedas do Iguaçu. Respostas visuais e integradas aos serviços municipais.",
      },
      { property: "og:title", content: "Assistente do Cidadão — Cantu Conecta" },
      { property: "og:description", content: "Sua IA Municipal para saúde, medicamentos e serviços urbanos." },
    ],
  }),
  component: Atendimento,
});

type Msg = { 
  de: "bot" | "eu"; 
  texto: string; 
  tipo: "texto" | "medicamento" | "protocolo" | "opcoes" | "servico";
  dados?: any;
  acao?: { rotulo: string; para: string };
  opcoes?: { rotulo: string; valor: string }[];
};

function Atendimento() {
  const { protocolo } = Route.useSearch();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      de: "bot",
      tipo: "texto",
      texto: "Olá! Sou o Assistente do Cidadão de Quedas do Iguaçu. Como posso ajudar você hoje?",
      opcoes: [
        { rotulo: "💊 Medicamentos", valor: "Tem remédio?" },
        { rotulo: "📍 Problemas Urbanos", valor: "Denunciar buraco" },
        { rotulo: "🏥 Agendar Saúde", valor: "Marcar consulta" },
        { rotulo: "🐾 Causa Animal", valor: "Causa animal" }
      ]
    },
  ]);

  const [texto, setTexto] = useState("");
  const [estaDigitando, setEstaDigitando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (protocolo) {
      enviar(`Andamento do protocolo ${protocolo}`);
    }
  }, [protocolo]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, estaDigitando]);

  function enviar(valor: string) {
    const pergunta = valor.trim();
    if (!pergunta) return;
    
    setMsgs((m) => [...m, { de: "eu", texto: pergunta, tipo: "texto" }]);
    setTexto("");
    setEstaDigitando(true);

    setTimeout(() => {
      const r = responder(pergunta);
      setMsgs((m) => [...m, { 
        de: "bot", 
        texto: r.texto, 
        tipo: r.tipo,
        dados: r.dados,
        acao: r.acao ?? undefined,
        opcoes: r.opcoes ?? undefined
      }]);

      setEstaDigitando(false);
    }, 800);
  }

  return (
    <AppShell librasMensagem="Olá! Sou o Assistente do Cidadão. Escreva o que você precisa e eu te ajudarei a encontrar o serviço correto.">
      <TopBar titulo="Assistente do Cidadão" subtitulo="Sua IA Municipal Digital" />

      <div className="mt-4 px-4 pb-48 space-y-6">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.de === "eu" ? "flex-row-reverse" : "flex-row"}`}>
            {m.de === "bot" && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-float text-white self-end mb-2">
                <Bot className="size-6" />
              </div>
            )}
            
            <div className={`flex flex-col gap-2 max-w-[85%] ${m.de === "eu" ? "items-end" : "items-start"}`}>
              <div className={`rounded-3xl px-5 py-4 shadow-card text-[15px] leading-relaxed ${
                m.de === "eu" 
                  ? "bg-primary text-primary-foreground rounded-br-md" 
                  : "bg-card text-card-foreground rounded-bl-md border border-border/50"
              }`}>
                {m.texto}
              </div>

              {/* Componentes Visuais de Resposta */}
              {m.de === "bot" && m.tipo === "medicamento" && m.dados && (
                <div className="w-full grid gap-2 mt-1">
                  {m.dados.map((med: Medicamento, idx: number) => {
                    const st = statusMedicamento(med.quantidade);
                    return (
                      <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-xl flex items-center justify-center text-lg ${
                            st.id === 'disponivel' ? 'bg-success/10 text-success' : 
                            st.id === 'baixo' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                          }`}>
                            <Pill className="size-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-tight">{med.nome}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{med.unidade}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            st.id === 'disponivel' ? 'bg-success/10 text-success' : 
                            st.id === 'baixo' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {st.rotulo}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-1">{med.quantidade} unid.</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {m.de === "bot" && m.tipo === "protocolo" && m.dados && (
                <div className="w-full grid gap-2 mt-1">
                  {m.dados.map((o: Ocorrencia, idx: number) => {
                    const st = STATUS_OCORRENCIA.find(s => s.id === o.status);
                    return (
                      <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{o.protocolo}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${st?.classe}`}>
                            {st?.emoji} {st?.rotulo}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold">{o.categoria}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{o.descricao}</p>
                        <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground italic">Atualizado em {new Date(o.criadoEm).toLocaleDateString()}</span>
                          <Link to="/ocorrencia" className="text-primary font-bold">Ver detalhes</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botões de Opção/Sugestão */}
              {m.de === "bot" && m.opcoes && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {m.opcoes.map((op, idx) => (
                    <button
                      key={idx}
                      onClick={() => enviar(op.valor)}
                      className="px-4 py-2 rounded-full bg-primary-soft text-primary text-xs font-bold shadow-sm border border-primary/10 active:scale-95 transition-transform"
                    >
                      {op.rotulo}
                    </button>
                  ))}
                </div>
              )}

              {/* Ação Principal */}
              {m.de === "bot" && m.acao && (
                <Link
                  to={m.acao.para}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-float active:scale-95 transition-transform"
                >
                  {m.acao.rotulo} <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        ))}

        {estaDigitando && (
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-float text-white self-end mb-2">
              <Bot className="size-6 animate-pulse" />
            </div>
            <div className="bg-card border border-border/50 rounded-3xl rounded-bl-md px-6 py-4 flex gap-1 items-center shadow-sm">
              <span className="size-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 bg-muted-foreground/30 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        
        <div ref={fim} />
      </div>

      {/* Barra de Ação Rápida Superior (Contatos e Emergência) */}
      <div className="fixed bottom-[14.5rem] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-4 pointer-events-none">
        <div className="pointer-events-auto bg-background/80 backdrop-blur-md rounded-3xl border border-border/50 p-2 shadow-float flex gap-2">
          <a href="https://wa.me/554699999999" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-success text-success-foreground text-[10px] font-black uppercase">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a href="tel:192" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-destructive text-destructive-foreground text-[10px] font-black uppercase">
            <Ambulance className="size-4" /> SAMU 192
          </a>
        </div>
      </div>

      {/* Campo de Entrada de Mensagem */}
      <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 bg-background/95 backdrop-blur-lg px-4 pt-3 pb-6 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
          className="flex gap-2"
        >
          <div className="flex-1 relative">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Descreva o que você precisa..."
              className="w-full min-h-[56px] rounded-2xl border border-border bg-card pl-12 pr-4 text-sm font-medium shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          </div>
          <button
            type="submit"
            disabled={!texto.trim()}
            className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-float active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
          >
            <Send className="size-6" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
