import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserRound, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";
import { AppShell, TopBar } from "@/components/AppShell";
import { useCidadao } from "@/lib/city-store";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Criar Acesso — QI Cidadão" },
      {
        name: "description",
        content: "Cadastre-se no QI Cidadão para agendar serviços e acompanhar seus protocolos na Prefeitura de Quedas do Iguaçu.",
      },
      { property: "og:title", content: "Criar Acesso — QI Cidadão" },
      { property: "og:description", content: "Um cadastro rápido para usar todos os serviços da cidade pelo celular." },
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
  const { cidadao, salvar, sair } = useCidadao();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", bairro: "" });
  const [erro, setErro] = useState("");

  const valido =
    form.nome.trim().length > 3 &&
    form.cpf.replace(/\D/g, "").length === 11 &&
    form.telefone.replace(/\D/g, "").length >= 10;

  if (cidadao) {
    return (
      <AppShell librasMensagem="Você já possui acesso criado. Aqui estão seus dados de cadastro.">
        <TopBar titulo="Meu acesso" subtitulo="Cadastro ativo no QI Cidadão" />
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
                <dd className="font-medium">{cidadao.cpf}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="font-medium">{cidadao.telefone}</dd>
              </div>
            </dl>
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
            onClick={sair}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground"
          >
            <LogOut className="size-4" /> Sair da conta
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell librasMensagem="Tela de cadastro. Preencha nome, CPF, telefone e bairro para criar seu acesso.">
      <TopBar titulo="Criar meu acesso" subtitulo="Leva menos de um minuto" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valido) {
            setErro("Confira seu nome, CPF e telefone antes de continuar.");
            return;
          }
          salvar(form);
          navigate({ to: "/agendamento" });
        }}
        className="-mt-5 space-y-4 px-4"
      >
        <div className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-card">
          <Campo
            label="Nome completo"
            value={form.nome}
            onChange={(v) => setForm({ ...form, nome: v })}
            placeholder="Maria da Silva"
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
          />
          <Campo
            label="Bairro"
            value={form.bairro}
            onChange={(v) => setForm({ ...form, bairro: v })}
            placeholder="Centro"
          />
        </div>

        {erro && <p className="text-center text-xs font-semibold text-destructive">{erro}</p>}

        <ul className="space-y-2 rounded-3xl bg-secondary p-4 text-xs text-muted-foreground">
          {["Agendar sem fila", "Acompanhar protocolos", "Lembretes no WhatsApp"].map((b) => (
            <li key={b} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" /> {b}
            </li>
          ))}
        </ul>

        <button
          type="submit"
          className="min-h-14 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-card"
        >
          Criar meu acesso agora
        </button>

        <p className="flex items-center justify-center gap-1 pb-4 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3" /> Seus dados ficam protegidos conforme a LGPD.
        </p>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: "numeric" | "tel";
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...(inputMode ? { inputMode } : {})}
        className="mt-1 min-h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
      />
    </label>
  );
}
