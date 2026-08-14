import { createFileRoute } from "@tanstack/react-router";
import { AppShell, TopBar } from "@/components/AppShell";
import { PawPrint, Heart, Camera, MapPin, AlertCircle, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/causa-animal")({
  component: CausaAnimalPage,
});

const animaisAdoção = [
  { id: 1, nome: "Bolinha", raca: "SRD", idade: "2 anos", img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop" },
  { id: 2, nome: "Mel", raca: "Labrador", idade: "4 meses", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop" },
  { id: 3, nome: "Thor", raca: "Pastor Alemão", idade: "3 anos", img: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100&h=100&fit=crop" },
];

function CausaAnimalPage() {
  return (
    <AppShell librasMensagem="Módulo Causa Animal: aqui você pode denunciar maus-tratos, registrar animais encontrados e adotar um novo amigo.">
      <TopBar titulo="Causa Animal" subtitulo="Cuidado e proteção aos animais." />
      
      <div className="px-5 py-6 space-y-8">
        <section>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/ocorrencia" className="flex flex-col gap-3 p-5 rounded-[2rem] bg-accent-gradient text-accent-foreground active:scale-95 transition-transform shadow-float">
              <Camera className="size-8" />
              <span className="font-bold text-sm">Registrar Ocorrência</span>
            </Link>
            <Link 
              to="/comunidade" 
              className="flex flex-col gap-3 p-5 rounded-[2rem] bg-secondary border border-border text-foreground active:scale-95 transition-transform"
            >
              <MapPin className="size-8 text-primary" />
              <span className="font-bold text-sm">Mapa Animal</span>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Para Adoção</h2>
            <Link to="/causa-animal" className="text-[10px] font-bold text-primary">Ver todos</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
            {animaisAdoção.map((pet) => (
              <div key={pet.id} className="min-w-[140px] snap-start rounded-[2rem] bg-card border border-border p-4 shadow-sm">
                <img src={pet.img} alt={pet.nome} className="size-20 rounded-2xl object-cover mb-3" />
                <p className="font-bold text-sm">{pet.nome}</p>
                <p className="text-[10px] text-muted-foreground">{pet.raca} · {pet.idade}</p>
                <Link to="/atendimento" className="mt-3 block text-center py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-bold active:scale-95 transition-transform">Quero Conhecer</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-[2rem] bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-3 mb-3 text-destructive">
            <AlertCircle className="size-6" />
            <h2 className="font-bold">Denúncia Urgente</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Viu um animal em perigo ou sofrendo maus-tratos? Registre agora para que a equipe possa intervir.
          </p>
          <Link to="/ocorrencia" className="flex items-center justify-center py-3 rounded-2xl bg-destructive text-white text-xs font-bold">
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
