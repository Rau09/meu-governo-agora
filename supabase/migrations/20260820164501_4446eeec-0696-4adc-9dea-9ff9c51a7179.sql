-- 1. Corrigir permissões da função has_role (Revogar public/authenticated e manter apenas o uso interno via RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

-- 2. Adicionar política para user_roles (que estava com RLS ativado mas sem política no linter)
CREATE POLICY "Usuários podem ver suas próprias roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Gestores podem ver todas as roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'gestor') OR public.has_role(auth.uid(), 'admin'));
