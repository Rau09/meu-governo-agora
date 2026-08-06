import { useState } from "react";
import { Hand, X, Volume2 } from "lucide-react";

/**
 * Avatar de Libras: assistente de acessibilidade para pessoas surdas.
 * Fica flutuando sobre a interface e "sinaliza" o conteúdo da tela.
 */
export function LibrasAvatar({ mensagem }: { mensagem?: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar intérprete de Libras" : "Abrir intérprete de Libras"}
        className="fixed bottom-24 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-accent-gradient text-accent-foreground shadow-float transition-transform active:scale-95"
      >
        {aberto ? <X className="size-6" /> : <Hand className="size-6" />}
      </button>

      {aberto && (
        <div className="fixed bottom-42 right-4 z-50 w-64 overflow-hidden rounded-3xl border border-border bg-card shadow-float">
          <div className="flex items-center justify-between bg-primary-soft px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
              Intérprete de Libras
            </span>
            <Volume2 className="size-4 text-muted-foreground" />
          </div>

          <div className="flex justify-center bg-secondary/60 py-4">
            <SignerFigure />
          </div>

          <p className="px-4 py-3 text-sm leading-snug text-muted-foreground">
            {mensagem ?? "Estou traduzindo esta tela em Libras para você."}
          </p>
        </div>
      )}
    </>
  );
}

function SignerFigure() {
  return (
    <svg viewBox="0 0 120 140" className="h-32 w-28" role="img" aria-label="Avatar sinalizando em Libras">
      <ellipse cx="60" cy="132" rx="30" ry="5" fill="currentColor" className="text-muted-foreground/25" />
      {/* corpo */}
      <path
        d="M35 128 Q35 78 60 78 Q85 78 85 128 Z"
        className="fill-primary"
      />
      <path d="M46 78h28v10a14 14 0 0 1-28 0z" className="fill-primary/70" />
      {/* cabeça */}
      <circle cx="60" cy="48" r="24" className="fill-accent-soft" />
      <path d="M36 44a24 24 0 0 1 48 0c0-16-10-24-24-24S36 28 36 44z" className="fill-foreground/80" />
      <circle cx="51" cy="49" r="3" className="fill-foreground" />
      <circle cx="69" cy="49" r="3" className="fill-foreground" />
      <path d="M53 59q7 5 14 0" className="stroke-foreground" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* braços sinalizando */}
      <g className="animate-sign-left">
        <rect x="26" y="82" width="11" height="34" rx="5.5" className="fill-accent-soft" />
        <circle cx="31.5" cy="118" r="8" className="fill-accent-soft" />
      </g>
      <g className="animate-sign-right">
        <rect x="83" y="82" width="11" height="34" rx="5.5" className="fill-accent-soft" />
        <circle cx="88.5" cy="118" r="8" className="fill-accent-soft" />
      </g>
    </svg>
  );
}
