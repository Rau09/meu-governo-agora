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
      <div className="p-8">
        <h1 className="text-3xl font-bold">Cantu Conecta</h1>
        <p className="mt-4">
          O Futuro do Atendimento Público na Cantuquiriguaçu chegou.
        </p>
      </div>
    </AppShell>
  );
}
