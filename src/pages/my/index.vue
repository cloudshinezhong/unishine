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
  <!-- 底部弹窗 -->
  <uni-popup ref="myTopPopup" :safe-area="false">
    <view style="background-color: #fff" class="max-h-88 min-h-38">
      <view class="flex center p-2 bg-white">
        <!--   占位元素     -->
        <view class="" style="opacity: 0"><uni-icons type="closeempty" size="24"></uni-icons></view>
        <view class="flex-1 center font-400"><text style="font-size: 18px">关于项目</text></view>
        <view @click.stop="() => myTopPopup.close()">
          <uni-icons type="closeempty" size="24"></uni-icons>
        </view>
      </view>
      <scroll-view scroll-y class="p-2 w-full" style="box-sizing: border-box">
        <view>
          <text font-size="3">最新打包时间：{{ buildDate }}</text>
        </view>
        <view>
          <text font-size="3" word-spacing="break">
            github地址(未开源)：
            <uni-link
              href="https://github.com/cloudshinezhong/unishine"
              text="https://github.com/cloudshinezhong/unishine"
            ></uni-link>
          </text>
        </view>
        <view>
          <text font-size="3">作者：shinezhong</text>
        </view>
        <view>
          <text font-size="3">联系：cloudshinezhong@gmail.com</text>
        </view>
        <view>
          <text font-size="3">
            关于：项目为实用AI功能集，相关功能还在完善，未开源原因， 1.项目还不完善，
            2.项目可能会被换皮商用，3.其他原因。项目当前部署在边缘服务节点，AI服务在某些地区不可用，中转了一层代理导致访问较缓慢，望谅解。
          </text>
        </view>
        <view>
          <text font-size="3">
            注意：由于项目部署为云部署(为海外云服务厂商)，个人项目无资金支持，无法去使用付费套餐内容，免费套餐存在一些限制，例如宽带，请求并发数，数据库，缓存，对象存储等。望酌情使用，可联系作者赞助，以更好支持项目。
          </text>
        </view>
        <view class="mb-10"></view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { useMailUserStore } from '@/store/mailuser'
import { userLogout } from '@/service/user'

const mailUserStore = useMailUserStore()

const show = ref(false)

const myTopPopup = ref(null) // popup组件

const buildDate = ref('')

const hasLogin = mailUserStore.isLogin
const userInfo = mailUserStore.mailUserInfo

function gotoUserInfo() {
  return uni.showToast({ icon: 'none', title: `相关功能正在开发中...` })
}

function declareUser() {
  myTopPopup.value.open('top')
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

onMounted(() => {
  buildDate.value = document.getElementsByTagName('html')[0].getAttribute('build-date')
})
</script>
