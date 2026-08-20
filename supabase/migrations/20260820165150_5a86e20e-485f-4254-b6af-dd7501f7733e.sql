
CREATE TABLE IF NOT EXISTS public.servicos_municipais (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    nome text NOT NULL,
    cor_classe text NOT NULL,
    servicos text[] NOT NULL,
    unidades text[] NOT NULL,
    criado_em timestamptz DEFAULT now()
);

GRANT SELECT ON public.servicos_municipais TO authenticated;
GRANT ALL ON public.servicos_municipais TO service_role;

ALTER TABLE public.servicos_municipais ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Todos veem servicos" 
    ON public.servicos_municipais FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.servicos_municipais (slug, nome, cor_classe, servicos, unidades) VALUES 
('saude', 'Saúde', 'text-success', 
 ARRAY['Consulta clínico geral', 'Consulta odontológica', 'Vacinação', 'Exames laboratoriais', 'Consulta pediátrica', 'Saúde da mulher'],
 ARRAY['UBS Central', 'UBS Bela Vista', 'UBS São Francisco', 'Centro Odontológico']),
('educacao', 'Educação', 'text-primary', 
 ARRAY['Matrícula escolar', 'Vaga em creche', 'Transporte escolar', 'Reunião pedagógica', 'Solicitação de histórico'],
 ARRAY['Secretaria de Educação', 'Escola Municipal Centro', 'CMEI Girassol']),
('urbanos', 'Serviços Urbanos', 'text-accent', 
 ARRAY['Coleta de entulho', 'Iluminação pública', 'Tapa-buraco', 'Poda de árvore', 'Limpeza de terreno'],
 ARRAY['Secretaria de Obras', 'Garagem Municipal']),
('cidadania', 'Cidadania e Tributos', 'text-primary', 
 ARRAY['Segunda via de IPTU', 'Alvará de funcionamento', 'Assistência social', 'Protocolo geral'],
 ARRAY['Paço Municipal', 'CRAS Quedas do Iguaçu'])
ON CONFLICT (slug) DO NOTHING;
