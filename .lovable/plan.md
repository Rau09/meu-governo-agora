# Plano de Reintrodução da Acessibilidade em Libras (Sinalize)

Reintrodução completa do sistema de acessibilidade em Libras sob a marca "Sinalize", com foco em interface profissional, avatar 2D humanoide bald articulado e controles de reprodução, integrando com o assistente Cantu IA.

## Mudanças

### Core & Logic
- **Novo Tradutor de Libras**: Criar `src/lib/libras-translator.ts` para gerenciar o estado da tradução, dicionário de sinais (com glossário) e lógica de soletração.
- **Integração IA**: Atualizar `src/lib/cantu-ia.ts` para incluir a ação `Ver em Libras` nas respostas, permitindo que o usuário acione o intérprete diretamente do chat.

### Componentes de UI
- **Widget Sinalize**: Criar `src/components/LibrasAvatar.tsx` contendo:
  - **Avatar Humanoide 2D**: Personagem bald (careca), com roupa azul (#3B82F6), braços e mãos articulados (5 dedos) sobre um fundo de alto contraste.
  - **Player de Sinais**: Lógica de animação dos braços e mãos baseada no glossário.
  - **Controles**: Botões de Play, Pause, Repeat e Seletor de Velocidade (0.75x a 1.25x).
  - **Legendas**: Exibição sincronizada do texto sendo interpretado.
- **Botão Flutuante (FAB)**: Atualizar `src/components/AppShell.tsx` para incluir o botão de acesso universal à acessibilidade, flutuante e móvel.

### Experiência do Usuário
- O botão flutuante abre o modal do "Sinalize".
- No chat de atendimento, respostas longas ganham um botão "[🤟 Ver em Libras]".
- O avatar executa os sinais de forma fluida, permitindo pausar e ajustar a velocidade para melhor compreensão.

## Detalhes Técnicos
- O avatar usará SVG para garantir nitidez e leveza, com `framer-motion` para as animações dos membros.
- O dicionário inicial contará com sinais básicos e suporte a datilologia (soletração) para palavras desconhecidas.
- A interface seguirá os padrões de acessibilidade do Governo do Paraná (Hand Talk style), focando em tons de azul e alto contraste.
