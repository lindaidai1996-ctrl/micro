import type { RegistrableApp } from 'qiankun'

const apps: RegistrableApp<Record<string, unknown>>[] = [
  {
    name: 'sub-react',
    entry: import.meta.env.VITE_SUB_REACT_URL || '//localhost:8081',
    container: '#sub-container',
    activeRule: '/sub-react',
  },
  {
    name: 'sub-vue',
    entry: import.meta.env.VITE_SUB_VUE_URL || '//localhost:8082',
    container: '#sub-container',
    activeRule: '/sub-vue',
  },
]

export default apps
