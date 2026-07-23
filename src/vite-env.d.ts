/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "swiper/css";
declare module "swiper/css/pagination";
declare module "swiper/css/navigation";
