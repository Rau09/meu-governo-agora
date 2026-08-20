-- 1. Enum para Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'cidadao');

-- 2. Tabela de Perfis
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    telefone TEXT,
    bairro TEXT,
    municipio TEXT DEFAULT 'Quedas do Iguaçu',
    estado TEXT DEFAULT 'PR',
    preferencias TEXT[] DEFAULT '{}',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Roles (Segurança Aprimorada)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'cidadao',
    UNIQUE (user_id, role)
);

-- 4. Tabela de Ocorrências
CREATE TABLE public.ocorrencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    foto_url TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    endereco TEXT,
    status TEXT NOT NULL DEFAULT 'recebido',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Agendamentos
CREATE TABLE public.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    area TEXT NOT NULL,
    servico TEXT NOT NULL,
    unidade TEXT NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    nome_paciente TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmado',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Grants de Acesso
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ocorrencias TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamentos TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 7. RLS e Funções de Segurança
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas: Perfis
CREATE POLICY "Usuários podem ver o próprio perfil"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Políticas: Ocorrências
CREATE POLICY "Qualquer um pode ver ocorrências públicas"
ON public.ocorrencias FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "Cidadão pode criar suas ocorrências"
ON public.ocorrencias FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gestor pode gerenciar todas as ocorrências"
ON public.ocorrencias FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'admin'));

-- Políticas: Agendamentos
CREATE POLICY "Cidadão vê apenas seus agendamentos"
ON public.agendamentos FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Cidadão cria seus agendamentos"
ON public.agendamentos FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gestor vê todos os agendamentos"
ON public.agendamentos FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'admin'));
