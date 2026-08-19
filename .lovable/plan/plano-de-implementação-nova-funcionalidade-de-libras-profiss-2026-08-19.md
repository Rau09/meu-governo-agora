# Plano de Implementação: Nova Funcionalidade de Libras Profissional

Criar uma nova solução de acessibilidade em Libras integrada ao Cantu Conecta, focada na clareza absoluta dos sinais e em um design profissional.

## Alterações de Interface e UX

- **Novo Componente `LibrasViewer`**: Uma tela dedicada e moderna para visualização da interpretação.
- **Integração no Assistente**: Botão "Ver em Libras" em cada resposta da assistente virtual.
- **Controles de Reprodução**: Play, Pause, Repetir, Voltar/Próximo sinal e seletores de velocidade (0.75x, 1x, 1.25x).
- **Texto Sincronizado**: Exibição do texto original com destaque na palavra que está sendo sinalizada no momento.

## Design e Acessibilidade (Libras)

- **Intérprete Humano Estilizado**: Design adulto, profissional, com roupa verde lisa para máximo contraste com as mãos.
- **Mãos de Alta Visibilidade**: 5 dedos detalhados e articulados, escala aumentada para visualização em smartphones.
- **Estabilidade Visual**: Enquadramento fixo da cintura para cima, fundo limpo com gradiente suave para foco total no intérprete.
- **Ritmo de Sinalização**: Cadência de 850ms por pose, garantindo tempo para compreensão do sinal.

## Detalhes Técnicos

- **Refatoração do Sistema de Poses**: Atualização do `src/lib/libras.ts` com configurações de mão mais precisas e vocabulário regional expandido.
- **Novo Componente `LibrasFigure`**: SVG articulado com animações `cubic-bezier` para movimentos fluidos e naturais.
- **Gerenciamento de Estado**: Sincronização entre o índice da animação e o texto exibido.

## Verificação

- Validar a visibilidade dos 5 dedos em diferentes resoluções de tela.
- Testar a troca de velocidade e a função de repetir sinal.
- Confirmar que o destaque do texto acompanha corretamente a animação.
