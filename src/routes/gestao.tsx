import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Clock3,
  CheckCircle2,
  Lock,
  LogOut,
  MapPin,
  Inbox,
  ChevronRight,
  Sparkles,
  X,
  AlertTriangle,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Filter,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, TopBar } from "@/components/AppShell";
import { MapaOcorrencias } from "@/components/MapaOcorrencias";
import {
  AREAS,
  STATUS_OCORRENCIA,
  useAgendamentos,
  useOcorrencias,
  type Ocorrencia,
  type StatusOcorrencia,
} from "@/lib/cantu-store";
import {
  NIVEIS,
  alertas,
  analisar,
  atrasada,
  diasAberto,
  indicadores,
  metaCategoria,
  nivel as nivelOcorrencia,
  prioridades,
  resumir,
  unificar,
  type OcorrenciaGestao,
} from "@/lib/cantu-gestao";

export const Route = createFileRoute("/gestao")({
  head: () => ({
    meta: [
      { title: "Painel de Gestão — Cantu Conecta" },
      {
        name: "description",
        content: "Painel restrito da região Cantuquiriguaçu: demanda por área e inteligência de gestão pública.",
      },
      { property: "og:title", content: "Painel de Gestão — Cantu Conecta" },
      { property: "og:description", content: "Acesso restrito para gestão inteligente dos serviços regionais." },
    ],
  }),
  component: Gestao,
});

const CHAVE = "qi-gestao-sessao";
const USUARIO = "prefeitura";
const SENHA = "quedas2026";

function Gestao() {
  const [logado, setLogado] = useState(false);
  const [gestor, setGestor] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLogado(false);
        setGestor(false);
        setLoading(false);
        setPronto(true);
        return;
      }

      setLogado(true);

      // Verificar se é gestor no banco de dados
      const { data: isGestor } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'gestor'
      });

      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      setGestor(!!(isGestor || isAdmin));
      setLoading(false);
      setPronto(true);
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || !pronto) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-muted-foreground tracking-tight">Verificando credenciais...</p>
        </div>
      </AppShell>
    );
  }

  // Se não estiver logado OU não for gestor, mostra a tela de Login
  // Para manter a "separação segura", não dizemos que o usuário está logado mas sem permissão,
  // apenas tratamos como acesso restrito.
  if (!logado || !gestor) {
    return (
      <Login
        onEntrar={() => {
          // A função onEntrar aqui serve para avisar o componente que o estado mudou após login
          // A verificação real acontece no useEffect do checkAuth
        }}
      />
    );
  }

  return (
    <Painel
      onSair={async () => {
        await supabase.auth.signOut();
        setLogado(false);
        setGestor(false);
      }}
    />
  );
}

function Login({ onEntrar }: { onEntrar: () => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (usuario.trim().toLowerCase() === USUARIO && senha === SENHA) {
      setErro("");
      onEntrar();
    } else {
      setErro("Usuário ou senha inválidos.");
    }
  }

  return (
    <AppShell >
      <TopBar titulo="Portal da Gestão" subtitulo="Espaço administrativo Cantu Conecta" />
      <div className="-mt-6 px-4">
        <form
          onSubmit={submit}
          className="animate-in rounded-3xl border border-border bg-card p-8 shadow-card fade-in slide-in-from-bottom-3 duration-500"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft">
            <Lock className="size-6 text-primary" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Acesso Administrativo</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Bem-vindo à área de gestão regional.</p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-bold text-muted-foreground" htmlFor="usuario">
                Usuário
              </label>
              <input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Identificador do servidor"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground" htmlFor="senha">
                Senha de Acesso
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="••••••••"
              />
            </div>
          </div>

          {erro && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-xs font-bold text-destructive">
              <AlertTriangle className="size-4" />
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-float transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Entrar no Sistema
          </button>
          <p className="mt-5 text-center text-[11px] font-medium text-muted-foreground/60 italic">
            Acesso restrito a servidores autorizados da Cantuquiriguaçu.
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function Painel({ onSair }: { onSair: () => void }) {
  const { agendamentos } = useAgendamentos();
  const { ocorrencias, atualizarStatus } = useOcorrencias();
  const [filtro, setFiltro] = useState<string>("todas");
  const [animar, setAnimar] = useState(false);
  const [detalhe, setDetalhe] = useState<{ titulo: string; nota?: string; itens: OcorrenciaGestao[] } | null>(null);
  const [mapaFiltro, setMapaFiltro] = useState("todos");
  const [destaque, setDestaque] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  function setAcao(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso(null), 3200);
  }

  const [verRecomendacao, setVerRecomendacao] = useState(false);
  const mapaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimar(true), 60);
    return () => clearTimeout(t);
  }, []);

  const lista = useMemo(() => unificar(ocorrencias), [ocorrencias]);
  const resumo = useMemo(() => resumir(lista), [lista]);
  const alertasAtivos = useMemo(() => alertas(lista), [lista]);
  const focos = useMemo(() => prioridades(lista).slice(0, 4), [lista]);
  const indices = useMemo(() => indicadores(lista), [lista]);
  const analise = useMemo(() => analisar(lista), [lista]);

  const ativos = useMemo(() => lista.filter((o) => o.status !== "resolvido"), [lista]);

  function irParaMapa(itens: OcorrenciaGestao[], filtroMapa = "todos") {
    setMapaFiltro(filtroMapa);
    setDestaque(itens.map((o) => o.protocolo));
    setDetalhe(null);
    setTimeout(() => mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  const porArea = useMemo(() => {
    const base = AREAS.map((a) => ({ nome: a.nome, total: 0 }));
    for (const ag of agendamentos) {
      const item = base.find((b) => b.nome === ag.area);
      if (item) item.total += 1;
    }
    const max = Math.max(1, ...base.map((b) => b.total));
    return base.map((b) => ({ ...b, pct: Math.round((b.total / max) * 100) }));
  }, [agendamentos]);

  const fila = useMemo(
    () => (filtro === "todas" ? agendamentos : agendamentos.filter((a) => a.area === filtro)),
    [agendamentos, filtro],
  );

  const cards = [
    {
      icon: Inbox,
      valor: resumo.abertas,
      label: "Solicitações abertas",
      nota: `${resumo.variacaoAbertas >= 0 ? "↑" : "↓"} ${Math.abs(resumo.variacaoAbertas)}% vs. mês anterior`,
      tom: "text-primary",
      itens: ativos.filter((o) => o.status === "recebido" || o.status === "analise"),
    },
    {
      icon: Users,
      valor: resumo.execucao,
      label: "Em execução",
      nota: "equipes em campo",
      tom: "text-primary",
      itens: ativos.filter((o) => o.status === "andamento"),
    },
    {
      icon: Clock3,
      valor: resumo.atrasadas,
      label: "Atrasadas",
      nota: "⚠️ precisam de atenção",
      tom: "text-destructive font-bold",
      itens: ativos.filter(atrasada),
    },
    {
      icon: AlertTriangle,
      valor: resumo.criticas,
      label: "Gravidade Alta",
      nota: "prioridade total",
      tom: "text-destructive",
      itens: ativos.filter((o) => nivelOcorrencia(o) === "critico"),
    },
    {
      icon: CheckCircle2,
      valor: resumo.resolvidas,
      label: "Resolvidas no mês",
      nota: "−70% de espera",
      tom: "text-success",
      itens: lista.filter((o) => o.status === "resolvido").slice(0, 30),
    },
  ];

  return (
    <AppShell>
      <TopBar titulo="Painel de Gestão" subtitulo="Inteligência Regional Cantuquiriguaçu" />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="-mt-6 space-y-6 px-4 pb-24">
        {/* Barra de Pesquisa */}
        <section className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Pesquisar protocolo..." className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all" />
          </div>
          <button onClick={onSair} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border text-destructive active:scale-95 transition-all shadow-sm" title="Sair">
            <LogOut className="size-5" />
          </button>
        </section>

        {/* Resumo */}
        <section className="grid grid-cols-2 gap-4">
          {cards.slice(2, 4).map(({ icon: Icon, valor, label, nota, tom, itens }, i) => (
            <motion.button key={label} onClick={() => setDetalhe({ titulo: label, nota, itens })} className="rounded-[2rem] border border-border bg-card p-5 shadow-sm text-left relative overflow-hidden">
              <div className={`flex size-10 items-center justify-center rounded-2xl mb-3 ${tom.includes("destructive") ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                <Icon className="size-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-black text-foreground">{valor}</p>
            </motion.button>
          ))}
        </section>

        {/* 2. Prioridades Estratégicas */}
        <section className="rounded-[2.5rem] border border-border bg-card p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-bold text-foreground">Ações Prioritárias</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Foco Operacional Imediato</p>
            </div>
            <ShieldCheck className="size-5 text-primary/40" />
          </div>
          
          <div className="space-y-3">
            {prioridades(lista).filter(p => p.nivel === 'critico').slice(0, 3).map((p: any, idx: number) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ x: 4 }}
                onClick={() => setDetalhe({ titulo: p.categoria, nota: p.bairro, itens: p.itens })}
                className="group w-full relative flex items-center gap-4 rounded-3xl bg-secondary/30 p-4 transition-all hover:bg-secondary/50 text-left"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card border border-border text-xl">
                  {metaCategoria(p.categoria).emoji}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-xs font-bold text-foreground">{p.categoria}</h3>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {p.bairro} · <span className="text-destructive font-bold">{p.total} solicitações</span>
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* 3. Mapa Interativo */}
        <section ref={mapaRef} className="scroll-mt-4 rounded-[2.5rem] overflow-hidden border border-border shadow-card">
          <MapaOcorrencias key={mapaFiltro} lista={lista} filtroInicial={mapaFiltro} destaque={destaque} />
        </section>

        {/* 4. Protocolos de Emergência */}
        <DetalhesEmergencia alertasAtivos={alertasAtivos} setDetalhe={setDetalhe} animar={animar} />

        {/* 5. Monitoramento por Setor */}
        <MonitoramentoSetor focos={focos} setDetalhe={setDetalhe} setAcao={setAcao} animar={animar} />

        {/* 5. Análise IA e Recomendação */}
        <section className="rounded-[2.5rem] bg-primary p-7 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
              <BrainCircuit className="size-7" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Cantu IA Strategist</h2>
              <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Análise Regional Preditiva</p>
            </div>
          </div>

          <div className="mt-6 relative z-10">
            <p className="text-[13px] font-medium leading-relaxed opacity-90 italic border-l-2 border-white/30 pl-4">
              "{analise.texto}"
            </p>
            
            <div className="mt-5 rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Decisão Sugerida</p>
              <p className="text-xs font-bold leading-relaxed">{analise.recomendacao}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 relative z-10">
            <button 
              onClick={() => setVerRecomendacao(!verRecomendacao)}
              className="w-full rounded-2xl bg-white/20 py-3.5 text-[11px] font-bold backdrop-blur-md transition-all hover:bg-white/30 active:scale-[0.98] border border-white/10"
            >
              {verRecomendacao ? "Recolher Relatório" : "Ver Detalhes do Relatório"}
            </button>
            
            <AnimatePresence>
              {verRecomendacao && (
                <motion.ul 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-2 overflow-hidden text-[11px] font-medium"
                >
                  {[
                    `Mobilizar unidade técnica para ${analise.bairroFoco}.`,
                    `Priorizar auditoria dos ${resumo.atrasadas} processos em atraso.`,
                    `Monitorar KPI de ${analise.categoriaFoco.toLowerCase()} no próximo ciclo.`
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-2 items-start py-1">
                      <span className="font-bold text-white/60">{idx + 1}.</span>
                      <span className="opacity-90">{item}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 6. Indicadores de Performance */}
        <section className="rounded-[2.5rem] border border-border bg-card p-7 shadow-card">
          <div className="mb-6 flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">Métricas de Eficiência</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Performance Regional Cantu</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
              <TrendingUp className="size-5 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SLA Médio</p>
              <p className="text-2xl font-black text-primary tracking-tighter">4.2 <span className="text-[10px] font-bold uppercase tracking-normal">dias</span></p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resolução</p>
              <p className="text-2xl font-black text-success tracking-tighter">92%</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-success" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Monitoramento Detalhado */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-foreground">Operação & Monitoramento</h2>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                <LayoutDashboard className="size-4" />
              </span>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4">
            {indices.map((ind: any, i: number) => (
              <motion.li 
                key={ind.grupo}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setDetalhe({
                      titulo: ind.grupo,
                      nota: `${ind.abertas} abertas · ${ind.execucao} em execução · ${ind.atrasadas} atrasadas`,
                      itens: ind.itens,
                    })
                  }
                  className="group h-full w-full rounded-[2rem] border border-border bg-card p-5 text-left shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-float active:scale-[0.98]"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{ind.grupo}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="font-display text-3xl font-black text-foreground tracking-tighter">{ind.abertas}</p>
                    <div className={`mb-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${ind.tendencia >= 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                      {ind.tendencia >= 0 ? "↑" : "↓"} {Math.abs(ind.tendencia)}%
                    </div>
                  </div>
                  
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground">Execução</span>
                      <span className="text-foreground">{ind.execucao}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(ind.execucao / (ind.abertas || 1)) * 100}%` }}
                        className="h-full bg-primary/60" 
                      />
                    </div>
                    {ind.atrasadas > 0 && (
                      <p className="text-[9px] font-black text-destructive uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="size-2.5" /> {ind.atrasadas} críticas em atraso
                      </p>
                    )}
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* 8. Demanda Consolidada por Área */}
        <section className="rounded-[2.5rem] border border-border bg-card p-7 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground tracking-tight">Carga de Trabalho por Setor</h2>
            <Filter className="size-4 text-muted-foreground/40" />
          </div>
          <ul className="space-y-4">
            {porArea.map((a: any, i: number) => (
              <li key={a.nome}>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <span className="text-muted-foreground">{a.nome}</span>
                  <span className="text-primary">{a.total} agendamentos</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary/50 border border-border/10 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: animar ? `${a.pct}%` : "0%" }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-sm"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. Solicitações e Fila de Atendimento */}
        <div className="grid grid-cols-1 gap-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Ocorrências Recentes
              </h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black text-primary">
                {ocorrencias.length} TOTAL
              </span>
            </div>

            {ocorrencias.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-border bg-card/50 p-10 text-center">
                <Inbox className="size-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-xs font-bold text-muted-foreground italic">
                  Nenhum registro pendente no sistema.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {ocorrencias.slice(0, 5).map((o, i) => (
                  <CardOcorrencia key={o.protocolo} ocorrencia={o} indice={i} onStatus={atualizarStatus} />
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Fila de Atendimentos
              </h2>
              <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-black text-muted-foreground">
                {fila.length} AGENDADOS
              </span>
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[{ id: "todas", nome: "Todas" }, ...AREAS.map((a) => ({ id: a.nome, nome: a.nome }))].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`shrink-0 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                    filtro === f.id
                      ? "bg-primary text-primary-foreground shadow-float"
                      : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f.nome}
                </button>
              ))}
            </div>

            {fila.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-border bg-card/50 p-10 text-center">
                <p className="text-xs font-bold text-muted-foreground italic">
                  Fila vazia para este setor.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {fila.slice(0, 10).map((a, i) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-success/10 text-success">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold truncate">{a.servico}</p>
                      <p className="text-[10px] font-medium text-muted-foreground truncate">
                        {a.nome} · {a.unidade} · {new Date(a.data + "T00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </motion.div>

      {detalhe && (
        <DetalheLista titulo={detalhe.titulo} nota={detalhe.nota} itens={detalhe.itens} onFechar={() => setDetalhe(null)} onMapa={(itens: OcorrenciaGestao[]) => irParaMapa(itens)} />
      )}
    </AppShell>
  );
}

function DetalhesEmergencia({ alertasAtivos, setDetalhe, animar }: { alertasAtivos: any[], setDetalhe: any, animar: boolean }) {
  return (
    <section
      style={{ transitionDelay: "550ms" }}
      className={`rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-7 shadow-card transition-all duration-500 ease-out ${
        animar ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Célula de Resposta Imediata</h2>
            <p className="text-[11px] font-medium text-muted-foreground">Alertas críticos priorizados pela análise regional preditiva.</p>
          </div>
        </div>
        <span className="rounded-full bg-destructive px-3 py-1 text-[10px] font-black text-white shadow-sm">
          {alertasAtivos.length} CRÍTICOS
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {alertasAtivos.map((a) => (
          <div key={a.id} className="group relative">
            <button
              type="button"
              onClick={() => setDetalhe({ titulo: a.titulo, nota: a.detalhe, itens: a.itens })}
              className="w-full rounded-[2rem] border border-border bg-card p-5 text-left shadow-sm transition-all duration-300 hover:border-destructive/40 hover:shadow-float active:scale-[0.99]"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/50 text-2xl leading-none">{a.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{a.titulo}</p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground font-medium">{a.detalhe}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${NIVEIS[a.nivel as keyof typeof NIVEIS].classe}`}>
                        {NIVEIS[a.nivel as keyof typeof NIVEIS].rotulo}
                      </span>
                      <span className="text-[10px] font-bold text-destructive/80 flex items-center gap-1">
                         <Clock3 className="size-3" /> {a.acao}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-primary underline underline-offset-2">Resolver agora</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonitoramentoSetor({ focos, setDetalhe, setAcao, animar }: { focos: any[], setDetalhe: any, setAcao: any, animar: boolean }) {
  return (
    <section style={{ transitionDelay: "650ms" }} className={animar ? "opacity-100" : "opacity-0"}>
      <div className="mb-5 flex items-center justify-between px-2">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">Monitoramento por Setor</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Visão Analítica Semanal</p>
        </div>
        <Link to="/gestao" className="text-[10px] font-bold text-primary uppercase tracking-wider">Ver Relatórios</Link>
      </div>
      
      <div className="space-y-4">
        {focos.map((p, i) => (
          <div
            key={p.id}
            style={{ animationDelay: `${i * 100}ms` }}
            className="animate-in rounded-[2rem] border border-border bg-card p-6 shadow-card transition-all duration-300 hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                   <span className="text-lg">{metaCategoria(p.categoria).emoji}</span>
                   <p className="text-base font-bold text-foreground tracking-tight">
                     {p.categoria}
                   </p>
                </div>
                <p className="text-[11px] font-bold text-muted-foreground mt-0.5">{p.bairro} — Cantuquiriguaçu</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${NIVEIS[p.nivel as keyof typeof NIVEIS].classe}`}>
                {NIVEIS[p.nivel as keyof typeof NIVEIS].rotulo}
              </span>
            </div>
            
            <div className="mt-4 flex items-center gap-6">
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Demanda</span>
                 <span className="text-sm font-black text-foreground">{p.total} casos</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Gravidade</span>
                 <span className="text-sm font-black text-destructive">{p.atrasadas} críticas</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Tendência</span>
                 <span className="text-sm font-black text-success">+{p.variacao}% res.</span>
               </div>
            </div>

            <div className="mt-5 rounded-2xl bg-secondary/30 p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="size-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Insight IA</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-muted-foreground italic">
                “{p.resumo}”
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDetalhe({ titulo: `${p.categoria} — ${p.bairro}`, nota: p.resumo, itens: p.itens })}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3.5 text-[10px] font-bold text-foreground hover:bg-secondary active:scale-95 transition-all shadow-sm"
              >
                Analisar Dados
              </button>
              <button
                type="button"
                onClick={() => setAcao(`Equipe operacional designada para ${p.bairro}.`)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-float transition-all"
              >
                Despachar Unidade
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetalheLista({
  titulo,
  nota,
  itens,
  onFechar,
  onMapa,
}: {
  titulo: string;
  nota?: string | null | undefined;
  itens: OcorrenciaGestao[];
  onFechar: () => void;
  onMapa: (itens: OcorrenciaGestao[]) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center">
      <div className="animate-in max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-[2.5rem] border border-border bg-background p-7 shadow-float slide-in-from-bottom-4 duration-300 sm:rounded-[2.5rem]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{titulo}</h3>
            {nota && <p className="mt-0.5 text-xs font-medium text-muted-foreground">{nota}</p>}
            <p className="mt-2 text-[11px] font-bold text-primary uppercase tracking-wider">{itens.length} registros encontrados</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary transition-transform active:scale-90"
          >
            <X className="size-5" />
          </button>
        </div>

        {itens.length > 0 && (
          <button
            type="button"
            onClick={() => onMapa(itens)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground shadow-float transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <MapPin className="size-4" /> Ver Geocalização
          </button>
        )}

        <ul className="mt-3 space-y-2 pb-2">
          {itens.slice(0, 40).map((o) => {
            const st = STATUS_OCORRENCIA.find((s) => s.id === o.status)!;
            const n = NIVEIS[nivelOcorrencia(o)];
            return (
              <li key={o.protocolo} className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/20">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold leading-snug">
                    {metaCategoria(o.categoria).emoji} {o.categoria}
                  </p>
                  <span className="shrink-0 text-[10px] font-black text-muted-foreground/50 tracking-tighter">{o.protocolo}</span>
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {o.bairro} · {diasAberto(o)} dias aberto
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-tight ${n.classe}`}>
                    {n.emoji} {n.rotulo}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-tight ${st.classe}`}>
                    {st.emoji} {st.rotulo}
                  </span>
                  {atrasada(o) && (
                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-[10px] font-bold text-destructive">
                      ⏰ Atraso Crítico
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CardOcorrencia({
  ocorrencia,
  indice,
  onStatus,
}: {
  ocorrencia: Ocorrencia;
  indice: number;
  onStatus: (protocolo: string, status: StatusOcorrencia) => void;
}) {
  const atual = STATUS_OCORRENCIA.find((s) => s.id === ocorrencia.status)!;

  return (
    <li
      style={{ animationDelay: `${indice * 45}ms` }}
      className="animate-in rounded-[2rem] border border-border bg-card p-5 shadow-card fade-in slide-in-from-bottom-2 duration-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-tight">{ocorrencia.categoria}</p>
          <p className="text-[11px] text-muted-foreground">
            {new Date(ocorrencia.criadoEm).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-soft px-2 py-1 text-[10px] font-bold text-primary">
          {ocorrencia.protocolo}
        </span>
      </div>

      {ocorrencia.foto && (
        <img
          src={ocorrencia.foto}
          alt={`Foto enviada na solicitação ${ocorrencia.protocolo}`}
          className="mt-2 h-36 w-full rounded-2xl object-cover"
        />
      )}

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ocorrencia.descricao}</p>

      {ocorrencia.local && (
        <a
          href={`https://www.google.com/maps?q=${ocorrencia.local.lat},${ocorrencia.local.lng}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
        >
          <MapPin className="size-3.5" />
          {ocorrencia.local.lat.toFixed(5)}, {ocorrencia.local.lng.toFixed(5)}
        </a>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${atual.classe}`}>
          {atual.emoji} {atual.rotulo}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {STATUS_OCORRENCIA.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStatus(ocorrencia.protocolo, s.id)}
            className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
              s.id === ocorrencia.status
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {s.emoji} {s.rotulo}
          </button>
        ))}
      </div>
    </li>
  );
}
