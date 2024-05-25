<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
    disableScroll: true,
  },
}
</route>
<template>
  <view
    class="bg-white overflow-hidden pt-2 px-4 h-full"
    :style="{ marginTop: safeAreaInsets?.top + 'px' }"
  >
    <view>
      <view class="mt-12">
        <image mode="aspectFit" src="/static/logo_square.jpg" class="w-28 h-28 block mx-auto" />
      </view>
      <view class="text-center text-4xl main-title-color test-unocss-apply">unishine</view>
      <view class="text-center text-2xl mt-2 mb-8">AI聊天助手</view>
      <view class="mt-8 justify-center">
        <button @click="goChatPage" type="primary">进入聊天助手</button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useMailUserStore } from '@/store/mailuser'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const mailUserStore = useMailUserStore()

onBeforeMount(async () => {
  if (!mailUserStore.isLogin) {
    await uni.reLaunch({
      url: `/pages/login/login`,
      query: {},
    })
  }
})

const goChatPage = () => {
  uni.navigateTo({
    url: `/pages/tool/pages/chat?name=${encodeURIComponent('文本生成')},`,
  })
}

/** 激活“分享给好友” */
onShareAppMessage((options: Page.ShareAppMessageOption): Page.CustomShareContent => {
  console.log('options:', options)
  return {
    title: 'unishine',
    desc: 'unishine 演示示例',
    path: '/pages/index/index?mail=xxx',
  }
})
</script>

<style>
.main-title-color {
  color: #d14328;
}

.test-unocss-apply {
  @apply m-4;
}
</style>
