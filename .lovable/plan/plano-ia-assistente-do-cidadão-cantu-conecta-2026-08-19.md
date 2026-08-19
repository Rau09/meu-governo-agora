# Plano: IA Assistente do Cidadão - Cantu Conecta

Transformar o chatbot atual em um "Assistente do Cidadão" inteligente, proativo e integrado, capaz de realizar ações e fornecer respostas visuais detalhadas sobre os serviços municipais de Quedas do Iguaçu.

## 1. Interface Visual e Moderna (src/routes/atendimento.tsx)
- **Design de Mensagens:** Substituir balões de texto simples por cards interativos.
- **Sugestões Contextuais:** Adicionar botões de ação rápida (💊 Remédios, 🏥 Saúde, 📍 Problemas, 🐾 Causa Animal).
- **Indicadores de Ação:** Exibir estados de "Consultando sistema..." para transparência.
- **Acesso Flutuante:** Garantir que o assistente seja acessível via botão flutuante em telas estratégicas.

## 2. IA que Toma Ação (src/lib/cantu-ia.ts)
- **Integração com Medicamentos:** Ao perguntar por um remédio, a IA deve retornar um card com estoque real, unidades disponíveis e data de atualização.
- **Fluxo de Ocorrências:** Criar um diálogo guiado para registro de problemas (tipo, localização, foto) que resulte em um protocolo real.
- **Consulta de Protocolos:** A IA deve listar automaticamente as solicitações do usuário e seu status atualizado.
- **Contexto Municipal:** Refinar o vocabulário para termos específicos de Quedas do Iguaçu e da região Cantuquiriguaçu.

## 3. Personalidade e Naturalidade
- **Tom Amigável:** Linguagem prestativa, mas clara sobre ser uma inteligência artificial.
- **Memória de Curto Prazo:** Manter o contexto durante a conversa para evitar perguntas repetitivas.
- **Escalonamento:** Oferecer contato humano ou links para órgãos responsáveis quando a IA não souber a resposta.

## Detalhes Técnicos
- Refatorar `src/lib/cantu-ia.ts` para retornar estruturas de dados complexas (objetos de ação, listas de itens).
- Atualizar `src/routes/atendimento.tsx` para renderizar componentes dinâmicos com base no tipo de resposta da IA.
- Implementar transições suaves entre o chat e as funcionalidades do app (ex: abrir mapa ou câmera).

---
Este plano eleva a IA de um simples FAQ para um núcleo operacional de serviços públicos digitais.
