import { createSSRApp } from 'vue'
import App from './App.vue'
import store from './store'
import { routeInterceptor, requestInterceptor } from './interceptors'
import globalScrollControl from './hooks/globalScrollControl' // 替换为你的插件路
import i18n from './locale/index'
import 'virtual:svg-icons-register'
import 'virtual:uno.css'
import '@/style/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(globalScrollControl)
  app.use(routeInterceptor)
  app.use(requestInterceptor)
  app.use(i18n)
  return {
    app,
  }
}
