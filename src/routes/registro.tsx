import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserRound, CheckCircle2, LogOut, ShieldCheck, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
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
} from "@/lib/city-store";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Criar Acesso Seguro — QI Cidadão" },
      {
        name: "description",
        content:
          "Cadastre-se com segurança no QI Cidadão: PIN protegido, validação de CPF e dados guardados apenas no seu aparelho.",
      },
      { property: "og:title", content: "Criar Acesso Seguro — QI Cidadão" },
      {
        property: "og:description",
        content: "Cadastro protegido por PIN de 6 dígitos para agendar serviços da Prefeitura de Quedas do Iguaçu.",
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
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", bairro: "" });
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarDados, setMostrarDados] = useState(false);

  /* ---- Já cadastrado e com sessão bloqueada: pede o PIN ---- */
  if (cidadao && !desbloqueado) {
    return <TelaPin onEntrar={desbloquear} onSair={sair} nome={cidadao.nome} />;
  }

  /* ---- Já cadastrado e desbloqueado ---- */
  if (cidadao) {
    return (
      <AppShell librasMensagem="Você já possui acesso criado. Seus dados aparecem protegidos nesta tela.">
        <TopBar titulo="Meu acesso" subtitulo="Cadastro protegido por PIN" />
        <div className="-mt-5 space-y-4 px-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <UserRound className="size-7" />
              </span>
              <div>
                <p className="font-display text-lg font-bold">{cidadao.nome}</p>
                <p className="text-xs text-muted-foreground">{cidadao.bairro || "Quedas do Iguaçu"}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground">CPF</dt>
                <dd className="font-medium">{mostrarDados ? cidadao.cpf : ocultarCpf(cidadao.cpf)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="font-medium">
                  {mostrarDados ? cidadao.telefone : ocultarTelefone(cidadao.telefone)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setMostrarDados((v) => !v)}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-xs font-semibold text-secondary-foreground"
            >
              {mostrarDados ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {mostrarDados ? "Ocultar dados" : "Mostrar dados completos"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/agendamento" })}
            className="min-h-14 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-card"
          >
            Agendar um atendimento
          </button>
          <button
            type="button"
            onClick={bloquear}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground"
          >
            <Lock className="size-4" /> Bloquear com PIN
          </button>
          <button
            type="button"
            onClick={sair}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-destructive"
          >
            <LogOut className="size-4" /> Apagar acesso deste aparelho
          </button>
        </div>
      </AppShell>
    );
  }

  /* ---- Cadastro ---- */
  async function enviar(e: React.FormEvent) {
    e.preventDefault();
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
      salt,
      pinHash: await hashPin(pin, salt),
      consentimentoEm: new Date().toISOString(),
    });
    setEnviando(false);
    navigate({ to: "/agendamento" });
  }

  return (
    <AppShell librasMensagem="Tela de cadastro seguro. Preencha seus dados e crie um PIN de 6 dígitos.">
      <TopBar titulo="Criar meu acesso" subtitulo="Cadastro seguro em menos de um minuto" />

      <form onSubmit={enviar} className="-mt-5 space-y-4 px-4">
        <div className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-card">
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
          <Campo
            label="Bairro"
            value={form.bairro}
            onChange={(v) => setForm({ ...form, bairro: v.slice(0, 60) })}
            placeholder="Centro"
          />
        </div>

        <div className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-card">
          <p className="flex items-center gap-2 text-xs font-bold text-primary">
            <KeyRound className="size-4" /> PIN de segurança
          </p>
          <p className="text-[11px] text-muted-foreground">
            Crie 6 dígitos para proteger seus dados. Ele é guardado apenas de forma criptografada.
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

        <label className="flex items-start gap-3 rounded-3xl bg-secondary p-4 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
            className="mt-0.5 size-5 accent-[hsl(var(--primary))]"
          />
          <span>
            Autorizo a Prefeitura de Quedas do Iguaçu a usar meus dados apenas para agendamentos e atendimento,
            conforme a LGPD.
          </span>
        </label>

        {erro && (
          <p role="alert" className="text-center text-xs font-semibold text-destructive">
            {erro}
          </p>
        )}

        <ul className="space-y-2 rounded-3xl bg-secondary p-4 text-xs text-muted-foreground">
          {[
            "CPF validado automaticamente",
            "PIN criptografado, nunca salvo em texto puro",
            "Dados ficam só neste aparelho",
          ].map((b) => (
            <li key={b} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" /> {b}
            </li>
          ))}
        </ul>

        <button
          type="submit"
          disabled={enviando}
          className="min-h-14 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-card disabled:opacity-60"
        >
          {enviando ? "Protegendo seus dados…" : "Criar meu acesso seguro"}
        </button>

        <p className="flex items-center justify-center gap-1 pb-4 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3" /> Seus dados ficam protegidos conforme a LGPD.
        </p>
      </form>
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
