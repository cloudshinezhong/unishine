<route lang="json5">
{
  style: { navigationBarTitleText: '我的', disableScroll: true },
}
</route>
<template>
  <view class="p-4 h-full">
    <view class="flex items-center flex-col leading-6" v-if="hasLogin">
      <uni-list class="w-full" :border="false">
        <uni-list-item
          link
          clickable
          :thumb="
            userInfo.avatar
              ? userInfo.avatar
              : 'https://res.cloudinary.com/dqasscgat/image/upload/v1714913344/unishine/wntnvdqakg3loerrni2c.jpg'
          "
          :title="userInfo.name"
          :note="`uid: ${userInfo.id}`"
          thumb-size="lg"
          @click="gotoUserInfo"
        ></uni-list-item>
      </uni-list>
      <uni-list class="w-full mt-2" :border="true">
        <uni-list-item
          clickable
          :note="`注册邮箱: ${userInfo.mail}`"
          @click="setClipboardData(userInfo.mail)"
        ></uni-list-item>
        <uni-list-item
          clickable
          :note="`最近登录: ${dayjs(userInfo.login_ts).format('YYYY/MM/DD HH:mm:ss')}`"
        ></uni-list-item>
        <uni-list-item clickable link note="关于项目" @click="declareUser"></uni-list-item>
      </uni-list>
    </view>
    <view class="flex items-center flex-col leading-6" v-else @click="show = true">
      <view class="i-carbon-user-avatar"></view>
      <view class="ml-2">点击显示头像</view>
    </view>
    <view class="flex items-center flex-col leading-6 mt-8">
      <button type="warn" v-if="hasLogin" class="w-full" @click="logout">退出登录</button>
    </view>
  </view>
  <aboutProject ref="aboutMyProject"></aboutProject>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import aboutProject from '@/components/aboutProject.vue'
import { useMailUserStore } from '@/store/mailuser'
import { userLogout } from '@/service/user'

const mailUserStore = useMailUserStore()

const show = ref(false)

const aboutMyProject = ref(null) // popup组件

const hasLogin = mailUserStore.isLogin
const userInfo = mailUserStore.mailUserInfo

function gotoUserInfo() {
  return uni.showToast({ icon: 'none', title: `相关功能正在开发中...` })
}

function declareUser() {
  aboutMyProject.value.openPopup()
}

function setClipboardData(data: string) {
  return uni.setClipboardData({
    data,
    showToast: false,
    success() {
      uni.showToast({
        title: '复制成功',
        icon: 'none',
      })
    },
  })
}

const logout = () => {
  uni.showModal({
    title: '确认退出当前账号？',
    success: (res) => {
      if (res.confirm) {
        const { mail, id } = userInfo
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
