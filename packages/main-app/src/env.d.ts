/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUB_REACT_URL: string
  readonly VITE_SUB_VUE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
