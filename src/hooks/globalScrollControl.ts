import { ref, onMounted, onUnmounted, App } from 'vue'

// 定义滚动控制逻辑
const usePageScroll = () => {
  const isScrollDisabled = ref(false)

  const box = (e: TouchEvent) => {
    if (isScrollDisabled.value) {
      e.preventDefault()
    }
  }

  const stop = () => {
    isScrollDisabled.value = true
    document.body.style.overflow = 'hidden'
  }

  const move = () => {
    isScrollDisabled.value = false
    document.body.style.overflow = ''
  }

  // 在组件挂载和卸载时添加/移除事件监听器
  onMounted(() => {
    document.addEventListener('touchmove', box, { passive: false })
  })

  onUnmounted(() => {
    document.removeEventListener('touchmove', box, false)
  })

  return {
    isScrollDisabled,
    stop,
    move,
  }
}

// 创建 Vue 插件
const globalScrollControl = {
  install(app: App) {
    // 将滚动控制逻辑注入到全局
    app.config.globalProperties.$pageScroll = usePageScroll()
  },
}

export default globalScrollControl
