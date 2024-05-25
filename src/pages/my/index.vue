<route lang="json5">
{
  style: { navigationBarTitleText: '我的', disableScroll: true },
}
</route>
<template>
  <view class="p-4 h-full">
    <view class="flex items-center leading-6" v-if="hasLogin">
      <image class="w-8 h-8 rounded-full" :src="mailUserStore.mailUserInfo?.avatar"></image>
      <view class="ml-2">{{ mailUserStore.mailUserInfo?.name }}</view>
    </view>
    <view class="flex items-center leading-6" v-else @click="show = true">
      <view class="i-carbon-user-avatar"></view>
      <view class="ml-2">点击显示头像</view>
    </view>
    <button type="warn" v-if="hasLogin" class="mt-2" @click="logout">退出登录</button>
  </view>
</template>

<script lang="ts" setup>
import { useMailUserStore } from '@/store/mailuser'
import { userLogout } from '@/service/user'

const mailUserStore = useMailUserStore()

const show = ref(false)
const hasLogin = mailUserStore.isLogin

const logout = () => {
  uni.showModal({
    title: '确认退出当前账号？',
    success: (res) => {
      if (res.confirm) {
        const { mail, id } = mailUserStore.mailUserInfo
        uni.showLoading({ mask: true })
        userLogout(id).finally(() => {
          uni.hideLoading()
          mailUserStore.clearInfo()
          uni.redirectTo({
            url: `/pages/login/login?mail=${encodeURIComponent(mail)}`,
          })
        })
      }
    },
  })
}
</script>
