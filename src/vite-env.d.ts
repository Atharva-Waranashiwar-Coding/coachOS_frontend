/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_AUTH_API_URL: string;
  readonly VITE_ATHLETE_API_URL: string;
  readonly VITE_AI_REVIEW_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
