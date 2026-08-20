# Plano de Implementação: Separação Segura de Contextos (Cidadão vs. Gestão)

Este plano descreve a implementação de uma estrutura de segurança robusta no backend (Lovable Cloud) para garantir que cidadãos acessem apenas seus próprios dados e que o painel de gestão seja restrito a usuários autorizados, preservando toda a funcionalidade e o design existentes.

## 1. Estrutura de Dados e Perfis
Criar a infraestrutura necessária para identificar e separar os usuários.

- **Tabela `profiles`**: Armazenar informações do perfil e o papel (`role`) do usuário ('cidadão' ou 'gestor').
- **Migração de Dados**: Garantir que as tabelas existentes (`agendamentos`, `ocorrencias`) possam ser associadas a um `user_id` autenticado.

## 2. Segurança no Banco de Dados (RLS)
Implementar Row Level Security (RLS) para proteção real dos dados.

- **Políticas para Cidadãos**:
    - `profiles`: Podem ler e atualizar apenas o próprio perfil.
    - `agendamentos`: Podem ler e criar apenas seus próprios agendamentos.
    - `ocorrencias`: Podem ler ocorrências públicas e criar as suas próprias; podem ler detalhes apenas das suas.
- **Políticas para Gestores**:
    - Acesso total ou restrito por área às tabelas de gestão (agendamentos de todos, todas as ocorrências).

## 3. Autenticação e Fluxo de Acesso
Ajustar o frontend para utilizar a autenticação do Lovable Cloud.

- **Login do Cidadão**: Integrar com o sistema de autenticação (Email/Senha e Google).
- **Login da Gestão**: Proteger a rota `/gestao` com verificação de `role` no servidor/banco, não apenas com a senha estática atual.
- **Middleware**: Garantir que as funções do servidor anexem o token de autenticação.

## 4. Preservação e Testes
- **Redesign ZERO**: Nenhuma interface será alterada visualmente.
- **Compatibilidade**: O modo "Offline/Simulado" atual será mantido como fallback ou migrado gradualmente para persistência real, sem quebrar a experiência do usuário.
- **Validação**: Testar se um cidadão logado consegue (ou não) acessar dados de outro via API.

---

### Detalhes Técnicos

1. **Nova Tabela `user_roles`**: Seguindo as melhores práticas de segurança para evitar escalada de privilégios.
2. **Função `has_role`**: Função `security definer` para checagem segura de permissões em políticas RLS.
3. **Migração SQL**: 
   - `CREATE TABLE public.profiles (...)`
   - `CREATE TABLE public.user_roles (...)`
   - `GRANT` de permissões para as roles `authenticated` e `service_role`.
   - Ativação de RLS e criação de políticas `USING (auth.uid() = user_id)`.
4. **Integração Frontend**: Atualização do `src/lib/cantu-store.ts` para sincronizar o estado local com o Supabase quando o usuário estiver autenticado.
