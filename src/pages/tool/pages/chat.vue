<route lang="json5">
{
  style: { navigationBarTitleText: 'AI Chat', navigationStyle: 'custom', disableScroll: true },
}
</route>
<template>
  <view class="page">
    <uni-nav-bar
      left-icon="left"
      @clickLeft="back"
      class="fixed w-full z-1"
      :shadow="!aiPromptsCutIn"
      :border="false"
      :status-bar="true"
    >
      <template v-slot:default>
        <view class="flex center flex-col flex-1 text-center">
          <view>
            <text style="font-size: 14px" class="font-800">{{ parents.title || 'AI Chat' }}</text>
          </view>
          <view v-if="aiModel">
            <text style="font-size: 12px" line-clamp="1" class="ellipsis-1">
              {{ aiModel }}
            </text>
          </view>
        </view>
      </template>
    </uni-nav-bar>
    <view class="h-11" :style="{ paddingTop: systemInfo.safeAreaInsets?.top + 'px' }"></view>
    <view class="fixed w-full z-9 top-11 flex" v-if="aiPromptsCutIn">
      <uni-collapse ref="collapse">
        <uni-collapse-item
          style="
            background-color: #fffbe8;
            box-shadow: 0 1px 6px #ccc;
            border-bottom-color: rgb(51, 51, 51);
          "
        >
          <template v-slot:title>
            <view
              :style="{
                height: '20px',
                padding: '1px 0',
              }"
              class="flex center"
            >
              <text style="font-size: 14px; color: #aaaaaa">
                当前会话已启用提示词，共{{ prompts2chatItem.length }}条
              </text>
            </view>
          </template>
          <scroll-view :style="{ height: '188px', backgroundColor: '#f8f8f8' }" scroll-y>
            <view class="">
              <!-- 聊天item -->
              <chat-item
                v-for="item in prompts2chatItem"
                :item="item"
                :key="item.chatId"
                :show-cursor="false"
                :show-btn="false"
              ></chat-item>
            </view>
          </scroll-view>
        </uni-collapse-item>
      </uni-collapse>
    </view>
    <view
      class="flex fixed left-0 w-full h-full"
      :style="{ top: toTopHeight }"
      @touchstart="debounce(proxy.$pageScroll.stop(), 350)"
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
          v-for="(item, index) in collection.chatList"
          :item="item"
          :key="item.chatId"
          :show-cursor="false"
          @compose="composeChat"
          @refresh="refreshChat"
          @trash="trashChat"
          @copy="copyChat"
          @addPin="(...args) => addPin(...args, index)"
          @removePin="removePin"
          :show-btn="!!item.showBtn"
          ref="chatItemElement"
        ></chat-item>
        <!-- 底部会话条数 -->
        <view class="flex center">
          <view
            :class="Boolean(collection.chatList.length && !sendDisabled) ? 'fade-in' : 'fade-out'"
            v-show="Boolean(collection.chatList.length && !sendDisabled)"
          >
            <text style="font-size: 22rpx; color: #aaaaaa">
              共{{ collection.chatList.length }}条对话
            </text>
          </view>
        </view>
        <view class="list-last-item" id="list-last-item" key="list-last-item">
          <!-- 高度为0的 最后一个元素用于方便滚动到最后一个元素 -->
        </view>
      </scroll-view>
    </view>

    <!-- 底部聊天输入框 -->
    <!-- #ifdef APP-PLUS -->
    <view class="fixed flex-col flex left-0 bottom-0 w-full">
      <!--  底部停止按钮 -->
      <view class="flex center abort-btn w-full mb-2">
        <view
          :class="
            lastMessage && aiSetStream && !lastMessage.isMe && lastMessage.status === 2
              ? 'fade-in'
              : 'fade-out'
          "
          v-show="lastMessage && aiSetStream && !lastMessage.isMe && lastMessage.status === 2"
        >
          <view class="chat-content-header-btn" style="opacity: 0.8" @click.stop="abortChat">
            <uni-icons type="minus-filled" size="32" color="red"></uni-icons>
          </view>
        </view>
      </view>
      <view class="bottom">
        <chat-input-bar
          ref="inputBar"
          :disabled="sendDisabled"
          @focus="inputFocus"
          @blur="inputBlur"
          @send="doSendAi"
          @leftClick="popupShow('left')"
          @innerLeftClick="innerLeftClickHandle"
          @linechange="inputLineChange"
          :checked="aiSetStream"
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
      <!--  底部停止按钮 -->
      <view class="flex center abort-btn w-full mb-2">
        <view
          :class="
            lastMessage && aiSetStream && !lastMessage.isMe && lastMessage.status === 2
              ? 'fade-in'
              : 'fade-out'
          "
          v-show="lastMessage && aiSetStream && !lastMessage.isMe && lastMessage.status === 2"
        >
          <view class="chat-content-header-btn" style="opacity: 0.8" @click.stop="abortChat">
            <uni-icons type="minus-filled" size="32" color="red"></uni-icons>
          </view>
        </view>
      </view>
      <view class="bottom">
        <chat-input-bar
          ref="inputBar"
          :disabled="sendDisabled"
          @focus="inputFocus"
          @blur="inputBlur"
          @send="doSendAi"
          @linechange="inputLineChange"
          @innerLeftClick="innerLeftClickHandle"
          @leftClick="popupShow('left')"
          :checked="aiSetStream"
          @update:value="onInputValueChange"
          :value="sendValue"
        />
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view class="fixed flex-col flex left-0 bottom-0 w-full">
      <!--  底部停止按钮 -->
      <view class="flex center abort-btn w-full mb-2">
        <view
          :class="
            lastMessage && aiSetStream && !lastMessage.isMe && lastMessage.status === 2
              ? 'fade-in'
              : 'fade-out'
          "
          v-show="lastMessage && aiSetStream && !lastMessage.isMe && lastMessage.status === 2"
        >
          <view class="chat-content-header-btn" style="opacity: 0.8" @click.stop="abortChat">
            <uni-icons type="minus-filled" size="32" color="red"></uni-icons>
          </view>
        </view>
      </view>
      <view class="bottom">
        <chat-input-bar
          ref="inputBar"
          :disabled="sendDisabled"
          @focus="inputFocus"
          @blur="inputBlur"
          @send="doSendAi"
          @leftClick="popupShow('left')"
          @innerLeftClick="innerLeftClickHandle"
          @linechange="inputLineChange"
          :checked="aiSetStream"
          @update:value="onInputValueChange"
          :value="sendValue"
        />
      </view>
    </view>
    <!-- #endif -->
  </view>

  <!-- 底部弹窗 -->
  <uni-popup ref="bottomPopup" :safe-area="false">
    <view style="border-radius: 18px 18px 0 0; background-color: #fff">
      <view
        class="flex center p-2 h-8"
        style="border-radius: 18px 18px 0 0; background-color: #f1f1f1"
      >
        <!--   占位元素     -->
        <view class="" style="opacity: 0"><uni-icons type="closeempty" size="24"></uni-icons></view>
        <view class="flex-1 center font-800"><text style="font-size: 18px">会话设置</text></view>
        <view @click.stop="() => bottomPopup.close()">
          <uni-icons type="closeempty" size="24"></uni-icons>
        </view>
      </view>
      <!--      <uni-segmented-control-->
      <!--        class="pb-2"-->
      <!--        style="background-color: #f1f1f1"-->
      <!--        :current="segmentedCurrent"-->
      <!--        :values="segmentedS"-->
      <!--        :style-type="'text'"-->
      <!--        @clickItem="segmentedChange"-->
      <!--      />-->
      <scroll-view scroll-y :style="{ maxHeight: initialWindowHeight * 0.7 + 'px' }">
        <view
          v-show="segmentedCurrent === 0"
          class="flex flex-col box-border content"
          :class="segmentedCurrent === 0 ? 'fade-in' : 'fade-out'"
        >
          <uni-section
            type="line"
            title="会话上游设置"
            subTitle="对话输入的信息配置"
            titleFontSize="16"
            class="pl-3 pr-3 block"
          >
            <uni-section
              title="预设提示词"
              subTitle="提示词开启后将会插入到会话当中"
              class="pl-3 pr-3 block"
            >
              <template v-slot:right>
                <view @click.stop>
                  <switch
                    @change="aiPromptsCutInChange"
                    :checked="aiPromptsCutIn"
                    color="#FFCC33"
                    style="transform: scale(0.85); padding: 0"
                  />
                </view>
              </template>
              <view class="text-center mb-4">
                <uni-icons
                  @click="addPrompt"
                  type="plusempty"
                  size="32"
                  color="#888888"
                ></uni-icons>
              </view>
              <uni-forms-item v-for="item in aiPrompts" :key="item.id">
                <view class="form-item flex center">
                  <uni-data-select
                    class="max-w-26 pr-2"
                    :clear="false"
                    v-model="item.role"
                    :localdata="chatRolesMap"
                  ></uni-data-select>
                  <uni-easyinput
                    v-model="item.content"
                    :trim="true"
                    placeholder="请输入提示词内容"
                    class="pr-2"
                  />
                  <uni-icons
                    type="clear"
                    size="30"
                    color="red"
                    @click="delPrompt(item.chatId)"
                  ></uni-icons>
                </view>
              </uni-forms-item>
            </uni-section>
          </uni-section>
          <uni-section
            type="line"
            title="会话下游设置"
            titleFontSize="16"
            subTitle="对话输出的信息配置"
            class="pb-10 pl-3 pr-3 block"
          >
            <template v-slot:right>
              <view @click.stop class="flex">
                <button
                  type="default"
                  size="mini"
                  @click="setDefaultOutputConf"
                  style="color: rgba(90, 190, 208, 0.97); padding: 0 6px"
                >
                  恢复默认
                </button>
              </view>
            </template>
            <uni-section
              title="随机性(temperature)"
              subTitle="值越大输出越随机，生成的文本越有创意和多样性"
              class="pl-3 pr-3 block"
            >
              <view class="pl-3 pr-3">
                <uni-number-box
                  :min="0"
                  :max="1"
                  @change="temperatureChange"
                  :value="aiSetOutputConf.temperature"
                  :step="0.1"
                />
              </view>
            </uni-section>
            <uni-section
              title="核采样(top_p)"
              subTitle="核心候选词采样，值越大包含更多概率较低的词语，生成文本更多样，更具创造性"
              class="pl-3 pr-3 block"
            >
              <view class="pl-3 pr-3">
                <uni-number-box
                  @change="topPChange"
                  :min="0"
                  :max="1"
                  :value="aiSetOutputConf.top_p"
                  :step="0.1"
                />
              </view>
            </uni-section>
            <uni-section
              title="前采样(top_k)"
              subTitle="前k个候选词采样，值越大生成结果更具多样性和创造性，但生成结果也会不稳定"
              class="pl-3 pr-3 block"
            >
              <view class="pl-3 pr-3">
                <uni-number-box
                  @change="topKChange"
                  :min="1"
                  :max="100"
                  :value="aiSetOutputConf.top_k"
                  :step="1"
                />
              </view>
            </uni-section>
            <uni-section
              title="单次最大输出量(max_tokens)"
              subTitle="token数取决于具体的文本内容和分词算法，一个词语通常对应一个或多个token"
              class="pl-3 pr-3 block"
            >
              <view class="pl-3 pr-3">
                <slider
                  :value="aiSetOutputConf.max_tokens"
                  :min="10"
                  :max="9999"
                  show-value
                  @change="maxTokensChange"
                  step="1"
                />
              </view>
            </uni-section>
            <uni-section
              title="附带的历史消息数"
              subTitle="每次请求附带的历史消息，使AI能够理解上下文，输出合适的回复"
              class="pl-3 pr-3 block"
            >
              <view class="pl-3 pr-3">
                <slider
                  :value="aiSetOutputConf.history_length"
                  :min="0"
                  :max="32"
                  @change="historyLengthChange"
                  show-value
                  step="1"
                />
              </view>
            </uni-section>
          </uni-section>
        </view>
      </scroll-view>
      <!-- #ifdef MP -->
      <view
        :style="{
          height: systemInfo.safeAreaInsets.bottom + 'px',
          paddingBottom: systemInfo.safeAreaInsets.bottom + 'px',
        }"
      ></view>
      <!-- #endif -->
    </view>
  </uni-popup>

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
          title="流式回复"
          subTitle="消息流式回复，开启体验会更好"
          class="pl-3 pr-3 block"
        >
          <template v-slot:right>
            <view @click.stop>
              <switch
                @change="switchChange"
                :checked="aiSetStream"
                color="#FFCC33"
                style="transform: scale(0.85); padding: 0"
              />
            </view>
          </template>
        </uni-section>
        <uni-section
          title="流式速度"
          subTitle="越小越慢,越大越快。 注: 过快反而缺失流式感"
          class="pl-3 pr-3 block"
        >
          <view :style="{ opacity: !aiSetStream ? '0.3' : '1' }">
            <slider
              :disabled="!aiSetStream"
              :value="aiSetStreamSpeed"
              :min="5"
              show-value
              @change="streamSpeedChange"
              step="5"
            />
          </view>
        </uni-section>
        <uni-section
          title="本地缓存状态"
          subTitle="信息存在本地storage中，请注意缓存状态，缓存占满后将无法使用，请及时清理数据"
          class="pl-3 pr-3 block"
        >
          <view class="progress-box pl-3 pr-3">
            <progress
              :activeColor="aiStore.localStorageInfo.activeColor"
              :percent="aiStore.localStorageInfo.percent"
              show-info
              stroke-width="3"
              :active="true"
              duration="15"
            />
          </view>
        </uni-section>
        <uni-section
          :title="_child.uTitle || 'AI模型'"
          :subTitle="_child.uDesc || '模型为免费开源文本生成模型'"
          label="AI模型选择"
          class="pl-3 pr-3 block"
        >
          <uni-data-select
            v-model="aiModel"
            :localdata="aiModels"
            placeholder="请选择"
            @change="aiModelChange"
            class="llm-select"
          ></uni-data-select>
        </uni-section>
        <uni-section title="刷新模型" subTitle="更新本地缓存模型" class="pl-3 pr-3 block">
          <template v-slot:right>
            <view @click.stop class="flex">
              <button
                type="default"
                size="mini"
                :loading="gettingModels"
                @click="paGetAiModels('refresh')"
                style="color: rgba(90, 190, 208, 0.97); padding: 0 6px"
              >
                点击刷新
              </button>
            </view>
          </template>
        </uni-section>
        <uni-section title="新建聊天" subTitle="打开一个新的聊天" class="pl-3 pr-3 block">
          <uni-card title="新的聊天" extra="共0条对话" margin="0">
            <view class="text-center" @click.stop="openNewChat">
              <uni-icons type="plusempty" size="30" color="#888888"></uni-icons>
            </view>
          </uni-card>
        </uni-section>
        <uni-section title="历史聊天" subTitle="创建的聊天历史" class="pl-3 pr-3 block">
          <template v-slot:right>
            <view class="max-w-32">
              <text style="font-size: 20rpx; color: #dd524d">
                注: 缓存可能丢失,如需要请提前导出到本地
              </text>
            </view>
          </template>
          <uni-card
            :title="item.collectionTitle || '新的聊天'"
            :sub-title="dayjs(item.createat).format('YYYY/MM/DD HH:mm:ss')"
            :extra="`共${item.chatList.length}条对话`"
            :key="item.collId"
            v-for="item in aiStore.aiChatCollection"
            @click="openChat(item)"
            margin="0"
            class="block"
            :style="{ marginBottom: '16px' }"
          >
            <view class="block">
              <text line-clamp="5" style="font-size: 24rpx" class="ellipsis-5">
                {{ item.collectionSubTitle ?? 'null' }}
              </text>
            </view>
            <template v-slot:actions>
              <view class="card-actions">
                <view class="card-actions-item" @click.stop="collActions('share', item)">
                  <uni-icons type="undo" size="18" color="#999"></uni-icons>
                  <text class="card-actions-item-text">分享</text>
                </view>
                <view class="card-actions-item" @click.stop="collActions('export', item)">
                  <uni-icons type="upload" size="18" color="#999"></uni-icons>
                  <text class="card-actions-item-text">导出</text>
                </view>
                <view class="card-actions-item" @click.stop="collActions('trash', item)">
                  <uni-icons type="trash" size="18" color="#999"></uni-icons>
                  <text class="card-actions-item-text">删除</text>
                </view>
              </view>
            </template>
          </uni-card>
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
import dayjs from 'dayjs'
import { back, debounce, generateUniqueId, prettyJson, decodeUtf8, exportJson } from '@/utils'
import {
  conversationAi,
  conversationAiStream,
  conversationAiStreamMp,
  cozeChat,
  cozeChatStream,
  cozeChatStreamMp,
  geminiChat,
  gptChat,
  gptChatStream,
  gptChatStreamMp,
  geminiChatStream,
  geminiChatStreamMp,
  getAiModels,
  getLLMs,
  cozeBots,
  getGems,
} from '@/service/ai'
import { useAiStore } from '@/store/AI'
import { useMailUserStore } from '@/store/mailuser'
import ChatItem from '@/pages/tool/components/chat-item/chat-item.vue'
const { proxy } = getCurrentInstance()

const aiStore = useAiStore()
const mailUserStore = useMailUserStore()

// 创建一个Controller，用于中断请求
// #ifdef H5 || APP-PLUS
let controller = new AbortController()
// #endif

// #ifdef MP
let requestTask
// #endif

const popup = ref(null) // 左侧popup组件
const popupIsShow = ref(false) // popup组件有没展示

const bottomPopup = ref(null) // 底部popup组件

const inputBar = ref(null) // chatInputBar组件

const listContainer = ref(null) // chatitem列表父组件
const chatItemElement = ref([]) // 使用数组存储 chat-item 的 ref
let listContainerObserver = null // 监视器
let resizeObserver = null // 容器高度监视器，监听容器高度变化

const systemInfo = ref({
  safeAreaInsets: {
    bottom: 0,
    top: 0,
  },
  windowHeight: 0,
})

const scrollIntoView = ref('')

const collection = ref<AiChatCollection>({
  collId: '',
  chatList: [],
  createat: 0,
  updateat: 0,
})

const chatRoles = ref<string[]>(['user', 'system', 'assistant'])

const AIinfo = ref({
  time: '',
  icon: 'https://res.cloudinary.com/dqasscgat/image/upload/v1714915030/unishine/xnqodglm3qsgqkht8bzp.png',
  name: 'AI',
  content: '',
  isMe: false,
  role: 'assistant',
  status: 0, // 0 加载中 1加载完成 -1生成出错, -2网络错 -3输出中止 2持续输出
  isPin: false,
  showBtn: false,
  withContent: '', // 内容相关, 例如违法条例等
})
const myInfo = ref({
  time: '',
  icon: 'https://res.cloudinary.com/dqasscgat/image/upload/v1714913344/unishine/wntnvdqakg3loerrni2c.jpg',
  name: '我',
  content: '',
  isMe: true,
  role: 'user',
  status: 1, // 0 加载中 1加载完成 -1生成出错, -2网络错 -3输出中止 2持续输出
  isPin: false,
  showBtn: false,
  withContent: '', // 内容相关, 例如违法条例等
})

const keyboardHeight = ref(0)
const sendData = ref([])
const aiModel = ref('')
const aiModels = ref([])

const aiSetStream = ref(false)
const aiSetStreamSpeed = ref(50) // 流式速度，默认50
const aiPrompts = ref<AiInfo['prompts']>([]) // 提示词
const aiPromptsCutIn = ref(false) // 提示词开关

const _aiSetOutputConf = {
  temperature: 0.5,
  top_p: 1,
  top_k: 1,
  max_tokens: 2048,
  history_length: 4,
}

const aiSetOutputConf = ref<AiInfo['outputConf']>({ ..._aiSetOutputConf }) // ai输出配置

const sendDisabled = ref(false)
const sendValue = ref('') // 输入框的值
const gettingModels = ref(false) // 是否在获取Models

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

const segmentedS = ref(['基本设置', '会话设置'])
const segmentedCurrent = ref(0)

// 计算属性
const imPlaceholderheight = computed(() => {
  return keyboardHeight.value + systemInfo.value.safeAreaInsets.bottom
})

const msgListLastPadding = computed(() => {
  return 100 + imPlaceholderheight.value + 'px'
})

// 计算属性
const msgListHeight = computed(() => {
  // h-11是2.75rem，48px左右，60是底部inputbar高度, 22px是提示词未展开高度
  return initialWindowHeight.value - (60 + 48 + (aiPromptsCutIn.value ? 22 : 0))
})

// 最后一条消息
const lastMessage = computed(() => {
  return collection.value.chatList[collection.value.chatList.length - 1]
})

// 聊天角色
const prompts2chatItem = computed(() => {
  return aiPrompts.value.map((i) => ({
    ...i,
    icon:
      i.role === 'user'
        ? myInfo.value.icon
        : 'https://res.cloudinary.com/dqasscgat/image/upload/v1714915030/unishine/xnqodglm3qsgqkht8bzp.png',
    name: i.role,
    isMe: i.role === 'user',
    status: 1,
    withContent: i.content && i.content.trim() ? '预设提示词' : '无效提示词',
  }))
})

// 聊天角色
const chatRolesMap = computed(() => {
  return chatRoles.value.map((i) => ({
    text: i,
    value: i,
  }))
})

// 监听 message 变化
watch(
  collection,
  (newValue) => {
    aiStore.updateAiCollection(newValue)
    sendDisabled.value = lastMessage.value.status === 0 || lastMessage.value.status === 2
  },
  { deep: true },
)

// 监听 元素 变化
watch(
  () => collection.value.chatList.length,
  () => updateIntersectionObserver(),
)

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

function innerLeftClickHandle() {
  if (sendDisabled.value) {
    return uni.showToast({
      title: '繁忙中，请稍后...',
      icon: 'none',
    })
  }
  // 通过组件定义的ref调用uni-popup方法 ,如果传入参数 ，type 属性将失效 ，仅支持 ['top','left','bottom','right','center']
  bottomPopup.value.open('bottom')
}

function inputLineChange(e) {
  const { height } = e.detail
  inputBarHeight.value = height
  setScrollHeight()
}

function setScrollHeight() {
  // #ifdef MP
  // h-11是2.75rem，48px左右，100px的是提示词栏的高度，标题栏20px+4pxpadding
  toTopHeight.value =
    systemInfo.value.safeAreaInsets.top + (aiPromptsCutIn.value ? 22 : 0) + 47 + 'px'
  systemInfo.value.windowHeight =
    initialWindowHeight.value - (systemInfo.value.safeAreaInsets.bottom + inputBarHeight.value)
  // #endif

  // #ifndef MP
  toTopHeight.value = (aiPromptsCutIn.value ? 22 : 0) + 47 + 'px'
  systemInfo.value.windowHeight = initialWindowHeight.value - inputBarHeight.value
  // #endif
}

function collActions(action, item) {
  switch (action) {
    case 'share':
      uni.showToast({
        icon: 'none',
        title: '正在开发中...',
        duration: 1500,
      })
      break
    case 'export':
      exportJson(
        item,
        item.collectionTitle
          ? item.collectionTitle.substring(0, 5) + dayjs(item.updateat).format('YYYYMMDDHHmmss')
          : item.collId + dayjs(item.updateat).format('YYYYMMDDHHmmss'),
      )
      break
    case 'trash':
      uni.showModal({
        title: '确认删除当前聊天吗？',
        success: (res) => {
          if (res.confirm) {
            if (item.collId === collection.value.collId)
              uni.showToast({
                icon: 'none',
                title: '不能删除当前已打开聊天',
                duration: 1500,
              })
            else res.confirm && aiStore.delAiCollection(item)
          }
        },
      })
      break
  }
}

function addPrompt() {
  if (aiPrompts.value.length >= 9)
    return uni.showToast({
      icon: 'none',
      title: '无法再添加提示词',
      duration: 1500,
    })
  aiPrompts.value.push({ role: 'system', content: '', chatId: generateUniqueId() })
  setAiPrompts()
}

function delPrompt(id) {
  const idx = aiPrompts.value.findIndex((i) => i?.chatId === id)
  const itIdx = collection.value.chatList.findIndex((i) => i.chatId === id)
  aiPrompts.value.splice(idx, 1)
  collection.value.chatList[itIdx].isPin = false
  setAiPrompts()
}

function setAiPrompts() {
  switch (parents.value.key) {
    case 'CLOUDFLARE_AI':
      aiStore.setAiInfoByKey('prompts', aiPrompts.value)
      break
    case 'GROQ_AI':
      aiStore.setGroqInfoByKey('prompts', aiPrompts.value)
      break
    case 'COZE_AI':
      aiStore.setBotInfoByKey('prompts', aiPrompts.value)
      break
    case 'GOOGLE_AI':
      aiStore.setGeminiInfoByKey('prompts', aiPrompts.value)
      break
    default:
      aiStore.setAiInfoByKey('prompts', aiPrompts.value)
      break
  }
}

async function openChat(item) {
  if (item.collId === collection.value.collId)
    return await uni.showToast({
      icon: 'none',
      title: '当前聊天已经打开',
      duration: 1500,
    })
  await uni.showLoading({ mask: true })
  collection.value = setChatCollection(item)
  popupClose()
  nextTick().then(() => showLast())
  await uni.hideLoading()
}

function openNewChat() {
  if (aiStore.aiChatCollection.length >= 99)
    return uni.showToast({
      icon: 'none',
      title: '无法再新增聊天，请先删除旧的聊天',
      duration: 1500,
    })
  collection.value = createChatCollection()
  aiStore.unshiftAiCollection(collection.value)
  popupClose()
}

function composeChat({ chatId }) {
  const it = collection.value.chatList.find((i) => i.chatId === chatId)
  if (it) {
    onInputValueChange(it.content)
  }
}

function addPin({ chatId, content, role }, itIdx) {
  const idx = aiPrompts.value.findIndex((i) => i?.chatId === chatId)
  if (idx >= 0) return
  if (aiPrompts.value.length >= 9)
    return uni.showToast({
      icon: 'none',
      title: '无法再继续添加提示词',
      duration: 1500,
    })
  aiPrompts.value.push({ role, content, chatId })
  collection.value.chatList[itIdx].isPin = true
  setAiPrompts()
  const tips = `已添加到预设提示词${aiPromptsCutIn.value ? '' : '，当前未启用提示词，开启提示词方可生效'}`
  return uni.showToast({
    icon: 'none',
    title: tips,
    duration: 2000,
  })
}

function removePin({ chatId }) {
  delPrompt(chatId)
}

function refreshChat({ chatId }) {
  if (sendDisabled.value) {
    return uni.showToast({
      title: '繁忙中，请稍后...',
      icon: 'none',
    })
  }
  if (!aiModel.value) {
    return uni.showToast({
      title: '请先选择一个AI模型，点击左下角设置',
      icon: 'none',
    })
  }
  const itIdx = collection.value.chatList.findIndex((i) => i.chatId === chatId)
  const it = collection.value.chatList[itIdx]
  if (it && it.isMe && it.content) {
    collection.value.chatList.splice(itIdx, 1)
    doSendAi(it.content)
  }
}

function abortChat() {
  // #ifdef H5 || APP-PLUS
  controller.abort('manualAbort')
  // 触发后重新new 一个
  controller = new AbortController()
  // #endif

  // #ifdef MP
  console.log('请求已取消')
  requestTask && requestTask?.abort('manualAbort')
  updateLastMsg({
    event: 'abort',
  })
  // #endif
}

function trashChat({ chatId }) {
  if (chatId) {
    collection.value.chatList.splice(
      collection.value.chatList.findIndex((i) => i.chatId === chatId),
      1,
    )
  }
}

function copyChat({ chatId }) {
  const it = collection.value.chatList.find((i) => i.chatId === chatId)
  if (it) {
    uni.setClipboardData({
      data: it.content,
      success: () => {
        uni.showToast({
          title: '复制成功',
          icon: 'none',
        })
      },
    })
  }
}

function setDefaultOutputConf() {
  uni.showModal({
    title: '确认恢复默认配置吗？',
    success: () => {
      aiSetOutputConf.value = { ..._aiSetOutputConf }
      aiSetOutputConfChange()
    },
  })
}

function temperatureChange(val) {
  aiSetOutputConf.value.temperature = val
  aiSetOutputConfChange()
}

function topPChange(val) {
  aiSetOutputConf.value.top_p = val
  aiSetOutputConfChange()
}

function topKChange(val) {
  aiSetOutputConf.value.top_k = val
  aiSetOutputConfChange()
}

function maxTokensChange({ detail: { value } }) {
  aiSetOutputConf.value.max_tokens = value
  debounce(aiSetOutputConfChange, 100)
}

function historyLengthChange({ detail: { value } }) {
  aiSetOutputConf.value.history_length = value
  debounce(aiSetOutputConfChange, 100)
}

function aiSetOutputConfChange() {
  switch (parents.value.key) {
    case 'CLOUDFLARE_AI':
      aiStore.setAiInfoByKey('outputConf', aiSetOutputConf.value)
      break
    case 'GROQ_AI':
      aiStore.setGroqInfoByKey('outputConf', aiSetOutputConf.value)
      break
    case 'COZE_AI':
      aiStore.setBotInfoByKey('outputConf', aiSetOutputConf.value)
      break
    case 'GOOGLE_AI':
      aiStore.setGeminiInfoByKey('outputConf', aiSetOutputConf.value)
      break
    default:
      aiStore.setAiInfoByKey('outputConf', aiSetOutputConf.value)
      break
  }
}

function aiPromptsCutInChange() {
  aiPromptsCutIn.value = !aiPromptsCutIn.value
  switch (parents.value.key) {
    case 'CLOUDFLARE_AI':
      aiStore.setAiInfoByKey('promptsCutIn', aiPromptsCutIn.value)
      break
    case 'GROQ_AI':
      aiStore.setGroqInfoByKey('promptsCutIn', aiPromptsCutIn.value)
      break
    case 'COZE_AI':
      aiStore.setBotInfoByKey('promptsCutIn', aiPromptsCutIn.value)
      break
    case 'GOOGLE_AI':
      aiStore.setGeminiInfoByKey('promptsCutIn', aiPromptsCutIn.value)
      break
    default:
      aiStore.setAiInfoByKey('promptsCutIn', aiPromptsCutIn.value)
      break
  }
  setScrollHeight()
}

function switchChange(e) {
  aiSetStream.value = !aiSetStream.value
  switch (parents.value.key) {
    case 'CLOUDFLARE_AI':
      aiStore.setAiInfoByKey('aiStream', aiSetStream.value)
      break
    case 'GROQ_AI':
      aiStore.setGroqInfoByKey('aiStream', aiSetStream.value)
      break
    case 'COZE_AI':
      aiStore.setBotInfoByKey('botStream', aiSetStream.value)
      break
    case 'GOOGLE_AI':
      aiStore.setGeminiInfoByKey('aiStream', aiSetStream.value)
      break
    default:
      aiStore.setAiInfoByKey('aiStream', aiSetStream.value)
      break
  }
}

function streamSpeedChange(e) {
  aiSetStreamSpeed.value = e.detail.value
  switch (parents.value.key) {
    case 'CLOUDFLARE_AI':
      aiStore.setAiInfoByKey('streamSpeed', aiSetStreamSpeed.value)
      break
    case 'GROQ_AI':
      aiStore.setGroqInfoByKey('streamSpeed', aiSetStreamSpeed.value)
      break
    case 'COZE_AI':
      aiStore.setBotInfoByKey('streamSpeed', aiSetStreamSpeed.value)
      break
    case 'GOOGLE_AI':
      aiStore.setGeminiInfoByKey('streamSpeed', aiSetStreamSpeed.value)
      break
    default:
      aiStore.setAiInfoByKey('streamSpeed', aiSetStreamSpeed.value)
      break
  }
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

function createChatCollection(): AiChatCollection {
  return {
    collId: generateUniqueId(),
    createat: Date.now(),
    updateat: Date.now(),
    chatList: [
      {
        time: Date.now(),
        icon: AIinfo.value.icon,
        name: AIinfo.value.name,
        content: '有什么可以帮你的吗',
        isMe: false,
        role: 'assistant',
        status: 1,
        chatId: generateUniqueId(),
        isPin: false,
        showBtn: false,
        withContent: '',
      },
    ],
  }
}

function setChatCollection(coll?: AiChatCollection): AiChatCollection {
  return {
    ...coll,
    chatList: coll.chatList.map((i) => ({
      ...i,
      status: i.status === 0 || i.status === 2 ? -1 : i.status, // 把进行时状态改成-1
    })),
  }
}

async function initChatList() {
  await uni.showLoading({ mask: true })
  initAiInfo()
  await paGetAiModels()
  const chatCollection = aiStore.aiChatCollection
  if (!chatCollection.length) await openNewChat()
  else await openChat(chatCollection[0])
  await uni.hideLoading()
  nextTick().then(() => showLast)
}

function initAiInfo() {
  AIinfo.value.icon = parents.value.icon || AIinfo.value.icon
  AIinfo.value.name = parents.value.name || AIinfo.value.name
}

function aiModelChange(val) {
  aiModel.value = val
  switch (parents.value.key) {
    case 'CLOUDFLARE_AI':
      aiStore.setAiInfoByKey('aiModel', val)
      break
    case 'GROQ_AI':
      aiStore.setGroqInfoByKey('aiModel', val)
      break
    case 'COZE_AI':
      aiStore.setBotInfoByKey('botId', val)
      break
    case 'GOOGLE_AI':
      aiStore.setGeminiInfoByKey('aiModel', val)
      break
    default:
      aiStore.setAiInfoByKey('aiModel', val)
      break
  }
  popupClose()
}

function updateLastMsg(dck) {
  // dck, 有ai回复格式，也有自定义格式，ai格式为正常格式，自定义格式主要是为error出错设定的，
  const dataAi = JSON.parse(JSON.stringify(AIinfo.value))
  const lastData = collection.value.chatList[collection.value.chatList.length - 1]
  const { event, message, finishReason } = dck
  switch (event) {
    case 'message':
      lastData.content += message?.content
      // 处理一下带finishReason的
      lastData.withContent = finishReason ? `finishReason: ${finishReason}` : ''
      lastData.status = 2
      break
    case 'done':
      lastData.status = 1
      break
    case 'error':
      if (!lastData.content && message) {
        try {
          lastData.content = prettyJson(message)
        } catch (e) {}
        lastData.status = -2
      } else lastData.status = -1
      break
    case 'abort':
      lastData.status = -3
      break
    case 'message:done':
      lastData.content = message?.content
      // 处理一下带finishReason的
      lastData.withContent = finishReason ? `finishReason: ${finishReason}` : ''
      lastData.status = 1
      break
    case 'message:err':
      if (message && !message.content) {
        try {
          lastData.content = prettyJson(message)
        } catch (e) {}
      }
      lastData.status = -2
      break
  }
  if (message?.summarize) {
    sendData.value = [{ role: dataAi.role, content: message.summarize }]
  }
  showLast()
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
}, 30)

async function paGetAiModels(action: 'init' | 'refresh' = 'init') {
  switch (parents.value.key) {
    case 'CLOUDFLARE_AI':
      await setCloudflareAiInfo(action)
      break
    case 'GROQ_AI':
      await setGroqAiInfo(action)
      break
    case 'COZE_AI':
      await setCozeAiInfo(action)
      break
    case 'GOOGLE_AI':
      await setGeminiInfo(action)
      break
    default:
      await setCloudflareAiInfo(action)
      break
  }
}

async function getModels(): Promise<any[]> {
  let res
  gettingModels.value = true
  try {
    switch (parents.value.key) {
      case 'CLOUDFLARE_AI':
        res = await getAiModels(mailUserStore.mailUserInfo.id)
        break
      case 'GROQ_AI':
        res = await getLLMs(mailUserStore.mailUserInfo.id)
        break
      case 'COZE_AI':
        res = await cozeBots(mailUserStore.mailUserInfo.id)
        break
      case 'GOOGLE_AI':
        res = await getGems(mailUserStore.mailUserInfo.id)
        break
      default:
        res = await getAiModels(mailUserStore.mailUserInfo.id)
        break
    }
  } catch (e) {}
  gettingModels.value = false
  const { data: aimodels } = res
  if (Array.isArray(aimodels)) {
    return [...aimodels]
  }
  return []
}

async function setCloudflareAiInfo(action: string) {
  const {
    aiModel: amod,
    aiModels: amods,
    aiStream: astr,
    streamSpeed,
    prompts,
    promptsCutIn,
    outputConf,
  } = aiStore.aiInfo
  const setModels = async () => {
    const llms = await getModels()
    if (llms?.length) {
      const beforeLength = aiModels.value.length
      aiModels.value = llms.map((i) => ({ text: i, value: i }))
      const afterLength = aiModels.value.length
      aiStore.setAiInfoByKey('aiModels', aiModels.value)
      await uni.showToast({
        title: `模型已刷新,新增${afterLength - beforeLength}条`,
        icon: 'none',
      })
    } else {
      await uni.showToast({
        title: '未获取到AI模型',
        icon: 'none',
      })
    }
  }
  if (action === 'refresh') {
    await setModels()
  } else {
    if (Array.isArray(amods) && amods.length) aiModels.value = amods
    else await setModels()
  }
  aiModel.value = amod || ''
  aiSetStream.value = astr
  aiSetStreamSpeed.value = streamSpeed
  aiPrompts.value = prompts
  aiPromptsCutIn.value = promptsCutIn
  aiSetOutputConf.value = outputConf
}

async function setGroqAiInfo(action: string) {
  const {
    aiModel: amod,
    aiModels: amods,
    aiStream: astr,
    streamSpeed,
    prompts,
    promptsCutIn,
    outputConf,
  } = aiStore.groqInfo
  const setModels = async () => {
    const llms = await getModels()
    if (llms?.length) {
      const beforeLength = aiModels.value.length
      aiModels.value = llms.map((i) => ({ text: i, value: i }))
      const afterLength = aiModels.value.length
      aiStore.setGroqInfoByKey('aiModels', aiModels.value)
      await uni.showToast({
        title: `模型已刷新,新增${afterLength - beforeLength}条`,
        icon: 'none',
      })
    } else {
      await uni.showToast({
        title: '未获取到AI模型',
        icon: 'none',
      })
    }
  }
  if (action === 'refresh') {
    await setModels()
  } else {
    if (Array.isArray(amods) && amods.length) aiModels.value = amods
    else await setModels()
  }
  aiModel.value = amod || ''
  aiSetStream.value = astr
  aiSetStreamSpeed.value = streamSpeed
  aiPrompts.value = prompts
  aiPromptsCutIn.value = promptsCutIn
  aiSetOutputConf.value = outputConf
}

async function setCozeAiInfo(action: string) {
  const {
    botId: amod,
    bots: amods,
    botStream: astr,
    botName,
    streamSpeed,
    prompts,
    promptsCutIn,
    outputConf,
  } = aiStore.botInfo
  const setModels = async () => {
    const llms = await getModels()
    if (llms?.length > 0) {
      const beforeLength = aiModels.value.length
      aiModels.value = llms.map((i) => ({
        text: `${i.bot_id}-${i.bot_llm}`,
        value: i.bot_id,
      }))
      const afterLength = aiModels.value.length
      aiStore.setBotInfoByKey('bots', aiModels.value)
      await uni.showToast({
        title: `模型已刷新,新增${afterLength - beforeLength}条`,
        icon: 'none',
      })
    } else {
      await uni.showToast({
        title: '未获取到AI模型',
        icon: 'none',
      })
    }
  }
  if (action === 'refresh') {
    await setModels()
  } else {
    if (Array.isArray(amods) && amods.length) aiModels.value = amods
    else await setModels()
  }
  aiModel.value = amod || ''
  aiSetStream.value = astr
  aiSetStreamSpeed.value = streamSpeed
  aiPrompts.value = prompts
  aiPromptsCutIn.value = promptsCutIn
  aiSetOutputConf.value = outputConf
}

async function setGeminiInfo(action: string) {
  const {
    aiModel: amod,
    aiModels: amods,
    aiStream: astr,
    streamSpeed,
    prompts,
    promptsCutIn,
    outputConf,
  } = aiStore.geminiInfo
  const setModels = async () => {
    const llms = await getModels()
    if (llms?.length) {
      const beforeLength = aiModels.value.length
      aiModels.value = llms.map((i) => ({ text: i, value: i }))
      const afterLength = aiModels.value.length
      aiStore.setGeminiInfoByKey('aiModels', aiModels.value)
      await uni.showToast({
        title: `模型已刷新,新增${afterLength - beforeLength}条`,
        icon: 'none',
      })
    } else {
      await uni.showToast({
        title: '未获取到AI模型',
        icon: 'none',
      })
    }
  }
  if (action === 'refresh') {
    await setModels()
  } else {
    if (Array.isArray(amods) && amods.length) aiModels.value = amods
    else await setModels()
  }
  aiModel.value = amod || ''
  aiSetStream.value = astr
  aiSetStreamSpeed.value = streamSpeed
  aiPrompts.value = prompts
  aiPromptsCutIn.value = promptsCutIn
  aiSetOutputConf.value = outputConf
}

async function doSendAi(val) {
  if (!(val && val.trim())) {
    return
  }
  if (!aiModel.value) {
    return await uni.showToast({
      title: '请先选择一个AI模型，点击左下角设置',
      icon: 'none',
    })
  }

  // 使用异步函数需要确保在组件实例中使用
  if (sendDisabled.value) {
    return await uni.showToast({
      title: 'AI回答中，请稍后...',
      icon: 'none',
    })
  }

  const dataMy = JSON.parse(JSON.stringify(myInfo.value))
  const dataAi = JSON.parse(JSON.stringify(AIinfo.value))
  dataMy.chatId = generateUniqueId()
  dataMy.time = Date.now()
  dataMy.content = val
  collection.value.chatList.push(dataMy)
  sendData.value.push({ role: dataMy.role, content: dataMy.content })
  dataAi.chatId = generateUniqueId()
  dataAi.time = Date.now()
  collection.value.chatList.push(dataAi)
  showLast()
  try {
    let queryStream, query
    if (aiSetStream.value) {
      const opts = {
        content: val,
        name: mailUserStore.mailUserInfo.name,
        uid: mailUserStore.mailUserInfo.id,
        collId: collection.value.collId,
        streamSpeed: aiSetStreamSpeed.value,
        prompts: aiPromptsCutIn.value ? aiPrompts.value : [],
        outputConf: aiSetOutputConf.value,
      }
      // #ifdef H5 || APP-PLUS
      const conf = { signal: controller.signal }
      // #endif
      switch (parents.value.key) {
        case 'CLOUDFLARE_AI':
          // #ifdef MP
          queryStream = conversationAiStreamMp({ ...opts, aimodel: aiModel.value })
          // #endif
          // #ifdef H5 || APP-PLUS
          queryStream = conversationAiStream({ ...opts, aimodel: aiModel.value }, conf)
          // #endif
          break
        case 'GROQ_AI':
          // #ifdef MP
          queryStream = gptChatStreamMp({ ...opts, aimodel: aiModel.value })
          // #endif
          // #ifdef H5 || APP-PLUS
          queryStream = gptChatStream({ ...opts, aimodel: aiModel.value }, conf)
          // #endif
          break
        case 'COZE_AI':
          // #ifdef MP
          queryStream = cozeChatStreamMp({ ...opts, botId: aiModel.value })
          // #endif
          // #ifdef H5 || APP-PLUS
          queryStream = cozeChatStream({ ...opts, botId: aiModel.value }, conf)
          // #endif
          break
        case 'GOOGLE_AI':
          // #ifdef MP
          queryStream = geminiChatStreamMp({ ...opts, aimodel: aiModel.value })
          // #endif
          // #ifdef H5 || APP-PLUS
          queryStream = geminiChatStream({ ...opts, aimodel: aiModel.value }, conf)
          // #endif
          break
        default:
          // #ifdef MP
          queryStream = conversationAiStreamMp({ ...opts, aimodel: aiModel.value })
          // #endif
          // #ifdef H5 || APP-PLUS
          queryStream = conversationAiStream({ ...opts, aimodel: aiModel.value }, conf)
          // #endif
          break
      }
      // #ifdef MP
      await handleTask(queryStream)
      // #endif
      // #ifdef H5 || APP-PLUS
      await handleQuery(queryStream)
      // #endif
    } else {
      try {
        switch (parents.value.key) {
          case 'CLOUDFLARE_AI':
            query = conversationAi(
              val,
              aiModel.value,
              mailUserStore.mailUserInfo.name,
              mailUserStore.mailUserInfo.id,
              collection.value.collId,
              aiPromptsCutIn.value ? aiPrompts.value : [],
              aiSetOutputConf.value,
            )
            break
          case 'GROQ_AI':
            query = gptChat(
              val,
              aiModel.value,
              mailUserStore.mailUserInfo.name,
              mailUserStore.mailUserInfo.id,
              collection.value.collId,
              aiPromptsCutIn.value ? aiPrompts.value : [],
              aiSetOutputConf.value,
            )
            break
          case 'COZE_AI':
            query = cozeChat(
              val,
              aiModel.value,
              mailUserStore.mailUserInfo.name,
              mailUserStore.mailUserInfo.id,
              collection.value.collId,
              aiPromptsCutIn.value ? aiPrompts.value : [],
              aiSetOutputConf.value,
            )
            break
          case 'GOOGLE_AI':
            query = geminiChat(
              val,
              aiModel.value,
              mailUserStore.mailUserInfo.name,
              mailUserStore.mailUserInfo.id,
              collection.value.collId,
              aiPromptsCutIn.value ? aiPrompts.value : [],
              aiSetOutputConf.value,
            )
            break
          default:
            query = conversationAi(
              val,
              aiModel.value,
              mailUserStore.mailUserInfo.name,
              mailUserStore.mailUserInfo.id,
              collection.value.collId,
              aiPromptsCutIn.value ? aiPrompts.value : [],
              aiSetOutputConf.value,
            )
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
    }
  } catch (e) {
    updateLastMsg({
      event: 'error',
    })
  }
}

async function handleQuery(queryStream) {
  queryStream
    .then((response) => {
      // 这里监听消息
      return response?.body.getReader()
    })
    .then(async (reader) => {
      const decoder = new TextDecoder()
      let chunks = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        chunks += decoder.decode(value, { stream: true })
        const parts = chunks.split('\n\n')
        chunks = parts.pop() ?? ''
        for (const part of parts) {
          const p = part.split('data: ')[1]
          updateLastMsg(JSON.parse(p))
        }
      }
      // 循环结束需要看下状态，如果是进行时状态需要给它改成完成，不然会卡着
      // TODO 因为循环已结束，状态未改变说明sse没有发送done事件，暂且将这种为生成错误
      if (sendDisabled.value) {
        updateLastMsg({
          event: 'error',
        })
      }
    })
    .catch((e) => {
      console.log(e)
      if (e.name === 'AbortError') {
        console.log('请求已取消')
        updateLastMsg({
          event: 'abort',
        })
      } else {
        updateLastMsg({
          event: 'error',
        })
      }
    })
}

async function handleTask(queryStream) {
  // sse事件超时，状态未改变说明sse没有发送done事件，暂且将这种为生成错误
  // 这里如果没有停止的话让用户手动停止，体验不是很好
  // 循环结束需要看下状态，如果是进行时状态需要给它改成完成，不然会卡着
  let timeout = 15
  const timer = setInterval(() => {
    --timeout
    console.log(timeout, sendDisabled.value)
    if (!sendDisabled.value) {
      clearInterval(timer)
    }
    if (timeout <= 0) {
      updateLastMsg({
        event: 'error',
      })
      clearInterval(timer)
    }
  }, 1000)
  queryStream
    .then((result) => {
      requestTask = result.task // 赋值全局requestTask
      const initialChunks = result.chunks // 获取初始数据块
      const decodeChunks = initialChunks.map((i) => decodeUtf8(i)) // 处理
      let addedInitialChunk = false // 是否添加初始chunk
      // 这里监听消息
      result.task.onChunkReceived(function (res) {
        timeout = 15 // 有进入chunkReceived说明sse是正常，重置下倒计时
        let chunks = ''
        if (!addedInitialChunk) {
          chunks += decodeChunks.join('') // 添加初始数据块
          addedInitialChunk = true
        }
        chunks += decodeUtf8(res.data)
        const parts = chunks.split('\n\n')
        // chunks = parts.pop() ?? ''
        for (const part of parts) {
          const p = part.split('data: ')[1]
          if (/^data:/.test(part)) {
            try {
              updateLastMsg(JSON.parse(p))
            } catch (e) {}
          }
        }
      })
    })
    .catch((err) => {
      console.log(err)
      updateLastMsg({
        event: 'error',
      })
      clearInterval(timer)
    })
}

function setHeight() {
  // #ifdef MP
  // h-11是2.75rem，48px左右，100px的是提示词栏的高度，标题栏18px+4pxpadding
  toTopHeight.value =
    systemInfo.value.safeAreaInsets.top + (aiPromptsCutIn.value ? 18 : 0) + 47 + 'px'
  systemInfo.value.windowHeight -= systemInfo.value.safeAreaInsets.bottom + inputBarHeight.value
  // #endif

  // #ifndef MP
  toTopHeight.value = (aiPromptsCutIn.value ? 18 : 0) + 47 + 'px'
  systemInfo.value.windowHeight -= inputBarHeight.value
  // #endif
}

// 更新 IntersectionObserver
function updateIntersectionObserver() {
  if (listContainerObserver) {
    listContainerObserver.disconnect()
  }
  listContainerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry: any) => {
        const index = entry.target.dataset.index
        collection.value.chatList[index].showBtn = !!entry.isIntersecting
      })
    },
    {
      // 获取 ref 对象对应的 DOM 节点
      root: listContainer.value ? listContainer.value.$el : null,
      threshold: 0.8, // 可以根据需要动态计算
    },
  )
  // 重新监听所有 chat-item 元素
  nextTick(() => {
    chatItemElement.value.forEach((item, index) => {
      const targetElement = item.$refs?.chatItemHeader
      if (targetElement) {
        targetElement.$el.dataset.index = index
        listContainerObserver.observe(targetElement.$el)
      }
    })
  })
}

function onObserver() {
  // 创建 ResizeObserver 实例
  resizeObserver = new ResizeObserver(() => {
    // 容器大小发生变化时触发
    // 在 DOM 更新后更新 IntersectionObserver
    nextTick(updateIntersectionObserver)
  })
  // 监听容器高度变化
  resizeObserver.observe(listContainer.value.$el)
}

function offObserver() {
  if (listContainerObserver) {
    listContainerObserver.disconnect() // 组件卸载时停止观察
    listContainerObserver = null
  }
  // 停止监听容器高度变化
  resizeObserver.disconnect()
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
  await initChatList()

  setHeight()

  onObserver()
})

onShow(() => proxy.$pageScroll.stop())
onBeforeUnmount(() => {
  offObserver()
  proxy.$pageScroll.move()
})
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

/*
//.safe-bottom {
//  padding-bottom: constant(safe-area-inset-bottom) !important;
//  padding-bottom: env(safe-area-inset-bottom) !important;
//}

//.msg-list {
//position: fixed;
//left: 0;
//}

//.list-first-item {
//  position: fixed;
//  height: 40px;
//  top: -40px;
//  left: 0;
//}
*/

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
