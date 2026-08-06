import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { AREAS } from "@/lib/city-store";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços da Cidade — QI Cidadão" },
      {
        name: "description",
        content: "Todos os serviços de saúde, educação, obras e cidadania de Quedas do Iguaçu em um só lugar.",
      },
      { property: "og:title", content: "Serviços da Cidade — QI Cidadão" },
      {
        property: "og:description",
        content: "Encontre e solicite qualquer serviço municipal direto pelo celular.",
      },
    ],
  }),
  component: Servicos,
});

function Servicos() {
  const [busca, setBusca] = useState("");
  const termo = busca.trim().toLowerCase();

  return (
    <AppShell librasMensagem="Lista de serviços da cidade. Toque em um serviço para agendar ou solicitar.">
      <TopBar titulo="Serviços" subtitulo="Tudo que a prefeitura oferece, sem sair de casa" />

      <div className="-mt-5 px-4">
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
          <Search className="size-4 text-muted-foreground" />
          <span className="sr-only">Buscar serviço</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar serviço (ex: vacina, IPTU)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="mt-6 space-y-6 px-4">
        {AREAS.map((area) => {
          const servicos = area.servicos.filter((s) => s.toLowerCase().includes(termo));
          if (servicos.length === 0) return null;
          return (
            <section key={area.id}>
              <h2 className={`mb-2 text-sm font-bold uppercase tracking-wide ${area.cor}`}>{area.nome}</h2>
              <ul className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
                {servicos.map((servico) => (
                  <li key={servico} className="border-b border-border last:border-0">
                    <Link
                      to="/agendamento"
                      search={{ servico }}
                      className="flex min-h-14 items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="text-sm font-medium">{servico}</span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
