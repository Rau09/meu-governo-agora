-- Migration to seed initial Health and Medicine data
-- Based on real structure from Quedas do Iguaçu (Dec 2025 context)

-- 1. Seed Unidades de Saúde
INSERT INTO public.unidades_saude (nome, tipo, endereco) VALUES
('UBS Central', 'UBS', 'Av. Tarumã, 500 - Centro'),
('UBS Bela Vista', 'UBS', 'Rua das Palmeiras, 120 - Bela Vista'),
('UBS São Francisco', 'UBS', 'Rua São Paulo, 88 - São Francisco'),
('Centro Odontológico', 'Especialidade', 'Rua Juazeiro, 45 - Centro'),
('Farmácia Municipal', 'Farmácia', 'Rua Juazeiro, 123 - Centro')
ON CONFLICT DO NOTHING;

-- 2. Seed Medicamentos
INSERT INTO public.medicamentos (nome, principio_ativo, descricao) VALUES
('Losartana 50 mg', 'Losartana Potássica', 'Anti-hipertensivo'),
('Albendazol 400 mg', 'Albendazol', 'Anti-helmíntico'),
('Carvedilol 3,125 mg', 'Carvedilol', 'Beta-bloqueador'),
('Amoxicilina 250 mg/5 ml', 'Amoxicilina', 'Antibiótico'),
('Levotiroxina 100 mcg', 'Levotiroxina Sódica', 'Hormônio tireoidiano'),
('Dipirona 500mg', 'Dipirona Monoidratada', 'Analgésico e antitérmico'),
('Paracetamol 750mg', 'Paracetamol', 'Analgésico')
ON CONFLICT DO NOTHING;

-- 3. Seed Estoque
DO $$
DECLARE
    ubs_central_id UUID;
    farmacia_mun_id UUID;
    losartana_id UUID;
    albendazol_id UUID;
    carvedilol_id UUID;
    dipirona_id UUID;
BEGIN
    SELECT id INTO ubs_central_id FROM public.unidades_saude WHERE nome = 'UBS Central' LIMIT 1;
    SELECT id INTO farmacia_mun_id FROM public.unidades_saude WHERE nome = 'Farmácia Municipal' LIMIT 1;
    
    SELECT id INTO losartana_id FROM public.medicamentos WHERE nome = 'Losartana 50 mg' LIMIT 1;
    SELECT id INTO albendazol_id FROM public.medicamentos WHERE nome = 'Albendazol 400 mg' LIMIT 1;
    SELECT id INTO carvedilol_id FROM public.medicamentos WHERE nome = 'Carvedilol 3,125 mg' LIMIT 1;
    SELECT id INTO dipirona_id FROM public.medicamentos WHERE nome = 'Dipirona 500mg' LIMIT 1;

    INSERT INTO public.estoque_medicamentos (medicamento_id, unidade_id, quantidade) VALUES
    (losartana_id, ubs_central_id, 450),
    (losartana_id, farmacia_mun_id, 1200),
    (albendazol_id, farmacia_mun_id, 2163),
    (carvedilol_id, farmacia_mun_id, 25), 
    (dipirona_id, ubs_central_id, 0)      
    ON CONFLICT DO NOTHING;
END $$;

-- 4. Seed Serviços Municipais (Saúde)
INSERT INTO public.servicos_municipais (slug, nome, cor_classe, servicos, unidades) VALUES
('saude', 'Saúde', 'text-success', 
 ARRAY['Consulta clínico geral', 'Consulta odontológica', 'Vacinação', 'Exames laboratoriais', 'Consulta pediátrica', 'Saúde da mulher'],
 ARRAY['UBS Central', 'UBS Bela Vista', 'UBS São Francisco', 'Centro Odontológico'])
ON CONFLICT (slug) DO UPDATE SET 
    servicos = EXCLUDED.servicos,
    unidades = EXCLUDED.unidades;
