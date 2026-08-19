import { type ReactNode, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Stethoscope, PawPrint, MessageCircle, UserRound, LayoutPanelLeft, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { LibrasAvatar } from "./LibrasAvatar";
import { useLibras } from "@/lib/libras-translator";


const nav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/saude", label: "Saúde", icon: Stethoscope },
  { to: "/atendimento", label: "Assistente", icon: MessageCircle },
  { to: "/causa-animal", label: "Animal", icon: PawPrint },
  { to: "/perfil", label: "Perfil", icon: UserRound },
] as const;

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const constraintsRef = useRef(null);
  const { ativo, toggleAtivo } = useLibras();

  return (
    <div className="min-h-dvh bg-secondary/40" ref={constraintsRef}>
      <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-background shadow-float relative">
        <main className="pb-28">{children}</main>

        <LibrasAvatar />

        <motion.button
          drag
          dragConstraints={constraintsRef}
          whileTap={{ scale: 0.9 }}
          onClick={toggleAtivo}
          className={`fixed bottom-24 left-8 z-50 flex size-14 cursor-grab items-center justify-center rounded-full shadow-2xl transition-colors active:cursor-grabbing ${
            ativo ? "hidden bg-primary text-primary-foreground" : "bg-white text-primary"
          }`}
          aria-label="Ativar intérprete de Libras"
        >
          <LayoutPanelLeft className="size-7" />
          {!ativo && (
            <span className="absolute -right-1 -top-1 flex size-5 animate-bounce items-center justify-center rounded-full bg-destructive text-[10px] font-black text-white">
              !
            </span>
          )}
        </motion.button>


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

