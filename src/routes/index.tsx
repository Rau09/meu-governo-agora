import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cantu Conecta — Saúde e Causa Animal na Cantuquiriguaçu" },
      {
        name: "description",
        content:
          "Sua cidade, sua saúde, seu cuidado. Plataforma de tecnologia cívica para aproximar o cidadão do poder público.",
      },
      { property: "og:title", content: "Cantu Conecta — Sua cidade, sua saúde, seu cuidado" },
      {
        property: "og:description",
        content: "Agende consultas, acompanhe a causa animal e participe da sua comunidade.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  return (
    <AppShell librasMensagem="Bem-vindo ao Cantu Conecta.">
      <div className="flex flex-col min-h-[60vh] items-center justify-center p-8 text-center bg-background">
        <div className="w-full max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl uppercase">
              LIBRAS
            </h1>
            <p className="text-xl font-bold text-primary tracking-tight">
              “Veja esta informação em Libras”
            </p>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] border-4 border-primary/20 bg-secondary shadow-2xl flex items-center justify-center group transition-all hover:border-primary/40">
             <div className="text-center space-y-3 p-8">
               <div className="text-primary font-black text-2xl tracking-tighter uppercase">VÍDEO DO INTÉRPRETE</div>
               <div className="text-muted-foreground font-medium text-sm">intérprete humano real</div>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          <div className="pt-8">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              Cantu Conecta · Acessibilidade Universal
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

