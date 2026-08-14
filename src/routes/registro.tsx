import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  UserRound, CheckCircle2, LogOut, ShieldCheck, Lock, 
  Eye, EyeOff, KeyRound, MapPin, Phone, CreditCard, 
  User, ArrowRight, ArrowLeft 
} from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import {
  forcaPin,
  gerarSalt,
  hashPin,
  lerTentativas,
  ocultarCpf,
  ocultarTelefone,
  registrarErroPin,
  useCidadao,
  validarCpf,
  validarTelefone,
  MUNICIPIOS_CANTU,
} from "@/lib/cantu-store";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Criar Acesso Seguro — Cantu Conecta" },
      {
        name: "description",
        content:
          "Cadastre-se com segurança no Cantu Conecta: PIN protegido, validação de CPF e dados guardados apenas no seu aparelho.",
      },
      { property: "og:title", content: "Criar Acesso Seguro — Cantu Conecta" },
      {
        property: "og:description",
        content: "Cadastro protegido por PIN de 6 dígitos para agendar serviços públicos na região Cantuquiriguaçu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Registro,
});

function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascaraTel(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function Registro() {
  const { cidadao, desbloqueado, salvar, sair, desbloquear, bloquear } = useCidadao();
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState({ 
    nome: "", 
    cpf: "", 
    telefone: "", 
    bairro: "", 
    municipio: MUNICIPIOS_CANTU[MUNICIPIOS_CANTU.indexOf("Quedas do Iguaçu")] || MUNICIPIOS_CANTU[0], 
    estado: "Paraná",
    preferencias: [] as string[]
  });
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarDados, setMostrarDados] = useState(false);

  if (cidadao && !desbloqueado) {
    return <TelaPin onEntrar={desbloquear} onSair={sair} nome={cidadao.nome} />;
  }

  if (cidadao) {
    return (
      <AppShell librasMensagem="Você já possui acesso criado. Seus dados aparecem protegidos nesta tela.">
        <TopBar titulo="Meu acesso" subtitulo="Cadastro protegido por PIN" />
        <div className="-mt-5 space-y-4 px-4">
          <div className="rounded-[2.5rem] border border-border bg-card p-6 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="size-24" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-gradient text-white shadow-lg">
                <UserRound className="size-7" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">{cidadao.nome}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3" /> {cidadao.municipio || "Cantuquiriguaçu"} · {cidadao.bairro}
                </p>
              </div>
            </div>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <dt className="text-muted-foreground flex items-center gap-2 text-xs uppercase tracking-wider font-bold">
                   <CreditCard className="size-3" /> CPF
                </dt>
                <dd className="font-mono font-bold text-base">{mostrarDados ? cidadao.cpf : ocultarCpf(cidadao.cpf)}</dd>
              </div>
              <div className="flex justify-between items-center pb-1">
                <dt className="text-muted-foreground flex items-center gap-2 text-xs uppercase tracking-wider font-bold">
                  <Phone className="size-3" /> WhatsApp
                </dt>
                <dd className="font-bold text-base">
                  {mostrarDados ? cidadao.telefone : ocultarTelefone(cidadao.telefone)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setMostrarDados((v) => !v)}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-xs font-bold text-primary active:scale-95 transition-transform"
            >
              {mostrarDados ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {mostrarDados ? "Ocultar dados" : "Ver dados completos"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/saude" })}
              className="min-h-14 w-full rounded-[2rem] bg-primary text-sm font-bold text-primary-foreground shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              Acessar Serviços
            </button>
            <button
              type="button"
              onClick={bloquear}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-sm font-bold text-muted-foreground active:scale-95 transition-transform"
            >
              <Lock className="size-4" /> Bloquear Acesso
            </button>
            <button
              type="button"
              onClick={sair}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-xs font-bold text-destructive/70 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" /> Apagar deste dispositivo
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ---- Cadastro ---- */
  async function enviar() {
    if (form.nome.trim().split(/\s+/).length < 2) {
      setErro("Informe seu nome completo (nome e sobrenome).");
      return;
    }
    if (!validarCpf(form.cpf)) {
      setErro("CPF inválido. Confira os números digitados.");
      return;
    }
    if (!validarTelefone(form.telefone)) {
      setErro("Telefone inválido. Use DDD + número.");
      return;
    }
    const problemaPin = forcaPin(pin);
    if (problemaPin) {
      setErro(problemaPin);
      return;
    }
    if (pin !== pin2) {
      setErro("Os PINs digitados não são iguais.");
      return;
    }
    if (!aceite) {
      setErro("É preciso aceitar o uso dos dados conforme a LGPD.");
      return;
    }
    
    setErro("");
    setEnviando(true);
    const salt = gerarSalt();
    salvar({
      nome: form.nome.trim().slice(0, 80),
      cpf: form.cpf,
      telefone: form.telefone,
      bairro: form.bairro.trim().slice(0, 60),
      municipio: form.municipio,
      estado: form.estado,
      preferencias: form.preferencias,
      salt,
      pinHash: await hashPin(pin, salt),
      consentimentoEm: new Date().toISOString(),
    });
    setEnviando(false);
    navigate({ to: "/saude" });
  }

  return (
    <AppShell librasMensagem={`Passo ${passo} de 4: Preencha seus dados para criar seu acesso seguro.`}>
      <TopBar 
        titulo="Criar meu acesso" 
        subtitulo={`Passo ${passo} de 4 — ${passo === 1 ? 'Identificação' : passo === 2 ? 'Localização' : passo === 3 ? 'Segurança' : 'Privacidade'}`} 
      />

      <div className="-mt-5 px-4 pb-10">
        {/* Progress Bar */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= passo ? 'bg-primary' : 'bg-secondary'
              }`} 
            />
          ))}
        </div>

        <div className="rounded-[2.5rem] border border-border bg-card p-6 shadow-card min-h-[300px] flex flex-col">
          {passo === 1 && (
            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-primary mb-2">
                <User className="size-6" />
                <h2 className="font-bold text-lg">Quem é você?</h2>
              </div>
              <Campo
                label="Nome completo"
                value={form.nome}
                onChange={(v) => setForm({ ...form, nome: v.slice(0, 80) })}
                placeholder="Maria da Silva"
                autoComplete="name"
              />
              <Campo
                label="CPF"
                value={form.cpf}
                onChange={(v) => setForm({ ...form, cpf: mascaraCpf(v) })}
                placeholder="000.000.000-00"
                inputMode="numeric"
              />
              <Campo
                label="WhatsApp"
                value={form.telefone}
                onChange={(v) => setForm({ ...form, telefone: mascaraTel(v) })}
                placeholder="(46) 90000-0000"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-primary mb-2">
                <MapPin className="size-6" />
                <h2 className="font-bold text-lg">Onde você mora?</h2>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Município</span>
                <select
                  value={form.municipio}
                  onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                  className="mt-1 min-h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  {MUNICIPIOS_CANTU.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <Campo
                label="Bairro / Comunidade"
                value={form.bairro}
                onChange={(v) => setForm({ ...form, bairro: v.slice(0, 60) })}
                placeholder="Ex: Centro"
              />
              <button
                type="button"
                onClick={() => {
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      // In a real app we'd reverse geocode. 
                      // For now, we'll just give a feedback.
                      setErro("Localização capturada com sucesso!");
                      setTimeout(() => setErro(""), 2000);
                    });
                  }
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-sm font-semibold active:scale-[0.98]"
              >
                <MapPin className="size-4 text-primary" /> Usar minha localização
              </button>
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-start gap-3">
                <ShieldCheck className="size-5 text-success mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Esses dados ajudam a prefeitura a planejar serviços específicos para a sua região na Cantuquiriguaçu.
                </p>
              </div>
            </div>
          )}

          {passo === 3 && (
            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Lock className="size-6" />
                <h2 className="font-bold text-lg">Segurança Digital</h2>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Crie um PIN de 6 dígitos para proteger seus dados. Ele é guardado de forma criptografada apenas neste aparelho.
              </p>
              <Campo
                label="Criar PIN (6 dígitos)"
                value={pin}
                onChange={(v) => setPin(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
                secreto
              />
              <Campo
                label="Repetir PIN"
                value={pin2}
                onChange={(v) => setPin2(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
                secreto
              />
            </div>
          )}

          {passo === 4 && (
            <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-primary mb-2">
                <ShieldCheck className="size-6" />
                <h2 className="font-bold text-lg">Preferências & Privacidade</h2>
              </div>
              
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Desejo receber alertas de:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Consultas", "Vacinação", "Obras", "Causa Animal"
                  ].map(pref => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => {
                        const current = form.preferencias;
                        setForm({
                          ...form,
                          preferencias: current.includes(pref) 
                            ? current.filter(p => p !== pref)
                            : [...current, pref]
                        });
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                        form.preferencias.includes(pref)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground"
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-secondary p-5 text-xs text-muted-foreground border border-border cursor-pointer active:scale-[0.98] transition-transform">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(e) => setAceite(e.target.checked)}
                  className="mt-0.5 size-5 accent-[hsl(var(--primary))]"
                />
                <span className="leading-relaxed">
                  Autorizo o uso dos meus dados para fins de agendamento e serviços públicos na região Cantuquiriguaçu, conforme a LGPD.
                </span>
              </label>

              <div className="space-y-3">
                {[
                  "Dados criptografados de ponta a ponta",
                  "Privacidade garantida por padrão",
                  "Exclusão de dados a qualquer momento",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="size-4 text-success shrink-0" /> {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {erro && (
            <p role="alert" className="mt-4 text-center text-xs font-bold text-destructive animate-bounce">
              {erro}
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-3">
            {passo > 1 && (
              <button
                type="button"
                onClick={() => {
                  setPasso(passo - 1);
                  setErro("");
                }}
                className="size-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
              >
                <ArrowLeft className="size-6" />
              </button>
            )}
            
            <button
              type="button"
              disabled={enviando}
              onClick={() => {
                if (passo < 4) {
                  // Basic validation before moving forward
                  if (passo === 1 && (!form.nome || !form.cpf || !form.telefone)) {
                    setErro("Preencha todos os campos para continuar.");
                    return;
                  }
                  if (passo === 2 && !form.bairro) {
                    setErro("Informe seu bairro ou comunidade.");
                    return;
                  }
                  if (passo === 3 && (pin.length < 6 || pin !== pin2)) {
                    setErro(pin.length < 6 ? "O PIN deve ter 6 dígitos." : "Os PINs não conferem.");
                    return;
                  }
                  setErro("");
                  setPasso(passo + 1);
                } else {
                  enviar();
                }
              }}
              className="flex-1 min-h-14 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {passo < 4 ? (
                <>Próximo Passo <ArrowRight className="size-5" /></>
              ) : (
                enviando ? "Processando..." : "Concluir Cadastro"
              )}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
          Cantu Conecta · Cidadania Digital
        </p>
      </div>
    </AppShell>
  );
}

function TelaPin({
  onEntrar,
  onSair,
  nome,
}: {
  onEntrar: (pin: string) => Promise<boolean>;
  onSair: () => void;
  nome: string;
}) {
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");
  const [bloqueadoAte, setBloqueadoAte] = useState(() => lerTentativas().bloqueadoAte);
  const bloqueado = bloqueadoAte > Date.now();

  return (
    <AppShell librasMensagem="Digite seu PIN de 6 dígitos para acessar seus dados.">
      <TopBar titulo="Acesso protegido" subtitulo={`Olá, ${nome.split(" ")[0]}`} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (bloqueado) return;
          if (await onEntrar(pin)) {
            setErro("");
            return;
          }
          const t = registrarErroPin();
          setBloqueadoAte(t.bloqueadoAte);
          setPin("");
          setErro(
            t.bloqueadoAte > Date.now()
              ? "Muitas tentativas. Aguarde 5 minutos."
              : `PIN incorreto. Restam ${5 - t.erros} tentativas.`,
          );
        }}
        className="-mt-5 space-y-4 px-4"
      >
        <div className="space-y-3 rounded-3xl border border-border bg-card p-5 text-center shadow-card">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Lock className="size-7" />
          </span>
          <p className="text-xs text-muted-foreground">Digite seu PIN de 6 dígitos</p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            type="password"
            autoComplete="off"
            placeholder="••••••"
            disabled={bloqueado}
            className="mx-auto min-h-14 w-40 rounded-2xl border border-input bg-background text-center text-2xl tracking-[0.4em] outline-none focus:border-primary disabled:opacity-50"
          />
          {erro && <p className="text-xs font-semibold text-destructive">{erro}</p>}
        </div>
        <button
          type="submit"
          disabled={bloqueado || pin.length !== 6}
          className="min-h-14 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60"
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={onSair}
          className="min-h-12 w-full rounded-2xl text-sm font-semibold text-destructive"
        >
          Esqueci meu PIN — apagar e cadastrar de novo
        </button>
      </form>
    </AppShell>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
  secreto,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: "numeric" | "tel";
  autoComplete?: string;
  secreto?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={secreto ? "password" : "text"}
        {...(inputMode ? { inputMode } : {})}
        {...(autoComplete ? { autoComplete } : {})}
        className="mt-1 min-h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
      />
    </label>
  );
}
