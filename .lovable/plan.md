# Plano de Implementação: Fluxo Real de Ocorrências NexLine

O objetivo é transformar a funcionalidade de "Problemas" (ocorrências) em um fluxo robusto, persistindo dados no Supabase e permitindo o acompanhamento detalhado pelo cidadão, sem alterar o design visual existente.

## Alterações Sugeridas

### Backend (Supabase)

- **Storage**: Criar o bucket `ocorrencias` no Supabase Storage para armazenar as fotos enviadas pelos cidadãos.
- **Tabela `ocorrencias`**: A tabela já existe, mas garantiremos que as políticas de RLS permitam:
  - Cidadãos: Inserir suas próprias e Ver todas (conforme política atual).
  - Gestores: Acesso total.

### Frontend

- **Armazenamento de Imagens**: Implementar lógica para fazer upload da foto para o Supabase Storage antes de salvar o registro na tabela `ocorrencias`.
- **Estados de UI**:
  - Adicionar indicadores de carregamento durante o upload/envio.
  - Exibir mensagens claras de sucesso ou erro.
  - Tratamento de falta de conexão e indisponibilidade de GPS.
- **Fluxo de Acompanhamento**:
  - Atualizar a visualização de "Minhas Ocorrências" para refletir os novos status do fluxo (`recebido`, `analise`, `andamento`, `resolvido`).
  - Filtrar informações administrativas sensíveis da visão do cidadão.

### Segurança e Privacidade

- Garantir que o `user_id` seja associado corretamente à ocorrência via RLS.
- Impedir que cidadãos visualizem logs internos ou campos restritos à gestão.

## Detalhes Técnicos

- **Supabase Client**: Uso da integração existente para chamadas de banco e storage.
- **GPS**: Uso da API de Geolocalização do navegador com fallback para entrada manual.
- **Tradução de Status**: Mapeamento dos status internos para rótulos amigáveis ao cidadão.

---

Este plano foca exclusivamente na funcionalidade de ocorrências, respeitando a regra de não alterar outras áreas do NexLine.
