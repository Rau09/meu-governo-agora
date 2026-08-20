import { createFileRoute } from "@tanstack/react-router";
import { AppShell, TopBar } from "@/components/AppShell";
import { PawPrint, Heart, Camera, MapPin, AlertCircle, Search, ShieldCheck, Check, X as XIcon, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAnimais, useOcorrenciasAnimais } from "@/lib/cantu-store";

export const Route = createFileRoute("/causa-animal")({
  component: CausaAnimalPage,
});

function CausaAnimalPage() {
  const animais = useAnimais();
  const { ocorrencias } = useOcorrenciasAnimais();

  return (
    <AppShell >
      <TopBar titulo="Causa Animal" subtitulo="Cuidado e proteção aos animais." />
      
      <div className="px-5 py-6 space-y-8 pb-10">
        <section>
          <div className="grid grid-cols-1">
            <Link to="/ocorrencia-animal" className="flex flex-col gap-3 p-5 rounded-[2rem] bg-accent-gradient text-accent-foreground active:scale-95 transition-transform shadow-float items-center text-center">
              <Camera className="size-8" />
              <span className="font-bold text-sm">Registrar Ocorrência</span>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Para Adoção</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 snap-x scrollbar-hide">
            {animais.map((pet) => (
              <div key={pet.id} className="min-w-[260px] snap-start rounded-[2.5rem] bg-card border border-border p-5 shadow-sm flex flex-col gap-4">
                <div className="relative">
                  <img 
                    src={pet.fotos[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop"} 
                    alt={pet.nome} 
                    className="w-full h-40 rounded-[1.5rem] object-cover" 
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[9px] font-black text-primary uppercase shadow-sm">
                    {pet.sexo}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{pet.nome}</h3>
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">{pet.idade}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{pet.raca || pet.especie} · {pet.porte}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-bold ${pet.vacinado ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {pet.vacinado ? <Check className="size-3" /> : <Info className="size-3" />}
                    Vacinação {pet.vacinado ? 'OK' : 'Pendente'}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-bold ${pet.castrado ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {pet.castrado ? <Check className="size-3" /> : <Info className="size-3" />}
                    Castração {pet.castrado ? 'OK' : 'Pendente'}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                   "{pet.descricao || 'Buscando um lar cheio de amor.'}"
                </p>

                <Link 
                  to="/atendimento" 
                  search={{ assunto: `adoção-${pet.nome}` }}
                  className="mt-2 block text-center py-3.5 rounded-[1.25rem] bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform shadow-sm"
                >
                  Quero Adotar
                </Link>
              </div>
            ))}
            {animais.length === 0 && (
               <div className="w-full p-8 text-center text-muted-foreground text-xs italic bg-secondary/30 rounded-[2rem] border border-dashed border-border">
                  Nenhum animal cadastrado no momento.
               </div>
            )}
          </div>
        </section>

        {ocorrencias.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Minhas Ocorrências</h2>
            </div>
            <div className="space-y-3">
              {ocorrencias.map((o) => (
                <div key={o.protocolo} className="p-4 rounded-2xl bg-card border border-border flex gap-3 shadow-sm">
                  <div className="size-10 rounded-xl bg-accent-soft text-accent-foreground flex items-center justify-center shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{o.categoria}</span>
                      <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">{o.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{o.descricao}</p>
                    <p className="text-[9px] font-medium text-muted-foreground/60 mt-1">{o.protocolo}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-3 mb-3 text-destructive">
            <AlertCircle className="size-6" />
            <h2 className="font-bold">Denúncia Urgente</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Viu um animal em perigo ou sofrendo maus-tratos? Registre agora para que a equipe possa intervir.
          </p>
          <Link to="/ocorrencia-animal" className="flex items-center justify-center py-3.5 rounded-2xl bg-destructive text-white text-xs font-bold shadow-sm active:scale-95 transition-transform">
            Denunciar agora
          </Link>
        </section>

        <section className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="size-6 text-primary" />
            <h2 className="font-bold text-primary">Quero Ajudar</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Seja um voluntário, ofereça lar temporário ou participe de nossas campanhas de arrecadação.
          </p>
          <Link 
            to="/atendimento" 
            className="flex items-center gap-2 text-sm font-bold text-primary active:scale-95 transition-transform"
          >
            Saber mais <Search className="size-4" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
