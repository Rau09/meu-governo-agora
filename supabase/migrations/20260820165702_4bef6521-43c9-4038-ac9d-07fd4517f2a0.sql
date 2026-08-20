CREATE TABLE IF NOT EXISTS public.ocorrencias (
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ocorrencias TO authenticated;
GRANT ALL ON public.ocorrencias TO service_role;

ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Qualquer um pode ver ocorrências públicas" ON public.ocorrencias;
    CREATE POLICY "Qualquer um pode ver ocorrências públicas"
    ON public.ocorrencias FOR SELECT TO authenticated
    USING (TRUE);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Cidadão pode criar suas ocorrências" ON public.ocorrencias;
    CREATE POLICY "Cidadão pode criar suas ocorrências"
    ON public.ocorrencias FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Gestor pode gerenciar todas as ocorrências" ON public.ocorrencias;
    CREATE POLICY "Gestor pode gerenciar todas as ocorrências"
    ON public.ocorrencias FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;
