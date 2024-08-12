<template>
  <view class="about-project">
    <!-- 弹窗 -->
    <uni-popup ref="myPopup" style="position: absolute; top: 160px">
      <view class="max-h-88 min-h-38 flex justify-center items-center">
        <view class="flex items-center flex-col" style="max-width: 92%">
          <view class="flex center w-full p-2 bg-white">
            <!--   占位元素     -->
            <view class="" style="opacity: 0">
              <uni-icons type="closeempty" size="24"></uni-icons>
            </view>
            <view class="flex-1 center font-400">
              <text style="font-size: 18px">关于项目</text>
            </view>
            <view @click.stop="() => myPopup.close()">
              <uni-icons type="closeempty" size="24"></uni-icons>
            </view>
          </view>
          <scroll-view scroll-y class="p-2 w-full bg-white">
            <view>
              <text font-size="3">最新打包时间：{{ buildDate }}</text>
            </view>
            <view>
              <text font-size="3" word-spacing="break">
                github地址：
                <uni-link
                  href="https://github.com/cloudshinezhong/unishine"
                  text="https://github.com/cloudshinezhong/unishine"
                  fontSize="12"
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
                关于：项目为实用AI功能集，相关功能还在完善，无商业化计划(完全免费)，勿薅羊毛，勿商用，项目后端未开源，未开源原因，1.项目还不完善，
                2.项目可能会被换皮商用，3.其他原因。项目当前部署在边缘服务节点，某些AI(例如:gemini)服务在某些地区不可用，中转了一层代理(多层代理)导致访问较缓慢。
                提需求或bug请到github提issue，或是邮件联系作者。
              </text>
            </view>
            <view>
              <text font-size="3">
                注意：由于项目部署为云部署(为海外云服务厂商)，个人项目无资金支持付费套餐内容，免费套餐存在一些限制，例如宽带，请求并发数，数据库，缓存，对象存储等。望酌情使用，可联系作者赞助，以更好支持项目。
              </text>
            </view>
            <view class="mb-10"></view>
          </scroll-view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script lang="ts" setup>
const myPopup = ref(null) // popup组件

const buildDate = ref('')

// 暴露给父组件调用的方法
defineExpose({
  openPopup,
  closePopup,
})

function openPopup() {
  myPopup.value.open('center')
}

function closePopup() {
  myPopup.value.close()
}

onMounted(() => {
  buildDate.value = document.getElementsByTagName('html')[0].getAttribute('build-date')
})
</script>

<style></style>
