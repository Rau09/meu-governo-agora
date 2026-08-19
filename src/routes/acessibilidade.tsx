import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Hand, Eye, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/acessibilidade")({
  head: () => ({
    title: "Acessibilidade e Libras — Cantu Conecta",
    meta: [
      { name: "description", content: "Conheça o novo Intérprete de Libras Acessível e Fluido da nossa plataforma." },
    ],
  }),
  component: AcessibilidadePage,
});

function AcessibilidadePage() {
  return (
    <AppShell librasMensagem="Esta página explica como usar o novo Intérprete de Libras. Ele foi criado para ser realista, profissional e fácil de usar, garantindo que todos os cidadãos tenham acesso aos serviços da nossa cidade.">
      <header className="bg-hero px-5 pb-12 pt-10 text-primary-foreground">
        <h1 className="text-3xl font-bold leading-tight">Acessibilidade Digital</h1>
        <p className="mt-2 max-w-[30ch] text-sm opacity-90">
          Inclusão real através de tecnologia humana e acessível.
        </p>
      </header>

      <div className="-mt-8 space-y-8 px-5 pb-12">
        <section className="rounded-[2rem] bg-card border border-border/50 p-6 shadow-float">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Hand className="size-6" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">Intérprete de Libras</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Avatar Realista Profissional</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Substituímos o modelo anterior por um avatar humano digital realista. Focado na cintura para cima, com mãos grandes e 5 dedos visíveis para gestos precisos.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Zap className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Controle de Velocidade e Fluxo</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ajuste a velocidade da interpretação (0.75x a 1.25x), pause ou repita partes importantes para melhor compreensão.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-accent-soft flex items-center justify-center text-accent-foreground flex-shrink-0">
                <Eye className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Alto Contraste e Visibilidade</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Fundo limpo e iluminação otimizada para garantir que cada movimento da mão e expressão facial seja perfeitamente visível.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Compromisso Cantu</h2>
          <div className="rounded-[2rem] bg-primary text-primary-foreground p-8 shadow-lg">
            <ShieldCheck className="size-10 mb-4 opacity-50" />
            <p className="text-lg font-bold leading-tight">
              "PARE DE GERAR UM PERSONAGEM/AVATAR PARA FAZER LIBRAS. PERSONAGENS INFANTIS E CARICATURAS SÃO REPROVADOS."
            </p>
            <p className="text-xs mt-4 opacity-80 leading-relaxed">
              Nosso compromisso é com a seriedade do serviço público. A acessibilidade não é um detalhe, é um direito fundamental de todo cidadão da Cantuquiriguaçu.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
