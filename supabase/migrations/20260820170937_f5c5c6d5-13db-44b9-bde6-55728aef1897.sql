-- 1. Tabela de Animais para Adoção
CREATE TABLE public.animais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    especie TEXT NOT NULL DEFAULT 'Cachorro', -- 'Cachorro', 'Gato', etc.
    raca TEXT,
    idade TEXT,
    porte TEXT, -- 'Pequeno', 'Médio', 'Grande'
    sexo TEXT, -- 'Macho', 'Fêmea'
    localizacao TEXT DEFAULT 'Quedas do Iguaçu, PR',
    vacinado BOOLEAN DEFAULT false,
    castrado BOOLEAN DEFAULT false,
    descricao TEXT,
    status TEXT DEFAULT 'disponivel', -- 'disponivel', 'adotado', 'pendente'
    fotos TEXT[] DEFAULT '{}',
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Permissões Animais
GRANT SELECT ON public.animais TO anon;
GRANT SELECT ON public.animais TO authenticated;
GRANT ALL ON public.animais TO service_role;

ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público aos animais disponíveis" 
ON public.animais FOR SELECT 
TO anon, authenticated
USING (status = 'disponivel');

CREATE POLICY "Gestores podem gerenciar animais" 
ON public.animais FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'admin'));

-- 2. Tabela de Ocorrências com Animais
CREATE TABLE public.ocorrencias_animais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    protocolo TEXT UNIQUE NOT NULL,
    categoria TEXT NOT NULL, -- 'Animal perdido', 'Animal encontrado', 'Animal ferido', 'Abandono', 'Maus-tratos'
    descricao TEXT NOT NULL,
    foto_url TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    endereco TEXT,
    status TEXT DEFAULT 'recebido', -- 'recebido', 'analise', 'execucao', 'resolvida'
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Permissões Ocorrências Animais
GRANT SELECT, INSERT ON public.ocorrencias_animais TO authenticated;
GRANT ALL ON public.ocorrencias_animais TO service_role;

ALTER TABLE public.ocorrencias_animais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cidadãos podem ver suas próprias ocorrências" 
ON public.ocorrencias_animais FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Cidadãos podem inserir ocorrências" 
ON public.ocorrencias_animais FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gestores podem ver todas as ocorrências de animais" 
ON public.ocorrencias_animais FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'admin'));

-- 3. Inserir dados iniciais de Animais (Exemplos reais para Quedas do Iguaçu)
INSERT INTO public.animais (nome, especie, raca, idade, porte, sexo, vacinado, castrado, descricao, fotos)
VALUES 
('Bolinha', 'Cachorro', 'SRD', '2 anos', 'Médio', 'Macho', true, true, 'Muito dócil e brincalhão. Resgatado próximo ao ginásio.', ARRAY['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80']),
('Mel', 'Cachorro', 'Labrador', '4 meses', 'Pequeno', 'Fêmea', true, false, 'Filhote cheia de energia. Ótima com crianças.', ARRAY['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80']),
('Thor', 'Cachorro', 'Pastor Alemão', '3 anos', 'Grande', 'Macho', true, true, 'Protetor e companheiro. Precisa de espaço.', ARRAY['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80']);
