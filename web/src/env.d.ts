/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** HTTPS Neon URL without credentials, e.g. https://ep-xxx.c-9.aws.neon.tech/neondb */
  readonly PUBLIC_NEON_DB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
