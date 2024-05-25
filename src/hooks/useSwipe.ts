import { ref, onMounted, onUnmounted } from 'vue'

export default function useSwipe(threshold = 50) {
  const touchStartX = ref(0)
  const touchStartY = ref(0)

  const onTouchStart = (e) => {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
  }

  const onTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.value
    const deltaY = e.changedTouches[0].clientY - touchStartY.value

    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX >= 0) {
        console.log('左滑')
      } else {
        console.log('右滑')
      }
    } else if (Math.abs(deltaY) > threshold && Math.abs(deltaX) < Math.abs(deltaY)) {
      if (deltaY < 0) {
        console.log('上滑')
      } else {
        console.log('下滑')
      }
    } else {
      console.log('可能是误触！')
    }
  }

  onMounted(() => {
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend', onTouchEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
  })
}
