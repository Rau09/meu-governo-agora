# Plano de Melhoria: Causa Animal (NexLine)

Aprimorar a funcionalidade de Causa Animal no NexLine, implementando dados reais para adoção e um fluxo estruturado de ocorrências, mantendo o design atual e a segurança dos dados.

## Alterações de Banco de Dados (Supabase)

1.  **Novas Tabelas**:
    *   `public.animais`: Cadastro de animais para adoção (nome, idade, porte, sexo, localização, vacinação, castração, descrição, status, fotos).
    *   `public.ocorrencias_animais`: Registro de problemas envolvendo animais (foto, descrição, categoria, localização/GPS, status).
2.  **Segurança (RLS)**:
    *   Políticas para leitura pública de animais disponíveis.
    *   Políticas para cidadãos verem apenas suas ocorrências.
    *   Grants para `authenticated` e `service_role`.

## Backend & Store (`src/lib/cantu-store.ts`)

1.  **Tipos e Hooks**:
    *   Adicionar tipos `Animal` e `OcorrenciaAnimal`.
    *   Criar `useAnimais` para buscar dados do banco.
    *   Criar `useOcorrenciasAnimais` com função `registrar`.
2.  **Integração**:
    *   Vincular o fluxo de "Causa Animal / Maus-tratos" da tela de ocorrências urbanas à nova estrutura, se aplicável, ou criar um fluxo específico.

## Interface (Frontend)

1.  **Tela de Causa Animal (`src/routes/causa-animal.tsx`)**:
    *   Substituir dados estáticos por dinâmicos (`useAnimais`).
    *   Aprimorar cards com as novas informações (vacinação, castração, etc.).
    *   Implementar filtros ou busca se necessário (sem redesign).
2.  **Fluxo de Ocorrências**:
    *   Garantir que o registro de "Animal Perdido", "Maus-tratos", etc., siga a mesma arquitetura segura de problemas urbanos, salvando fotos no Storage.

## Verificação Técnica

1.  **Migração**: Testar criação de tabelas e inserção de dados iniciais.
2.  **Permissões**: Validar que um usuário não vê ocorrências de outro.
3.  **Fluxo de Mídia**: Confirmar upload de fotos para o bucket de animais/ocorrências.
