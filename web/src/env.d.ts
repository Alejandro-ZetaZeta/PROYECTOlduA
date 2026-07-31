/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_INSFORGE_URL: string;
  readonly PUBLIC_INSFORGE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
