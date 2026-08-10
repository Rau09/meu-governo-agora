import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.61ed569606ba4e2eb0213687ad10a6dd",
  appName: "QI Cidadão",
  webDir: "dist/client",
  server: {
    // Hot-reload a partir do preview da Lovable.
    // Para gerar o app final da loja, remova o bloco "server" e use o build local.
    url: "https://61ed5696-06ba-4e2e-b021-3687ad10a6dd.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0d3b34",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d3b34",
    },
  },
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
