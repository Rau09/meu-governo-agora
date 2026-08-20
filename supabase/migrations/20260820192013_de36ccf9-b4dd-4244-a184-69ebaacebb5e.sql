-- Habilitar UPDATE e DELETE para usuários autenticados na tabela de agendamentos
GRANT UPDATE, DELETE ON public.agendamentos TO authenticated;

-- Criar políticas de RLS para cancelamento e atualização pelo próprio dono
CREATE POLICY "Cidadão pode atualizar seus próprios agendamentos"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cidadão pode cancelar seus próprios agendamentos"
ON public.agendamentos
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);