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
          className={`fixed bottom-24 right-8 z-50 flex size-14 cursor-grab items-center justify-center rounded-full shadow-2xl transition-all active:cursor-grabbing ${
            ativo ? "hidden bg-primary text-primary-foreground" : "bg-primary text-white"
          }`}
          aria-label="Ativar intérprete de Libras"
        >
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
              <path d="M10 18H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5" />
              <path d="m8 22 4-4 4 4" />
              <path d="M16 8h.01" />
              <path d="M8 8h.01" />
              <path d="M12 12h.01" />
            </svg>
          </div>
          {!ativo && (
            <span className="absolute -right-1 -top-1 flex size-5 animate-pulse items-center justify-center rounded-full bg-white text-[10px] font-black text-primary border-2 border-primary">
              L
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

