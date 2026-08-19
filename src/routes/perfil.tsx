import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, TopBar } from "@/components/AppShell";
import { UserRound, ShieldCheck, Bell, History, Settings, LogOut, ChevronRight, MapPin } from "lucide-react";
import { useCidadao } from "@/lib/cantu-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { cidadao, sair } = useCidadao();

  if (!cidadao) {
    return (
      <AppShell >
        <TopBar titulo="Meu Perfil" />
        <div className="flex flex-col items-center justify-center p-10 text-center min-h-[50vh]">
          <div className="size-20 rounded-[2rem] bg-secondary flex items-center justify-center mb-4">
            <UserRound className="size-10 text-muted-foreground" />
          </div>
          <h2 className="font-bold text-lg mb-2">Acesse sua conta</h2>
          <p className="text-sm text-muted-foreground mb-6">Crie seu acesso para acompanhar suas consultas e solicitações.</p>
          <Button asChild className="rounded-2xl px-8">
            <a href="/registro">Criar meu acesso</a>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell >
      <TopBar titulo="Meu Perfil" />
      
      <div className="px-5 py-6 space-y-6">
        <header className="flex items-center gap-4 p-6 rounded-[2.5rem] bg-card border border-border shadow-sm">
          <div className="size-16 rounded-[2rem] bg-primary-gradient flex items-center justify-center text-white font-bold text-2xl">
            {cidadao.nome.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-xl">{cidadao.nome}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" /> {cidadao.municipio || "Cantuquiriguaçu"} · {cidadao.bairro}
            </p>
          </div>
        </header>

        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2 mb-3">Minha Atividade</h3>
          <div className="rounded-[2rem] bg-card border border-border overflow-hidden">
            <Link 
              to="/comunidade" 
              className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors border-b border-border"
            >
              <div className="flex items-center gap-3">
                <History className="size-5 text-primary" />
                <span className="text-sm font-medium">Histórico de Protocolos</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <Link 
              to="/saude" 
              className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-primary" />
                <span className="text-sm font-medium">Dados da Carteira de Saúde</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2 mb-3">Preferências</h3>
          <div className="rounded-[2rem] bg-card border border-border overflow-hidden">
            <Link 
              to="/atendimento" 
              className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors border-b border-border"
            >
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-primary" />
                <span className="text-sm font-medium">Notificações</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <Link 
              to="/atendimento" 
              className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="size-5 text-primary" />
                <span className="text-sm font-medium">Configurações da Conta</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </section>

        <Button 
          variant="destructive" 
          className="w-full rounded-2xl h-12 gap-2 mt-4 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
          onClick={() => {
            sair();
            window.location.href = "/";
          }}
        >
          <LogOut className="size-4" />
          Sair da Conta
        </Button>
      </div>
    </AppShell>
  );
}
