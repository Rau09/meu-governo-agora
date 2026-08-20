-- Revogar permissão de execução de 'anon' explicitamente para garantir que o linter pare de reclamar
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
