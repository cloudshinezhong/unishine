<route lang="json5">
{
  style: { navigationBarTitleText: 'AI Summary', navigationStyle: 'custom', disableScroll: true },
}
</route>
<template>
  <view class="page">
    <uni-nav-bar
      left-icon="left"
      @clickLeft="back"
      class="fixed w-full z-1"
      :shadow="true"
      :border="false"
      :status-bar="true"
    >
      <template v-slot:default>
        <view class="flex center flex-col flex-1 text-center">
          <view>
            <text style="font-size: 14px" class="font-800">AI Summary</text>
          </view>
          <view>
            <text style="font-size: 12px" line-clamp="1" class="ellipsis-1">文本总结</text>
          </view>
        </view>
      </template>
    </uni-nav-bar>
    <view class="h-11" :style="{ paddingTop: systemInfo.safeAreaInsets?.top + 'px' }"></view>
    <view
      class="flex fixed left-0 w-full h-full"
      :style="{ top: toTopHeight }"
      @touchstart="debounce(proxy.$pageScroll.stop(), 1000)"
      ref="listContainer"
    >
      <scroll-view
        :style="{
          maxHeight: initialWindowHeight + imPlaceholderheight + 'px',
          height: msgListHeight + 'px',
        }"
        :scroll-with-animation="false"
        scroll-y
        :scroll-into-view="scrollIntoView"
        class="msg-list"
      >
        <view class="list-first-item" id="list-first-item" key="list-first-item">
          <!-- 高度为0的 第一个元素用于方便滚动到第一个元素 -->
        </view>
        <!-- 聊天item -->
        <chat-item
          v-for="(item, index) in summaryList"
          :item="item"
          :key="index"
          :show-cursor="false"
          :show-btn="!!item.showBtn"
          ref="chatItemElement"
        ></chat-item>
        <view class="list-last-item" id="list-last-item" key="list-last-item">
          <!-- 高度为0的 最后一个元素用于方便滚动到最后一个元素 -->
        </view>
      </scroll-view>
    </view>

    <!-- 底部聊天输入框 -->
    <!-- #ifdef APP-PLUS -->
    <view class="fixed flex-col flex left-0 bottom-0 w-full">
      <view class="bottom">
        <chat-input-bar
          ref="inputBar"
          :disabled="sendDisabled"
          :inner-left-icon="false"
          @focus="inputFocus"
          @blur="inputBlur"
          @send="doSendAi"
          @leftClick="popupShow('left')"
          @linechange="inputLineChange"
          @update:value="onInputValueChange"
          :value="sendValue"
          :style="{
            paddingBottom:
              (keyboardHeight > 0
                ? systemInfo.safeAreaInsets.bottom / 2
                : systemInfo.safeAreaInsets.bottom) + 'px',
          }"
        />
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP -->
    <view
      class="fixed flex-col flex left-0 w-full"
      :style="{
        bottom: (keyboardHeight > 0 ? keyboardHeight - systemInfo.safeAreaInsets.bottom : 0) + 'px',
        paddingBottom: systemInfo.safeAreaInsets.bottom + 'px',
      }"
    >
      <view class="bottom">
        <chat-input-bar
          ref="inputBar"
          :disabled="sendDisabled"
          :inner-left-icon="false"
          @focus="inputFocus"
          @blur="inputBlur"
          @send="doSendAi"
          @leftClick="popupShow('left')"
          @linechange="inputLineChange"
          @update:value="onInputValueChange"
          :value="sendValue"
        />
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="fixed flex-col flex left-0 bottom-0 w-full">
      <view class="bottom">
        <chat-input-bar
          ref="inputBar"
          :disabled="sendDisabled"
          :inner-left-icon="false"
          @focus="inputFocus"
          @blur="inputBlur"
          @send="doSendAi"
          @leftClick="popupShow('left')"
          @linechange="inputLineChange"
          @update:value="onInputValueChange"
          :value="sendValue"
        />
      </view>
    </view>
    <!-- #endif -->
  </view>

  <!-- 左侧弹窗 -->
  <uni-popup ref="popup" background-color="#fff" :safe-area="false">
    <view class="flex flex-col h-full" :style="{ backgroundColor: '#f8f8f8' }">
      <!-- #ifdef MP -->
      <view
        class="h-11"
        :style="{
          paddingTop: systemInfo.safeAreaInsets?.top + 'px',
          backgroundColor: '#f8f8f8',
        }"
      ></view>
      <!-- #endif -->
      <scroll-view
        scroll-y
        class="popup-content max-w-74 flex box-border bg-white"
        :style="{ maxHeight: initialWindowHeight + imPlaceholderheight + 'px' }"
      >
        <uni-section
          title="最大输出token数"
          subTitle="对文本消息总结摘要，精简消息，一个词语通常对应一个或多个token"
          class="pl-3 pr-3 block"
        >
          <view>
            <slider :value="512" :min="128" :max="4096" show-value step="1" />
          </view>
        </uni-section>
        <view :style="{ height: imPlaceholderheight + 40 + 'px' }"></view>
        <view
          v-if="imPlaceholderheight"
          :style="{
            height: imPlaceholderheight + 'px',
            paddingBottom: imPlaceholderheight + 'px',
          }"
        ></view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import { back, debounce, generateUniqueId } from '@/utils'
import { summaryAi } from '@/service/ai'
import { useAiStore } from '@/store/AI'
import { useMailUserStore } from '@/store/mailuser'
import ChatItem from '@/pages/tool/components/chat-item/chat-item.vue'
const { proxy } = getCurrentInstance()

const aiStore = useAiStore()
const mailUserStore = useMailUserStore()

const popup = ref(null) // 左侧popup组件
const popupIsShow = ref(false) // popup组件有没展示

const inputBar = ref(null) // chatInputBar组件

const listContainer = ref(null) // chatitem列表父组件
const chatItemElement = ref([]) // 使用数组存储 chat-item 的 ref

const systemInfo = ref({
  safeAreaInsets: {
    bottom: 0,
    top: 0,
  },
  windowHeight: 0,
})

const scrollIntoView = ref('')

const AIinfo = ref({
  time: '',
  icon: 'https://res.cloudinary.com/dqasscgat/image/upload/v1714915030/unishine/xnqodglm3qsgqkht8bzp.png',
  name: 'AI',
  content: '',
  isMe: false,
  role: 'assistant',
  status: 0, // 0 加载中 1加载完成 -1生成出错, -2网络错 -3输出中止 2持续输出
  showBtn: false,
})
const myInfo = ref({
  time: '',
  icon: 'https://res.cloudinary.com/dqasscgat/image/upload/v1714913344/unishine/wntnvdqakg3loerrni2c.jpg',
  name: '我',
  content: '',
  isMe: true,
  role: 'user',
  status: 1, // 0 加载中 1加载完成 -1生成出错, -2网络错 -3输出中止 2持续输出
  showBtn: false,
})

const summaryList = ref([])

const keyboardHeight = ref(0)
const sendData = ref([])

const sendDisabled = ref(false)
const sendValue = ref('') // 输入框的值

const initialWindowHeight = ref(0) // 屏幕原始高度

const toTopHeight = ref('') // 内容距离顶部高度

const inputBarHeight = ref(20) // 底部输入框高度，会autoHeight，初始20

const parents = ref({
  title: '',
  subTitle: '',
  key: '',
  icon: '',
  name: '',
}) // 父菜单源

const _child = ref({
  key: '',
  uTitle: '',
  uDesc: '',
}) // 当前子菜单

const segmentedS = ref(['通用设置', '会话设置'])
const segmentedCurrent = ref(0)

// 计算属性
const imPlaceholderheight = computed(() => {
  return keyboardHeight.value + systemInfo.value.safeAreaInsets.bottom
})

const msgListLastPadding = computed(() => {
  return 100 + imPlaceholderheight.value * 2 + 'px'
})

// 计算属性
const msgListHeight = computed(() => {
  // h-11是2.75rem，48px左右，60是底部inputbar高度
  return initialWindowHeight.value - (inputBarHeight.value + 48)
})

function segmentedChange({ currentIndex }) {
  segmentedCurrent.value = currentIndex
}

function inputFocus() {
  showLast()
}

function inputBlur() {
  // keyboardHeight.value = 0
  // 收起键盘
  // uni.hideKeyboard()
}

function onInputValueChange(value) {
  sendValue.value = value
}

async function initSummaryList() {
  await uni.showLoading({ mask: true })
  summaryList.value = await openNewSummary()
  await uni.hideLoading()
  nextTick().then(() => showLast)
}

async function openNewSummary() {
  return [
    {
      time: Date.now(),
      icon: AIinfo.value.icon,
      name: AIinfo.value.name,
      content: '请输入需要总结的文本内容',
      isMe: false,
      role: 'assistant',
      status: 1,
      chatId: generateUniqueId(),
      isPin: false,
      showBtn: false,
      withContent: '',
    },
  ]
}

function inputLineChange() {
  setTimeout(() => {
    nextTick(() => {
      inputBarHeight.value = inputBar.value.$el.scrollHeight
    })
    setScrollHeight()
  }, 100)
}

function setScrollHeight() {
  // #ifdef MP
  // h-11是2.75rem，48px左右，100px的是提示词栏的高度，标题栏20px+4pxpadding
  toTopHeight.value = systemInfo.value.safeAreaInsets.top + 47 + 'px'
  systemInfo.value.windowHeight =
    initialWindowHeight.value - (systemInfo.value.safeAreaInsets.bottom + inputBarHeight.value)
  // #endif

  // #ifndef MP
  toTopHeight.value = 47 + 'px'
  systemInfo.value.windowHeight = initialWindowHeight.value - inputBarHeight.value
  // #endif
}

function popupShow(show) {
  if (sendDisabled.value) {
    return uni.showToast({
      title: '繁忙中，请稍后...',
      icon: 'none',
    })
  }
  // 通过组件定义的ref调用uni-popup方法 ,如果传入参数 ，type 属性将失效 ，仅支持 ['top','left','bottom','right','center']
  popup.value.open(show)
  popupIsShow.value = true
}

function popupClose() {
  popup.value.close()
  popupIsShow.value = false
}

const showLast = debounce(() => {
  // #ifndef H5
  uni.pageScrollTo({
    scrollTop: initialWindowHeight.value,
    duration: 0,
  })
  // #endif
  scrollIntoView.value = 'list-last-item'
  nextTick(() => (scrollIntoView.value = ''))
}, 20)

function updateLastMsg(dck) {
  // dck, 有ai回复格式，也有自定义格式，ai格式为正常格式，自定义格式主要是为error出错设定的，
  const lastData = summaryList.value[summaryList.value.length - 1]
  const { event, message, finishReason } = dck
  switch (event) {
    case 'message:done':
      lastData.content = message?.content
      // 处理一下带finishReason的
      lastData.withContent = finishReason ? `finishReason: ${finishReason}` : ''
      lastData.status = 1
      break
    case 'message:err':
      if (message && !message.content) {
        try {
          lastData.content = ''
        } catch (e) {}
      }
      lastData.status = -2
      break
  }
  showLast()
}

async function doSendAi(val) {
  if (!(val && val.trim())) {
    return
  }

  if (aiStore.localStorageInfo.percent >= 98) {
    return await uni.showToast({
      title: '本地缓存已满，无法使用',
      icon: 'none',
    })
  }

  // 使用异步函数需要确保在组件实例中使用
  if (sendDisabled.value) {
    return await uni.showToast({
      title: 'AI生成中，请稍后...',
      icon: 'none',
    })
  }

  const dataMy = JSON.parse(JSON.stringify(myInfo.value))
  const dataAi = JSON.parse(JSON.stringify(AIinfo.value))
  dataMy.chatId = generateUniqueId()
  dataMy.time = Date.now()
  dataMy.content = val
  summaryList.value.push(dataMy)
  sendData.value.push({ role: dataMy.role, content: dataMy.content })
  dataAi.chatId = generateUniqueId()
  dataAi.time = Date.now()
  summaryList.value.push(dataAi)
  showLast()
  try {
    let query
    try {
      switch (parents.value.key) {
        case 'CLOUDFLARE_AI':
          query = summaryAi(val, mailUserStore.mailUserInfo.name, mailUserStore.mailUserInfo.id)
          break
        case 'GROQ_AI':
          query = summaryAi(val, mailUserStore.mailUserInfo.name, mailUserStore.mailUserInfo.id)
          break
        case 'COZE_AI':
          query = summaryAi(val, mailUserStore.mailUserInfo.name, mailUserStore.mailUserInfo.id)
          break
        case 'GOOGLE_AI':
          query = summaryAi(val, mailUserStore.mailUserInfo.name, mailUserStore.mailUserInfo.id)
          break
        default:
          query = summaryAi(val, mailUserStore.mailUserInfo.name, mailUserStore.mailUserInfo.id)
          break
      }
      const { code, data } = await query
      const msgCode = data.message?.code || 0
      updateLastMsg({
        event: `message:${msgCode === 0 && code === 0 ? 'done' : 'err'}`,
        ...data,
      })
    } catch (e) {
      console.log(e)
      updateLastMsg({
        event: 'message:err',
      })
    }
  } catch (e) {
    updateLastMsg({
      event: 'error',
    })
  }
}

onLoad((option) => {
  try {
    parents.value = JSON.parse(decodeURIComponent(option.parents))
    _child.value = JSON.parse(decodeURIComponent(option.child))
  } catch (e) {
    console.log('页面参数出错')
  }
})

onMounted(async () => {
  systemInfo.value = uni.getSystemInfoSync()
  // #ifdef APP-PLUS
  if (systemInfo.value.safeAreaInsets.bottom === 0) {
    systemInfo.value.safeAreaInsets.bottom = 16
  }
  // #endif

  initialWindowHeight.value = systemInfo.value.windowHeight

  // #ifndef H5
  uni.onKeyboardHeightChange((res) => {
    keyboardHeight.value = res.height
  })
  // #endif
  await initSummaryList()
})

onShow(() => proxy.$pageScroll.stop())
onBeforeUnmount(() => proxy.$pageScroll.move())
</script>

<style lang="scss" scoped>
/* #ifndef APP-NVUE */
page {
  background-color: #ffffff;
}
/* #endif */
.page {
  height: 100vh;
}

.bottom {
  background-color: #f8f8f8;
}

.abort-btn {
  position: relative;
}

.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

.fade-out {
  animation: fadeOut 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.list-last-item {
  padding-bottom: v-bind('msgListLastPadding');
}

.card-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 45px;
  border-top: 1px #eee solid;
}

.card-actions-item {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.card-actions-item-text {
  font-size: 12px;
  color: #666;
  margin-left: 5px;
}

.chat-content-header-btn {
  background: rgb(233, 233, 233);
  padding: 4 px;
  margin: 0 6px;
  border-radius: 8px;
}
</style>
