# Plano de Otimização e Performance — Cantu Conecta

Este plano detalha uma auditoria profunda e a execução de melhorias de performance, UX e eficiência técnica na plataforma Cantu Conecta, visando transformá-la em uma aplicação extremamente rápida e fluida.

## Análise Atual e Diagnóstico

### 1. Performance de Renderização
- **Problema:** Componentes pesados (como `LibrasAvatar.tsx` e `MapaOcorrencias.tsx`) re-renderizam frequentemente devido a mudanças de estado global ou local sem a devida memoização.
- **Impacto:** Quedas de FPS, especialmente em dispositivos mobile de entrada.
- **Gargalo:** O `LibrasAvatar` usa `setTimeout` em um loop que dispara re-renderizações a cada passo da sinalização.

### 2. Navegação e Code Splitting
- **Problema:** Atualmente, todas as rotas parecem estar carregando em um bundle único (ou sem carregamento inteligente de componentes pesados).
- **Impacto:** Tempo de carregamento inicial (LCP) elevado.
- **Gargalo:** Falta de `React.lazy` para componentes pesados fora da rota crítica.

### 3. Gestão de Estado e Persistência
- **Problema:** O `cantu-store.ts` usa `window.dispatchEvent(new Event("cantu-store"))` para sincronização, o que dispara re-renderizações em todos os hooks que escutam esse evento, mesmo que os dados relevantes para aquele hook não tenham mudado.
- **Impacto:** Trabalho desnecessário da CPU ao navegar ou interagir com formulários.

### 4. Assets e Imagens
- **Problema:** Imagens externas (Unsplash) e internas sem processamento de otimização de tamanho (WebP/Lazy loading nativo).
- **Impacto:** Alto consumo de dados e demora na pintura inicial.

---

## Estratégia de Execução

### Fase 1: Otimização da Infraestrutura e Bundle (Frontend)
- [ ] Implementar **Code Splitting** para componentes pesados.
- [ ] Configurar **Memoização Estratégica** (`useMemo`, `useCallback`, `memo`) nos componentes de alta frequência de atualização (`AppShell`, `LibrasAvatar`, `MapaOcorrencias`).
- [ ] Otimizar o sistema de eventos do `cantu-store.ts` para evitar disparos globais desnecessários.

### Fase 2: Performance de UI e Navegação
- [ ] Adicionar **Prefetch** inteligente de rotas com base na intenção do usuário (hover em botões de navegação).
- [ ] Implementar **Transições de Rota Suaves** usando Framer Motion ou transições CSS nativas leves.
- [ ] Melhorar os **Loading States** e esqueletos (Skeletons) para evitar layout shifts (CLS).

### Fase 3: Otimização de Ativos e Estilos
- [ ] Aplicar **Lazy Loading** nativo em todas as imagens.
- [ ] Otimizar o `styles.css` removendo variáveis não utilizadas ou consolidando utilitários.
- [ ] Refinar as animações de Libras para usarem `requestAnimationFrame` ou otimizações de SVG.

### Fase 4: Experiência do Usuário (UX)
- [ ] Garantir que o teclado mobile não quebre o layout em formulários.
- [ ] Melhorar a acessibilidade visual e o feedback de toque em todos os botões.

---

## Detalhes Técnicos

- **TanStack Router:** Usar `preload` nas rotas para carregar dados antes do clique.
- **React Query:** (Se aplicável) Garantir `staleTime` adequado para evitar refetching desnecessário. No momento, o app usa uma store customizada em cima de `localStorage`, que será otimizada com um seletor de dados mais fino.
- **Imagens:** Substituir URLs pesadas por versões otimizadas ou usar `loading="lazy"`.
- **LibrasAvatar:** Otimizar o loop de animação para reduzir a carga na thread principal.

---

## Próximos Passos (Imediato)

1.  **Otimizar `cantu-store.ts`**: Implementar um sistema de subscrição mais eficiente.
2.  **Memoizar `AppShell` e `LibrasAvatar`**: Evitar que a animação de Libras afete o restante da página.
3.  **Implementar Prefetch nas rotas**: Melhorar a percepção de velocidade de navegação.
