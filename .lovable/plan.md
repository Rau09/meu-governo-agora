# Plano de Resolução: Problemas na Funcionalidade de Agendamentos

Este plano descreve as correções para os problemas identificados na funcionalidade de agendamentos, focando em segurança, integridade de dados e experiência do usuário.

## 1. Correções no Backend (Supabase)

Para que o sistema funcione corretamente, precisamos ajustar as permissões das tabelas:

- **Permissões de Cancelamento**: Permitir que usuários autenticados excluam ou atualizem seus próprios agendamentos (atualmente bloqueado por `denied: DELETE, UPDATE`).
- **Políticas de RLS**: Garantir que o cidadão possa gerenciar apenas seus registros.

## 2. Lógica de Negócio e Integridade (Frontend & Store)

- **Prevenção de Conflitos**: Implementar uma verificação no `useAgendamentos` para impedir agendamentos no mesmo horário, data, unidade e serviço.
- **Robustez no Cancelamento**: Ajustar a função `cancelar` para refletir a mudança no banco de dados e garantir a sincronização entre o estado local e o remoto.
- **Tratamento de Erros**: Adicionar mensagens claras caso o agendamento falhe (ex: horário ocupado ou erro de rede).

## 3. Melhorias na Interface (UI/UX)

- **Feedback de Carregamento**: Adicionar um estado de `enviando` no botão de confirmação para evitar cliques duplos e dar feedback visual.
- **Validação Proativa**: Desabilitar horários que sabidamente já estão ocupados (opcional, dependendo da complexidade do fetch, mas faremos a validação no momento do envio inicialmente).
- **Tratamento de Estados**: Garantir que a lista de agendamentos seja atualizada imediatamente após a criação ou cancelamento.

## Detalhes Técnicos

1. **Migração SQL**:
   - `GRANT UPDATE, DELETE ON public.agendamentos TO authenticated;`
   - Atualizar políticas de RLS para `UPDATE` e `DELETE` baseadas em `auth.uid() = user_id`.
2. **Atualização do `src/lib/cantu-store.ts`**:
   - Refatorar `criar` para incluir a lógica de `checkConflict`.
   - Adicionar tratamento de erro `try/catch` nas chamadas ao Supabase.
3. **Ajustes em `src/routes/agendamento.tsx`**:
   - Implementar o estado de `loading`.
   - Exibir alertas de erro amigáveis usando o componente de toast ou mensagem de erro local.

---

Este plano foca na estabilidade técnica sem alterar o design "mobile-first" e institucional do NexLine.
