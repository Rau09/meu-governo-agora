# Plano de Implementação: Cantu Conecta

Transformar o aplicativo atual em uma plataforma de tecnologia cívica profissional chamada **Cantu Conecta**, focada em Saúde Comunitária e Causa Animal para a região da Cantuquiriguaçu.

## 1. Identidade e Branding
- Renomear todos os componentes e referências visuais de "QI Cidadão" para **Cantu Conecta**.
- Atualizar o slogan para "Sua cidade, sua saúde, seu cuidado."
- Ajustar a paleta de cores para tons que transmitam saúde, confiança e tecnologia.

## 2. Reestruturação do Aplicativo (AppShell)
- Atualizar a navegação principal (Bottom Nav) para refletir os novos módulos:
    - 🏠 Início
    - 🩺 Minha Saúde
    - 🐾 Causa Animal
    - 📍 Comunidade (Ocorrências)
    - 🤖 Assistente Cantu
    - 👤 Meu Perfil

## 3. Módulo Saúde Comunitária (Minha Saúde)
- Expandir as funcionalidades de agendamento de consultas e exames.
- Implementar visualização de filas de espera e lembretes de vacinação/campanhas.

## 4. Módulo Causa Animal (Diferencial)
- Criar a seção **Causa Animal** com:
    - Registro de ocorrências (animais perdidos, feridos, maus-tratos).
    - Mural de adoção ("Quero conhecer").
    - Mapa Animal com marcações específicas.
    - Opções de participação comunitária ("Quero ajudar").

## 5. Assistente Cantu (IA)
- Evoluir o assistente atual para atuar como porta de entrada, realizando triagem e direcionando para os serviços corretos.
- Garantir que a IA não realize diagnósticos médicos, focando em suporte administrativo e organizacional.

## 6. Painel de Gestão e Inteligência
- Renomear para **Inteligência Cantu**.
- Adicionar indicadores de "Pressão do Atendimento" e tendências preventivas.
- Criar visão regional para os municípios da Cantuquiriguaçu.

## 7. Experiência do Usuário e Acessibilidade
- Refinar o fluxo de "Criar meu acesso" em 4 etapas (Dados, Localização, Preferências, Confirmação).
- Manter e otimizar o avatar de Libras.

## Detalhes Técnicos
- **Estado Global:** Migrar `src/lib/city-store.ts` para `src/lib/cantu-store.ts` com suporte a múltiplos municípios.
- **Rotas:** Criar novas rotas `/saude`, `/causa-animal` e `/comunidade`.
- **Estilos:** Utilizar Tailwind v4 para uma interface limpa e moderna de startup.
