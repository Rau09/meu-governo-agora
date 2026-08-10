# Empacotar o QI Cidadão em Android e iOS (Capacitor)

Pré-requisitos: Android Studio (Android) e/ou Mac com Xcode (iOS).

## Passos

1. Exporte o projeto para o GitHub ("Export to Github") e faça `git clone` do repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Adicione as plataformas desejadas:
   ```bash
   npx cap add android
   npx cap add ios
   ```
4. Gere o build web e sincronize:
   ```bash
   npm run build
   npx cap sync
   ```
5. Rode no dispositivo/emulador:
   ```bash
   npx cap run android
   npx cap run ios
   ```

## Hot reload

O `capacitor.config.ts` aponta o `server.url` para o preview da Lovable, então o app
no celular já reflete as alterações feitas aqui, sem precisar recompilar.

## Build de produção (lojas)

Antes de publicar na Play Store / App Store, remova o bloco `server` do
`capacitor.config.ts` para o app usar os arquivos locais de `dist/client`, e rode
novamente `npm run build && npx cap sync`.

## Ícones e splash

Coloque `icon.png` (1024x1024) e `splash.png` em `resources/` e gere os assets com:

```bash
npx @capacitor/assets generate
```
