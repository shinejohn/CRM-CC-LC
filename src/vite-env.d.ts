/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_AI_ENDPOINT?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_PUSHER_APP_KEY?: string;
  readonly VITE_PUSHER_APP_CLUSTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

