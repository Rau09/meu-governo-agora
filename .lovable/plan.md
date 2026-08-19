---
name: Copiar Intérprete Redação/Leia Paraná
description: Implementar intérprete de Libras inspirado no padrão Hand Talk usado nos portais do Governo do Paraná.
type: feature
---

## Objetivo
Substituir o avatar 3D simplificado por uma implementação que remeta ao widget da Hand Talk utilizado no Redação Paraná / Leia Paraná.

## Mudanças Necessárias

### 1. Interface (LibrasAvatar.tsx)
- Mudar a paleta de cores para azul/branco clássico do Governo do Paraná/Hand Talk.
- Alterar o layout da janela para um design mais vertical e arredondado.
- Adicionar o ícone clássico de mãos sinalizando no botão flutuante.

### 2. Comportamento
- Garantir que o avatar seja ativado por um botão flutuante persistente no canto inferior direito.
- Sincronização de texto e sinalização baseada em glossário.

### 3. Visual do Avatar
- Manter o estilo humano 2D/3D híbrido, mas ajustar as proporções e o fundo para maior clareza, similar à Hand Talk.
