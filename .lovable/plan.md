# Plano: Reformulação do Intérprete de Libras Profissional

O objetivo é transformar a funcionalidade atual de Libras em uma solução de acessibilidade profissional, focada em clareza, anatomia correta e integração visual premium com o Cantu Conecta.

## 1. Novo Personagem e Anatomia (src/components/LibrasAvatar.tsx)
- **Design 3D Estilizado:** Substituir o visual atual por um assistente digital adulto/jovem, com formas limpas e iluminação suave.
- **Anatomia das Mãos (Prioridade Máxima):** 
    - Implementar um modelo de mão com 5 dedos perfeitamente identificáveis e articulações naturais.
    - Garantir que as mãos sejam proporcionais e maiores que o normal para facilitar a leitura.
- **Visual Profissional:** Roupa verde lisa (Cantu Conecta) sem mangas largas ou acessórios que interfiram nos sinais.
- **Enquadramento:** Personagem renderizado da cintura para cima, ocupando a maior parte da área útil.

## 2. Aprimoramento da Sinalização (src/lib/libras.ts)
- **Ritmo e Fluidez:** Refinar os tempos de animação (`INÍCIO → MOVIMENTO → PAUSA`) para garantir que cada sinal seja compreendido.
- **Configurações de Mão Reais:** Mapear configurações de mão precisas da Libras (ex: sinais de letras e palavras chave).
- **Vocabulário Contextual:** Expandir o vocabulário para cobrir os termos principais do app.

## 3. Interface de Acessibilidade Premium (src/components/LibrasAvatar.tsx)
- **Layout Nativo:** Substituir o popup atual por uma interface de funcionalidade dedicada dentro do componente.
- **Controles de Reprodução:**
    - Botões de Play/Pause/Repeat modernos.
    - Seletor de velocidade (0.75x, 1.0x, 1.25x).
- **Legendas Sincronizadas:** Exibir o texto traduzido abaixo do personagem, destacando a palavra atual em tempo real.
- **Microinterações:** Adicionar feedback visual suave nos controles e transições entre sinais.

## Detalhes Técnicos
- Utilizar transições CSS otimizadas para movimentos fluidos.
- Garantir contraste visual (WCAG) entre as mãos (tom de pele) e a roupa (verde escuro Cantu).
- Clamping aprimorado para o botão flutuante e o container de tradução em dispositivos móveis.

---
Esse plano segue rigorosamente as diretrizes de UX/UI para acessibilidade profissional.
