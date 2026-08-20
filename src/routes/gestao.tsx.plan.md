# Plano de Alinhamento Visual do Painel Administrativo

Este plano detalha a conclusão da modernização visual da interface de gestão do Cantu Conecta, garantindo fluidez, consistência estética e melhor usabilidade para os gestores.

## Objetivos
- Consolidar a linguagem visual baseada em `motion` (Framer Motion) em todas as seções.
- Substituir animações estáticas por transições fluidas e coordenadas.
- Refinar a hierarquia de dados e a legibilidade das métricas.
- Unificar o uso de contêineres arredondados (`rounded-[2rem]`, `rounded-[2.5rem]`).

## Alterações Técnicas

### 1. Refatoração da Estrutura Principal
- Integrar os componentes extraídos (`DetalhesEmergencia`, `MonitoramentoSetor`) de forma limpa no fluxo do `Painel`.
- Envolver seções de listas (Solicitações, Fila de Atendimento) em wrappers `motion` com `staggerChildren`.

### 2. Modernização de Componentes de Dados
- **Indicadores de Desempenho**: Aplicar o estilo de card com bordas suaves e sombras flutuantes.
- **Demanda por Área**: Transformar as barras de progresso simples em componentes `motion.div` com larguras animadas.
- **Listas de Atividade**: Adicionar micro-interações de hover e estados de clique mais táteis.

### 3. Ajustes de Layout e UX
- Garantir que o `AppShell` envolva corretamente todo o conteúdo para evitar cortes em dispositivos móveis.
- Refinar o `DetalheLista` (modal) para usar a mesma linguagem visual do resto do dashboard.

## Detalhes de Design
- **Cores**: Manter o azul institucional (`#005fb8`/`primary`) e o uso estratégico de cores semânticas (sucesso/alerta).
- **Tipografia**: Aumentar o peso visual de títulos de métricas e reduzir o ruído visual em sub legendas.
- **Movimento**: Utilizar `spring` para escalas de hover e `tween` suave para entradas de listas.
