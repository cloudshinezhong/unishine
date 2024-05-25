<route lang="json5">
{
  style: { navigationBarTitleText: '登录', navigationStyle: 'custom' },
}
</route>
<template>
  <view class="login">
    <uni-nav-bar
      title="登录"
      class="fixed w-full z-1"
      :border="false"
      :status-bar="true"
      :shadow="true"
    ></uni-nav-bar>
    <view class="h-11" :style="{ paddingTop: systemInfo.safeAreaInsets?.top + 'px' }"></view>
    <view class="content">
      <!-- 头部logo -->
      <view class="header">
        <image :src="logoImage" mode="aspectFit" class="mt-4"></image>
      </view>
      <!-- 主体表单 -->
      <view class="main">
        <wInput
          v-model="mail"
          maxlength="35"
          placeholder="邮箱"
          typed="text"
          @update:modelValue="mailInput"
        ></wInput>
        <wInput
          v-model="passWord"
          typed="password"
          maxlength="30"
          placeholder="密码"
          @update:modelValue="passInput"
        ></wInput>
        <view class="input-tips mb-6" :style="[{ opacity: loginErr ? '1' : '0' }]">
          <text style="color: #dd524d">如果忘记密码，可以点击忘记密码重置</text>
        </view>
      </view>
      <wButton text="登 录" :rotate="isRotate" @click="startLogin" bgColor="#1E90FF"></wButton>

      <!-- 其他登录 -->
      <!--      <view class="other_login cuIcon">-->
      <!--        <view class="login_icon">-->
      <!--          <view class="cuIcon-weixin" @tap="login_weixin"></view>-->
      <!--        </view>-->
      <!--        <view class="login_icon">-->
      <!--          <view class="cuIcon-weibo" @tap="login_weibo"></view>-->
      <!--        </view>-->
      <!--        <view class="login_icon">-->
      <!--          <view class="cuIcon-github" @tap="login_github"></view>-->
      <!--        </view>-->
      <!--      </view>-->

      <!-- 底部信息 -->
      <view class="footer">
        <navigator url="forget" open-type="navigate" :style="[{ color: '#1E90FF' }]">
          忘记密码
        </navigator>
        <text>|</text>
        <navigator url="register" open-type="navigate" :style="[{ color: '#1E90FF' }]">
          注册账号
        </navigator>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import wInput from '../../components/watch-login/watch-input.vue'
import wButton from '../../components/watch-login/watch-button.vue'
import logoUrl from '@/static/logo.svg'
import { debounce } from '@/utils'
import { loginAccount } from '@/service/prelogin'
import { useMailUserStore } from '@/store/mailuser'

const mailUserStore = useMailUserStore()
provide('runCode', () => {})

const systemInfo = ref({
  safeAreaInsets: {
    bottom: 0,
    top: 0,
  },
  windowHeight: 0,
})

const logoImage = ref<string>(logoUrl)
const mail = ref<string>('')
const passWord = ref<string>('')
const isRotate = ref<boolean>(false)
const loginErr = ref(false)

onMounted(() => {
  isLogin()
  systemInfo.value = uni.getSystemInfoSync()
  // #ifdef APP-PLUS
  if (systemInfo.value.safeAreaInsets.bottom === 0) {
    systemInfo.value.safeAreaInsets.bottom = 16
  }
  // #endif

  // #ifdef H5
  systemInfo.value.windowHeight -= uni.upx2px(190)
  // #endif
})

onLoad((option) => {
  const { mail: mailQuery } = option
  if (mailQuery) {
    mail.value = decodeURIComponent(mailQuery)
  } else if (mailUserStore.mailUserInfo.mail) {
    mail.value = mailUserStore.mailUserInfo.mail
  }
})

// #ifdef MP
watch(
  mail,
  debounce((newVal) => {
    if (newVal && loginErr.value) {
      loginErr.value = false
    }
  }, 300),
)

watch(
  passWord,
  debounce((newVal) => {
    if (newVal && loginErr.value) {
      loginErr.value = false
    }
  }, 300),
)
// #endif

const mailInput = debounce((val) => {
  if (val && loginErr.value) {
    loginErr.value = false
  }
}, 300)

const passInput = debounce((val) => {
  if (val && loginErr.value) {
    loginErr.value = false
  }
}, 300)

const startLogin = () => {
  if (isRotate.value) {
    return
  }
  if (mail.value.length === 0) {
    uni.showToast({
      icon: 'none',
      position: 'bottom',
      title: '邮箱不能为空',
    })
    return
  }
  if (passWord.value.length === 0) {
    uni.showToast({
      icon: 'none',
      position: 'bottom',
      title: '密码不能为空',
    })
    return
  }
  isRotate.value = true
  login()
}

const login = () => {
  loginAccount(mail.value, passWord.value)
    .then((res) => {
      if (res.code === 0) {
        mailUserStore.setInfo(res.data)
        isRotate.value = false
        uni.showToast({
          icon: 'success',
          position: 'bottom',
          title: '登录成功',
          duration: 1000,
          mask: true,
        })
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index',
          })
        }, 2000)
      } else {
        uni.showToast({
          icon: 'none',
          position: 'bottom',
          title: `登入失败: ${res?.err_key ?? 'err'}`,
          duration: 1000,
          mask: true,
        })
        isRotate.value = false
        loginErr.value = true
      }
    })
    .catch((err) => {
      console.log(err)
      isRotate.value = false
      uni.showToast({
        icon: 'none',
        position: 'bottom',
        title: `登入失败: ${err?.message ?? 'err'}`,
        duration: 1000,
        mask: true,
      })
    })
}

const login_weixin = () => {
  uni.showToast({
    icon: 'none',
    position: 'bottom',
    title: '暂不支持',
  })
}

const login_weibo = () => {
  uni.showToast({
    icon: 'none',
    position: 'bottom',
    title: '暂不支持',
  })
}

const login_github = () => {
  uni.showToast({
    icon: 'none',
    position: 'bottom',
    title: '暂不支持',
  })
}

const isLogin = () => {
  try {
    if (mailUserStore.isLogin) {
      uni.reLaunch({
        url: '/pages/index/index',
      })
    }
  } catch (e) {
    // error
  }
}
</script>

<style>
@import url('../../components/watch-login/css/icon.css');
@import url('./css/main.css');
</style>
