<route lang="json5">
{
  style: { navigationBarTitleText: '重置密码', navigationStyle: 'custom' },
}
</route>
<template>
  <view class="forget">
    <uni-nav-bar
      title="重置密码"
      class="fixed w-full z-99999"
      left-icon="left"
      @clickLeft="back"
      :border="false"
      :status-bar="true"
      :shadow="true"
    ></uni-nav-bar>
    <view class="h-11" :style="{ paddingTop: systemInfo.safeAreaInsets?.top + 'px' }"></view>
    <view class="content">
      <!-- 主体 -->
      <view class="main">
        <view class="tips">若你忘记了密码，可在此重置新密码。</view>
        <wInput
          typed="text"
          v-model="mailData"
          maxlength="35"
          placeholder="输入注册的邮箱号"
          @update:modelValue="mailInput"
        ></wInput>
        <view class="input-tips" :style="[{ opacity: mailData ? '1' : '0' }]">
          <text style="color: #4ddd87ff" v-if="mailInputCk">格式正确</text>
          <text style="color: #dd524d" v-else>格式错误</text>
        </view>
        <wInput
          v-model="passWord"
          typed="password"
          maxlength="30"
          placeholder="密码最少8位，含数字和字母，可含特殊字符"
          @update:modelValue="passInput"
        ></wInput>
        <view class="input-tips" :style="[{ opacity: passWord ? '1' : '0' }]">
          <text style="color: #4ddd87ff" v-if="passInputCk">格式正确</text>
          <text style="color: #dd524d" v-else>格式错误</text>
        </view>
        <wInput
          v-model="rePassWord"
          typed="password"
          maxlength="30"
          placeholder="确认密码"
          @update:modelValue="rePassInput"
        ></wInput>
        <view class="input-tips" :style="[{ opacity: rePassWord ? '1' : '0' }]">
          <text style="color: #4ddd87ff" v-if="rePassInputCk">确认正确</text>
          <text style="color: #dd524d" v-else>确认错误</text>
        </view>
        <wInput
          v-model="verCode"
          typed="number"
          maxlength="6"
          placeholder="验证码"
          isShowCode
          codeText="获取重置码"
          setTime="180"
          ref="runCode"
          @setCode="getVerCode()"
          @runCodeStart="runCodeStart"
          @runCodeEnd="runCodeEnd"
        ></wInput>
        <view class="input-tips mb-6" :style="[{ opacity: captchaSendStatus ? '1' : '0' }]">
          <text style="color: #4db2dd" v-if="captchaSendStatus === 1">正在请求...</text>
          <text style="color: #4ddd87ff" v-else-if="captchaSendStatus === 2">已发送</text>
          <text style="color: #4ddd87ff" v-else-if="captchaSendStatus === 3">
            已发送，请倒计时结束前输入
          </text>
          <text style="color: #dd524d" v-else-if="captchaSendStatus === -1">请求失败</text>
          <text style="color: #aaaaaa" v-else>请点击获取验证码</text>
        </view>
      </view>
      <wButton
        text="重置密码"
        :rotate="isRotate"
        @click="startRePass()"
        bgColor="#1E90FF"
      ></wButton>
    </view>
  </view>
</template>

<script lang="ts" setup>
import wInput from '../../components/watch-login/watch-input.vue'
import wButton from '../../components/watch-login/watch-button.vue'
import { back, debounce } from '@/utils/index'
import { resetPass, mailCaptcha } from '@/service/prelogin'
import { useMailUserStore } from '@/store/mailuser'

const mailUserStore = useMailUserStore()

const mailData = ref('') // 邮箱
const passWord = ref('') // 密码
const rePassWord = ref('') // 确认密码
const verCode = ref('') // 验证码
const isRotate = ref(false) // 是否加载旋转

// wInput ref
const fInput = ref(null) // 组件

const mailInputCk = ref(false)
const passInputCk = ref(false)
const rePassInputCk = ref(false)

const captchaSendStatus = ref(0) // 0未发送，1请求中，2请求成功，3倒计时开始，-1请求失败

const systemInfo = ref({
  safeAreaInsets: {
    bottom: 0,
    top: 0,
  },
  windowHeight: 0,
})

// #ifdef MP
watch(
  mailData,
  debounce((newVal) => {
    if (/^[0-9a-zA-Z]?.+@[0-9a-zA-Z]+\.[a-zA-Z]+$/.test(newVal)) {
      return (mailInputCk.value = true)
    }
    mailInputCk.value = false
  }, 300),
)

watch(
  passWord,
  debounce((newVal) => {
    rePassInputCk.value = newVal === rePassWord.value
    if (/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/.test(newVal)) {
      return (passInputCk.value = true)
    }
    passInputCk.value = false
  }, 300),
)

watch(
  rePassWord,
  debounce((newVal) => {
    if (newVal === passWord.value) {
      return (rePassInputCk.value = true)
    }
    rePassInputCk.value = false
  }, 100),
)
// #endif

onMounted(() => {
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

const mailInput = debounce((val) => {
  if (/^[0-9a-zA-Z]?.+@[0-9a-zA-Z]+\.[a-zA-Z]+$/.test(val)) {
    return (mailInputCk.value = true)
  }
  mailInputCk.value = false
}, 300)

const passInput = debounce((val) => {
  rePassInputCk.value = val === rePassWord.value
  if (/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/.test(val)) {
    return (passInputCk.value = true)
  }
  passInputCk.value = false
}, 300)

const rePassInput = debounce((val) => {
  if (val === passWord.value) {
    return (rePassInputCk.value = true)
  }
  rePassInputCk.value = false
}, 100)

function runCodeStart() {
  captchaSendStatus.value = 3
}

function runCodeEnd() {
  captchaSendStatus.value = 0
}

function getVerCode() {
  if (!mailInputCk.value) {
    uni.showToast({
      icon: 'none',
      position: 'bottom',
      title: '请先确认邮箱是否正确',
    })
    return false
  }
  if (captchaSendStatus.value >= 1) return false
  captchaSendStatus.value = 1
  // 获取验证码
  mailCaptcha(mailData.value)
    .then((res) => {
      if (res.code !== 0) {
        uni.showToast({
          icon: 'none',
          position: 'bottom',
          title: `获取验证码失败: ${res?.err_key ?? 'error'}`,
        })
        captchaSendStatus.value = -1
        fInput.value.runCode(0)
      } else {
        captchaSendStatus.value = 1
        fInput.value.runCode(undefined) // 触发倒计时（一般用于请求成功验证码后调用）
      }
    })
    .catch((err) => {
      uni.showToast({
        icon: 'none',
        position: 'bottom',
        title: `获取验证码失败: ${err?.message ?? 'error'}`,
      })
      captchaSendStatus.value = -1
      fInput.value.runCode(0)
    })
}
function startRePass() {
  // 重置密码
  if (isRotate.value) {
    // 判断是否加载中，避免重复点击请求
    return false
  }
  if (!(mailInputCk.value && passInputCk.value && rePassInputCk.value)) {
    uni.showToast({
      icon: 'none',
      position: 'bottom',
      title: '请先确认填写项是否正确',
    })
    return false
  }
  isRotate.value = true
  resetPass(mailData.value, verCode.value, passWord.value)
    .then((res) => {
      if (res.code !== 0) {
        isRotate.value = false
        uni.showToast({
          icon: 'none',
          position: 'bottom',
          title: `重置失败: ${res?.err_key ?? 'err'}`,
          duration: 1000,
          mask: true,
        })
        return false
      } else {
        isRotate.value = false
        uni.showToast({
          icon: 'success',
          position: 'bottom',
          title: '重置成功',
          duration: 1000,
          mask: true,
        })
        setTimeout(() => {
          mailUserStore.setInfoByKey('id', res.data.id)
          uni.redirectTo({
            url: `/pages/login/login?mail=${encodeURIComponent(mailData.value)}`,
          })
        }, 2000)
      }
    })
    .catch((err) => {
      isRotate.value = false
      uni.showToast({
        icon: 'none',
        position: 'bottom',
        title: `重置失败: ${err?.message ?? 'err'}`,
        duration: 1000,
        mask: true,
      })
    })
}
</script>

<style>
@import url('../../components/watch-login/css/icon.css');
@import url('./css/main.css');
</style>
