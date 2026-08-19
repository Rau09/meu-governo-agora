import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Stethoscope, PawPrint, MapPin, MessageCircle, UserRound, Building2, Hand } from "lucide-react";
import { LibrasViewer } from "./LibrasAvatar";


const nav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/saude", label: "Saúde", icon: Stethoscope },
  { to: "/atendimento", label: "Assistente", icon: MessageCircle },
  { to: "/causa-animal", label: "Animal", icon: PawPrint },
  { to: "/perfil", label: "Perfil", icon: UserRound },
] as const;

export function AppShell({
  children,
  librasMensagem,
}: {
  children: ReactNode;
  librasMensagem?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [librasAtivo, setLibrasAtivo] = useState(false);

  return (
    <div className="min-h-dvh bg-secondary/40">
      <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-background shadow-float">
        <main className="pb-28">{children}</main>

        {/* Botão Flutuante de Acessibilidade (Libras) */}
        {librasMensagem && (
          <button
            onClick={() => setLibrasAtivo(true)}
            className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl transition-all active:scale-95"
            aria-label="Ver tradução em Libras"
          >
            <div className="font-black text-[10px] absolute -top-2 bg-primary px-2 py-0.5 rounded-full text-primary-foreground border-2 border-background">LIBRAS</div>
            <Hand className="size-6" />
          </button>
        )}

        {librasAtivo && librasMensagem && (
          <LibrasViewer 
            mensagem={librasMensagem} 
            onClose={() => setLibrasAtivo(false)} 
          />
        )}

        <nav
          aria-label="Navegação principal"
          className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur"
        >
          <ul className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5">
            {nav.map(({ to, label, icon: Icon }) => {
              const ativo = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition-colors ${
                      ativo ? "bg-primary-soft text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        
      </div>
    </div>
  );
}

export function TopBar({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  return (
    <header className="bg-hero px-5 pb-8 pt-10 text-primary-foreground">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
          Cantuquiriguaçu · PR
        </p>
        {pathname !== "/gestao" && (
           <Link to="/gestao" className="opacity-40 hover:opacity-100 transition-opacity">
             <Building2 className="size-4" />
           </Link>
        )}
      </div>
      <h1 className="mt-1 text-2xl font-bold">{titulo}</h1>
      {subtitulo && <p className="mt-1 text-sm opacity-90">{subtitulo}</p>}
    </header>
  );
}

