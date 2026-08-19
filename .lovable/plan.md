# Plano: Implementação do Bot de Libras com Avatar 3D

O objetivo é desenvolver uma funcionalidade de acessibilidade que permite a tradução de textos da interface para Libras, exibida através de um avatar 3D realista animado.

## 1. Módulo de Tradução e Lógica (NLP)
- Criar `src/lib/libras-translator.ts` para processar strings de texto e gerar sequências de "glosas" (tokens de sinais).
- Utilizar um dicionário de mapeamento para traduzir termos comuns do sistema (Saúde, Agendamento, Protocolo).

## 2. Componente de Visualização 3D
- Criar `src/components/LibrasAvatar.tsx` utilizando `@react-three/fiber` e `@react-three/drei`.
- Implementar um modelo 3D realista (adulto, roupa profissional escura).
- Focar o enquadramento da cintura para cima, com mãos aumentadas (1.8x) para clareza.
- Implementar controles de reprodução: Play, Pause, Velocidade (0.75x a 1.25x) e Repetir.

## 3. Integração Global e UI
- **AppShell**: Adicionar um botão flutuante e móvel (draggable) para ativar/desativar o suporte a Libras.
- **Componentes de Conteúdo**: Adicionar gatilhos "Ver em Libras" ao lado de textos informativos e mensagens do assistente.
- **Sincronização**: Garantir que o avatar reaja em tempo real ao texto enviado pelo usuário ou exibido pelo sistema.

## 4. Requisitos Técnicos e Refinamento
- Animações fluidas entre sinais.
- Interface de alto contraste no overlay do avatar.
- Otimização para dispositivos móveis (mobile-first).

---
*Nota: A implementação seguirá as diretrizes de design do Cantu Conecta, mantendo o estilo profissional e acessível.*
