
DO $$ BEGIN
    CREATE TYPE public.estoque_status AS ENUM ('disponivel', 'baixo', 'indisponivel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.unidades_saude (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    endereco text,
    tipo text DEFAULT 'UBS',
    criado_em timestamptz DEFAULT now()
);

GRANT SELECT ON public.unidades_saude TO authenticated;
GRANT ALL ON public.unidades_saude TO service_role;

ALTER TABLE public.unidades_saude ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Qualquer autenticado pode ver unidades" 
    ON public.unidades_saude FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.medicamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    descricao text,
    principio_ativo text,
    criado_em timestamptz DEFAULT now()
);

GRANT SELECT ON public.medicamentos TO authenticated;
GRANT ALL ON public.medicamentos TO service_role;

ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Qualquer autenticado pode ver catálogo de medicamentos" 
    ON public.medicamentos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.estoque_medicamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medicamento_id uuid REFERENCES public.medicamentos(id) ON DELETE CASCADE,
    unidade_id uuid REFERENCES public.unidades_saude(id) ON DELETE CASCADE,
    quantidade integer NOT NULL DEFAULT 0,
    ultima_atualizacao timestamptz DEFAULT now(),
    UNIQUE(medicamento_id, unidade_id)
);

GRANT SELECT ON public.estoque_medicamentos TO authenticated;
GRANT ALL ON public.estoque_medicamentos TO service_role;
GRANT UPDATE ON public.estoque_medicamentos TO authenticated;

ALTER TABLE public.estoque_medicamentos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Todos veem o estoque" 
    ON public.estoque_medicamentos FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Gestores podem atualizar estoque" 
    ON public.estoque_medicamentos FOR UPDATE TO authenticated 
    USING (public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.unidades_saude (nome, tipo) VALUES 
('Farmácia Municipal', 'Farmácia'),
('UBS Central', 'UBS'),
('UBS Bela Vista', 'UBS'),
('UBS São Francisco', 'UBS'),
('Centro Odontológico', 'Especializada')
ON CONFLICT (nome) DO NOTHING;

DO $$ 
DECLARE 
    m_id uuid;
    u_fm uuid;
    u_central uuid;
BEGIN
    SELECT id INTO u_fm FROM public.unidades_saude WHERE nome = 'Farmácia Municipal';
    SELECT id INTO u_central FROM public.unidades_saude WHERE nome = 'UBS Central';

    IF u_fm IS NOT NULL THEN
        INSERT INTO public.medicamentos (nome) VALUES ('Albendazol 400 mg') ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome RETURNING id INTO m_id;
        INSERT INTO public.estoque_medicamentos (medicamento_id, unidade_id, quantidade) VALUES (m_id, u_fm, 2163) ON CONFLICT DO NOTHING;

        INSERT INTO public.medicamentos (nome) VALUES ('Carvedilol 3,125 mg') ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome RETURNING id INTO m_id;
        INSERT INTO public.estoque_medicamentos (medicamento_id, unidade_id, quantidade) VALUES (m_id, u_fm, 27450) ON CONFLICT DO NOTHING;
    END IF;

    IF u_central IS NOT NULL THEN
        INSERT INTO public.medicamentos (nome) VALUES ('Dipirona 500mg') ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome RETURNING id INTO m_id;
        INSERT INTO public.estoque_medicamentos (medicamento_id, unidade_id, quantidade) VALUES (m_id, u_central, 420) ON CONFLICT DO NOTHING;
    END IF;
END $$;
