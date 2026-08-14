import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Pill } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { MEDICAMENTOS, statusMedicamento } from "@/lib/cantu-store";

export const Route = createFileRoute("/medicamentos")({
  head: () => ({
    meta: [
      { title: "Medicamentos Disponíveis — Cantu Conecta" },
      {
        name: "description",
        content:
          "Consulte a disponibilidade de medicamentos nas unidades de saúde da região Cantuquiriguaçu antes de sair de casa.",
      },
      { property: "og:title", content: "Medicamentos Disponíveis — Cantu Conecta" },
      {
        property: "og:description",
        content: "Veja em qual UBS o seu medicamento está disponível e a quantidade em estoque na sua cidade.",
      },
    ],
  }),
  component: Medicamentos,
});

const FILTROS = [
  { id: "todos", nome: "Todos" },
  { id: "disponivel", nome: "🟢 Disponível" },
  { id: "baixo", nome: "🟡 Estoque baixo" },
  { id: "indisponivel", nome: "🔴 Indisponível" },
] as const;

function Medicamentos() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<string>("todos");

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return MEDICAMENTOS.filter((m) => {
      const st = statusMedicamento(m.quantidade).id;
      const casaTexto =
        !termo || m.nome.toLowerCase().includes(termo) || m.unidade.toLowerCase().includes(termo);
      return casaTexto && (filtro === "todos" || st === filtro);
    });
  }, [busca, filtro]);

  return (
    <AppShell librasMensagem="Consulta de medicamentos: pesquise o remédio e veja em qual unidade de saúde ele está disponível.">
      <TopBar titulo="Medicamentos" subtitulo="Disponibilidade nas unidades de saúde" />

      <div className="-mt-5 px-4">
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
          <Search className="size-4 text-muted-foreground" />
          <span className="sr-only">Buscar medicamento</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar medicamento (ex: dipirona)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="-mx-0 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
              filtro === f.id
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f.nome}
          </button>
        ))}
      </div>

      <div className="mt-4 px-4">
        {lista.length === 0 ? (
          <p className="rounded-3xl bg-secondary p-4 text-sm text-muted-foreground">
            Nenhum medicamento encontrado com esse filtro.
          </p>
        ) : (
          <ul className="space-y-2">
            {lista.map((m, i) => {
              const st = statusMedicamento(m.quantidade);
              return (
                <li
                  key={`${m.nome}-${m.unidade}`}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className="flex animate-in items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card fade-in slide-in-from-bottom-2 duration-500"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Pill className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-tight">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">{m.unidade}</p>
                    <p className="mt-0.5 text-[11px] font-medium">
                      {st.emoji} {st.rotulo} · {m.quantidade} unid.
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-4 rounded-2xl bg-secondary p-3 text-[11px] leading-relaxed text-muted-foreground">
          Estoque de demonstração, atualizado pela Secretaria de Saúde. Confirme na unidade antes de se
          deslocar.
        </p>
      </div>
    </AppShell>
  );
}
