import { createSSRApp } from 'vue'
import uvUI from '@climblee/uv-ui'
import App from './App.vue'
import store from './store'
import { routeInterceptor, requestInterceptor } from './interceptors'
import globalScrollControl from './hooks/globalScrollControl' // 替换为你的插件路
import i18n from './locale/index'
// Chrome51 版本以后，Chrome 增加了新的事件捕获机制－Passive Event Listeners，导致触发了告警。
import 'default-passive-events'
import 'virtual:svg-icons-register'
import 'virtual:uno.css'
import '@/style/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uvUI)
  app.use(store)
  app.use(globalScrollControl)
  app.use(routeInterceptor)
  app.use(requestInterceptor)
  app.use(i18n)
  return {
    app,
  }
}
