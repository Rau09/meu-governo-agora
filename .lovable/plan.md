# Plano: Integração de Avatar 3D Realista para Libras

O objetivo é reintroduzir a funcionalidade de acessibilidade em Libras, utilizando um avatar 3D realista integrado ao ecossistema do Cantu Conecta, permitindo a tradução de textos da interface em sinais.

## Alterações Técnicas

### Componentes e Lógica
- **`src/components/LibrasAvatar.tsx`**: Criar um novo componente de avatar 3D realista usando Three.js e React Three Fiber. O avatar será focado na cintura para cima, com mãos detalhadas e movimentos fluidos.
- **`src/lib/libras.ts`**: Implementar a lógica de mapeamento de texto para sequências de animação do avatar.
- **`src/components/AppShell.tsx`**: Reintroduzir o botão flutuante e móvel (draggable) para ativar/desativar o avatar globalmente.

### Integração
- **Tradução Sincronizada**: Adicionar botões "Ver em Libras" nos componentes de chat e informativos, enviando o contexto textual para o avatar.
- **Controles de Reprodução**: Implementar controles de Play, Pause, Velocidade (0.75x a 1.25x) e Repetir dentro do overlay do avatar.

## Detalhes Visuais
- **Avatar**: Modelo humano digital adulto, vestimenta profissional (azul marinho/preto), mãos escaladas para 1.8x para melhor visibilidade dos dedos.
- **Interface**: Overlay de alto contraste com fundo limpo para garantir que os sinais sejam discerníveis.

## Próximos Passos
1. Criar os arquivos de lógica e componentes.
2. Integrar o botão de controle no layout global.
3. Testar a sincronização em rotas específicas (Saúde, Agendamento).
