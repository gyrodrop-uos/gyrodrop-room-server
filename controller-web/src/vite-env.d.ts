/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROOM_SERVER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
