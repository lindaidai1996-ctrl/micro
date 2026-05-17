declare let __webpack_public_path__: string

interface Window {
  __POWERED_BY_QIANKUN__?: boolean
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string
  reactFlag?: boolean
}

declare module 'lodash' {
  export function capitalize(str: string): string
  export function upperFirst(str: string): string
}
