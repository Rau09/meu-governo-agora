import { useEffect, useRef, useState } from "react";
import { Hand, X, Play, Pause, RotateCcw, Volume2, Info } from "lucide-react";

/**
 * LibrasViewer: Player profissional de interpretação em Libras.
 * Preparado para receber vídeos reais de intérpretes humanos.
 */
export function LibrasViewer({ 
  mensagem, 
  onClose 
}: { 
  mensagem: string; 
  onClose: () => void;
}) {
  const [tocando, setTocando] = useState(false);
  const [velocidade, setVelocidade] = useState(1);
  const [progresso, setProgresso] = useState(0);
  const videoRef = useRef<HTMLDivElement>(null);

  // Simulação de progresso enquanto não temos o vídeo real
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (tocando) {
      interval = setInterval(() => {
        setProgresso((p) => (p >= 100 ? 0 : p + (1 * velocidade)));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [tocando, velocidade]);

  const resetar = () => {
    setProgresso(0);
    setTocando(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background animate-in fade-in duration-300">
      {/* Header Profissional */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Hand className="size-6" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">Libras</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Acessibilidade Cantu Conecta</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm active:scale-90 transition-transform"
        >
          <X className="size-5" />
        </button>
      </header>

      {/* Área do Player de Vídeo */}
      <main className="flex flex-1 flex-col items-center bg-[#1A1A1A] overflow-y-auto pb-12">
        <div className="w-full max-w-2xl px-4 pt-6">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-white/60">
            Veja esta informação em Libras
          </p>
          
          {/* Container do Vídeo (Proporção 9:16 ou 4:5 ideal para Libras) */}
          <div 
            ref={videoRef}
            className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl bg-[#2A2A2A] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center justify-center group"
          >
            {/* Estado de demonstração elegante (Placeholder para o vídeo real) */}
            <div className="flex flex-col items-center text-center px-12 space-y-4">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                <Hand className="size-10" />
              </div>
              <div>
                <p className="text-white font-bold text-lg uppercase tracking-tighter">VÍDEO DO INTÉRPRETE</p>
                <p className="text-white/40 text-sm leading-relaxed mt-2 font-medium">
                  intérprete humano real
                </p>
              </div>
              
              {/* Overlay de carregamento/progresso simulado */}
              {tocando && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20">
                  <div 
                    className="h-full bg-primary transition-all duration-100 ease-linear" 
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              )}
            </div>

            {/* Fundo Neutro de Alto Contraste (Simulado) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/20" />
          </div>

          {/* Área de Legenda e Texto Sincronizado */}
          <div className="mt-8 space-y-6">
            <div className="flex flex-col items-center gap-2">
               <div className="flex items-center gap-2">
                  <Info className="size-3 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Veja esta informação em Libras
                  </span>
               </div>
               <p className="text-2xl font-black text-white tracking-tighter uppercase text-center">
                 Sinal de: {mensagem.split(' ')[0]}
               </p>
            </div>
            
            <div className="rounded-[2.5rem] bg-white/5 p-8 border border-white/10 backdrop-blur-md">
              <p className="text-center text-lg font-medium leading-relaxed text-white/80">
                “{mensagem}”
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Barra de Controles Profissional */}
      <footer className="border-t border-white/10 bg-[#121212] px-6 py-8 pb-12">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          
          {/* Barra de Progresso */}
          <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden cursor-pointer group">
            <div 
              className="absolute h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Seletor de Velocidade */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/5 p-1">
              {[0.75, 1, 1.25].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVelocidade(v)}
                  className={`flex min-w-[54px] items-center justify-center rounded-xl py-2 text-[10px] font-black transition-all ${
                    velocidade === v ? "bg-primary text-primary-foreground shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {v}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
               <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white"
              >
                <Volume2 className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={resetar}
              className="flex size-14 items-center justify-center rounded-full bg-white/5 text-white/60 shadow-sm active:scale-95 transition-all hover:bg-white/10"
            >
              <RotateCcw className="size-6" />
            </button>
            
            <button
              type="button"
              onClick={() => setTocando((t) => !t)}
              className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] active:scale-95 transition-all"
            >
              {tocando ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current translate-x-0.5" />}
            </button>

            <div className="size-14" />
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Componente para acionar o visualizador de Libras.
 */
export function LibrasTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black text-primary transition-all hover:bg-primary/20 active:scale-95"
    >
      <Hand className="size-4" />
      <span>VER EM LIBRAS</span>
    </button>
  );
}
