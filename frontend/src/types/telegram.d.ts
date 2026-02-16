// src/types/telegram.d.ts

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: any;
  MainButton: any;
  HapticFeedback: any;
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: any) => void;
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;
}

interface TelegramWebView {
  initParams: {
    tgWebAppData: string;
    tgWebAppVersion: string;
    tgWebAppThemeParams: string;
    tgWebAppPlatform: string;
  };
}

interface Telegram {
  WebApp?: TelegramWebApp;
  WebView?: TelegramWebView;
}

interface Window {
  Telegram?: Telegram;
}