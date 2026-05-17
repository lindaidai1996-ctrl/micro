import { createApp } from 'vue'
import { registerMicroApps, start } from 'qiankun'
import App from './App.vue'
import apps from './micro/apps'

createApp(App).mount('#app')

registerMicroApps(apps, {
  beforeLoad: [async (app) => console.log('[主应用] beforeLoad', app.name)],
  beforeMount: [async (app) => console.log('[主应用] beforeMount', app.name)],
  afterUnmount: [async (app) => console.log('[主应用] afterUnmount', app.name)],
})

start({
  sandbox: {
    strictStyleIsolation: true,
  },
})
