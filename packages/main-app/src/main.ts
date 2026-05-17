import { createApp } from 'vue'
import { registerMicroApps, start } from 'qiankun'
import { eventBus } from '@micro/shared'
import App from './App.vue'
import apps from './micro/apps'

// 在沙箱创建前挂载到真实 window，子应用通过 proxy 穿透读取
;(window as any).__MICRO_EVENT_BUS__ = eventBus

createApp(App).mount('#app')

registerMicroApps(apps, {
  beforeLoad: [async (app) => console.log('[主应用] beforeLoad', app.name)],
  beforeMount: [async (app) => console.log('[主应用] beforeMount', app.name)],
  afterUnmount: [async (app) => console.log('[主应用] afterUnmount', app.name)],
})

start({
  sandbox: {
    experimentalStyleIsolation: true,
  },
})
