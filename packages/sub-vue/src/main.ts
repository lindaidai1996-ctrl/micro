import './public-path'
import { createApp, type App as VueApp } from 'vue'
import {
  renderWithQiankun,
  qiankunWindow,
} from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import type { QiankunProps } from '@micro/shared'

let app: VueApp | null = null

function render(props: QiankunProps = {}) {
  const container = props.container
    ? props.container.querySelector('#app')
    : document.getElementById('app')

  app = createApp(App)
  app.mount(container as HTMLElement)

  if (props.onGlobalStateChange) {
    props.onGlobalStateChange((state) => {
      const appInstance = app?._instance
      if (appInstance?.exposed) {
        appInstance.exposed.theme.value = state.theme
      }
    })
  }
}

renderWithQiankun({
  bootstrap() {
    console.log('[sub-vue] bootstrap')
  },
  mount(props) {
    console.log('[sub-vue] mount', props)
    render(props)
  },
  unmount() {
    console.log('[sub-vue] unmount')
    app?.unmount()
    app = null
  },
  update() {},
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
