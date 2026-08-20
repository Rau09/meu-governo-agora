INSERT INTO public.profiles (id, nome, cpf, telefone)
VALUES ('502442c1-ef56-4a0b-a8bb-3017468290c5', 'Gestor Municipal', '000.000.000-00', '(45) 99999-9999')
ON CONFLICT (id) DO NOTHING;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;