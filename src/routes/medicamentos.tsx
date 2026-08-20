import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Pill, AlertTriangle, CheckCircle2, Building2, MapPin, ChevronRight, Info, AlertCircle, BarChart3, Clock } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { MEDICAMENTOS, statusMedicamento, type Medicamento, useMedicamentos } from "@/lib/cantu-store";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/medicamentos")({
  head: () => ({
    meta: [
      { title: "Medicamentos Disponíveis — Cantu Conecta" },
      {
        name: "description",
        content:
          "Consulte a disponibilidade de medicamentos nas unidades de saúde da região Cantuquiriguaçu. Dados oficiais e transparência.",
      },
      { property: "og:title", content: "Central de Medicamentos — Cantu Conecta" },
      {
        property: "og:description",
        content: "Consulte estoque, localize farmácias e reporte falta de medicamentos na sua cidade.",
      },
    ],
  }),
  component: Medicamentos,
});

const FILTROS = [
  { id: "todos", nome: "Todos", emoji: "📋" },
  { id: "disponivel", nome: "Disponível", emoji: "🟢" },
  { id: "baixo", nome: "Estoque baixo", emoji: "🟡" },
  { id: "indisponivel", nome: "Indisponível", emoji: "🔴" },
] as const;

function Medicamentos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<string>("todos");
  const [detalhe, setDetalhe] = useState<Medicamento | null>(null);
  const MEDICAMENTOS_REAL = useMedicamentos();

  const stats = useMemo(() => {
    const todos = MEDICAMENTOS_REAL.length;
    const disponiveis = MEDICAMENTOS_REAL.filter(m => statusMedicamento(m.quantidade).id === 'disponivel').length;
    const baixo = MEDICAMENTOS_REAL.filter(m => statusMedicamento(m.quantidade).id === 'baixo').length;
    const indisponiveis = MEDICAMENTOS_REAL.filter(m => statusMedicamento(m.quantidade).id === 'indisponivel').length;
    return { todos, disponiveis, baixo, indisponiveis };
  }, [MEDICAMENTOS_REAL]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return MEDICAMENTOS_REAL.filter((m) => {
      const st = statusMedicamento(m.quantidade).id;
      const casaTexto =
        !termo || m.nome.toLowerCase().includes(termo) || m.unidade.toLowerCase().includes(termo);
      return casaTexto && (filtro === "todos" || st === filtro);
    });
  }, [busca, filtro, MEDICAMENTOS_REAL]);


  return (
    <AppShell >
      <TopBar titulo="Medicamentos" subtitulo="Consulta de disponibilidade e transparência" />

      <div className="-mt-6 space-y-6 px-4 pb-12">
        {/* 1. Busca e Filtros */}
        <div className="space-y-4">
          <label className="flex items-center gap-3 rounded-3xl border border-border bg-card px-5 py-4 shadow-card transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="size-5 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome do medicamento..."
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm ${
                  filtro === f.id
                    ? "bg-primary text-primary-foreground shadow-float"
                    : "bg-card border border-border text-muted-foreground"
                }`}
              >
                <span>{f.emoji}</span>
                {f.nome}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Indicadores de Estoque */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
            <div className="flex size-9 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-black text-foreground">{stats.disponiveis}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Disponíveis</p>
          </div>
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
            <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-black text-foreground">{stats.baixo}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estoque Baixo</p>
          </div>
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
            <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-black text-foreground">{stats.indisponiveis}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Indisponíveis</p>
          </div>
          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-black text-foreground">
              {new Set(MEDICAMENTOS_REAL.map((m: any) => m.unidade)).size || 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unidades Atendendo</p>
          </div>

        </section>

        {/* 3. Lista de Medicamentos */}
        <section>
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-foreground">Lista de Medicamentos</h2>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {lista.length} resultados
            </span>
          </div>

          {lista.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border p-12 text-center">
              <Search className="mx-auto size-8 text-muted-foreground/30" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">Nenhum medicamento encontrado.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {lista.map((m: any, i: number) => {
                const st = statusMedicamento(m.quantidade);
                const isDemo = false; // Removendo flag estática já que os dados são do banco

                return (
                  <li key={`${m.nome}-${m.unidade}`} style={{ animationDelay: `${i * 40}ms` }} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <button
                      type="button"
                      onClick={() => setDetalhe(m)}
                      className="w-full text-left group relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-float active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`flex size-12 shrink-0 items-center justify-center rounded-[1.25rem] ${st.id === 'indisponivel' ? 'bg-destructive/10 text-destructive' : 'bg-primary-soft text-primary'}`}>
                            <Pill className="size-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground leading-tight group-hover:text-primary transition-colors">{m.nome}</p>
                            <p className="text-[11px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                              <Building2 className="size-3" /> {m.unidade}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                                st.id === 'disponivel' ? 'bg-success/10 text-success border-success/20' : 
                                st.id === 'baixo' ? 'bg-warning/10 text-warning border-warning/20' : 
                                'bg-destructive/10 text-destructive border-destructive/20'
                              }`}>
                                {st.rotulo}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="size-5 text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                           <Clock className="size-3" /> Atualizado há 2h
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ver Detalhes</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 4. Panorama da Assistência Farmacêutica */}
        <section className="rounded-[2.5rem] bg-primary p-7 text-primary-foreground shadow-float">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="size-5" />
            <h2 className="text-base font-black uppercase tracking-widest">Panorama Regional</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-black tracking-tight">3,99 milhões</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Medicamentos distribuídos — Ref. 2025</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xl font-black">14.114</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mt-1">Pacientes Atendidos</p>
              </div>
              <div>
                <p className="text-xl font-black">R$ 1,03 mi</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mt-1">Investimento Direto</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-white/20 pt-6">
            <p className="text-[10px] leading-relaxed opacity-60 italic">
              Dados consolidados pela Secretaria Municipal de Saúde de Quedas do Iguaçu. Fonte: Portal da Transparência.
            </p>
          </div>
        </section>

        {/* 5. Unidades de Atendimento */}
        <section>
          <div className="mb-4 px-2">
            <h2 className="text-sm font-bold text-foreground">Encontre seu Medicamento</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Farmácias e Unidades de Saúde</p>
          </div>
          
          <div className="space-y-3">
            {[
              { nome: "Farmácia Municipal", end: "Rua Juazeiro, 123 - Centro", status: "🟢 Atendimento Normal", hora: "08:00 - 17:00" },
              { nome: "UBS Central", end: "Av. Tarumã, 500", status: "🟢 Atendimento Normal", hora: "07:30 - 18:30" }
            ].map((u, i) => (
              <div key={i} className="rounded-[2rem] border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-black text-foreground">{u.nome}</p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="size-3" /> {u.end}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                       <span className="text-[10px] font-bold text-success">{u.status}</span>
                       <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                         <Clock className="size-3" /> {u.hora}
                       </span>
                    </div>
                  </div>
                  <button className="rounded-xl bg-secondary p-2.5 text-primary shadow-sm active:scale-95 transition-all">
                    <MapPin className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Ação: Comunicar Problema */}
        <section className="rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-primary-soft/30 p-8 text-center">
          <div className="flex size-14 mx-auto items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-float mb-4">
             <AlertCircle className="size-8" />
          </div>
          <h3 className="text-base font-black text-foreground">Não encontrou seu medicamento?</h3>
          <p className="mt-2 text-xs font-medium text-muted-foreground leading-relaxed">
            Sua participação ajuda a prefeitura a monitorar e resolver faltas de estoque com mais agilidade.
          </p>
          <Link
            to="/ocorrencia"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-float hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Comunicar Falta de Medicamento
          </Link>
        </section>

        {/* 7. Transparência */}
        <footer className="text-center py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
            Fonte: Portal da Transparência · Quedas do Iguaçu
          </p>
        </footer>
      </div>

      {/* Modal de Detalhes (Simulado) */}
      {detalhe && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4 pb-4">
          <div className="w-full max-w-md rounded-[2.5rem] bg-card p-8 shadow-2xl animate-in slide-in-from-bottom-6 duration-500">
             <div className="flex items-center justify-between mb-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Pill className="size-6" />
                </div>
                <button onClick={() => setDetalhe(null)} className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Info className="size-5" />
                </button>
             </div>
             
             <h2 className="text-2xl font-black text-foreground tracking-tight">{detalhe.nome}</h2>
             <p className="text-sm font-bold text-primary mt-1">{detalhe.unidade}</p>
             
             <div className="mt-8 space-y-6">
                 <div className="grid grid-cols-1 gap-4">
                   <div className="rounded-2xl bg-secondary/50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status de Disponibilidade</p>
                      <p className={`text-lg font-black mt-1 ${statusMedicamento(detalhe.quantidade).id === 'indisponivel' ? 'text-destructive' : statusMedicamento(detalhe.quantidade).id === 'baixo' ? 'text-warning' : 'text-success'}`}>
                        {statusMedicamento(detalhe.quantidade).emoji} {statusMedicamento(detalhe.quantidade).rotulo}
                      </p>
                   </div>
                </div>

                
                <div className="space-y-4">
                   <div className="flex items-start gap-3">
                      <div className="mt-1 size-1.5 rounded-full bg-primary" />
                      <div>
                         <p className="text-xs font-bold text-foreground">Como retirar?</p>
                         <p className="text-[11px] text-muted-foreground mt-0.5">Apresentar documento com foto, cartão SUS e receita médica válida dentro do prazo.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="mt-1 size-1.5 rounded-full bg-primary" />
                      <div>
                         <p className="text-xs font-bold text-foreground">Ultima Atualização</p>
                         <p className="text-[11px] text-muted-foreground mt-0.5">Dados sincronizados há aproximadamente 2 horas.</p>
                      </div>
                   </div>
                </div>
             </div>
             
             <button 
               onClick={() => setDetalhe(null)}
               className="mt-10 w-full rounded-2xl bg-secondary py-4 text-sm font-black text-foreground hover:bg-secondary/80 transition-all"
             >
               Fechar Consulta
             </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
