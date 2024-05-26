<route lang="json5">
{
  style: { usingComponents: { towxml: '/wxcomponents/towxml/towxml' } },
  layout: 'component',
}
</route>
<!-- 聊天item -->
<template>
  <view class="chat-item" @touchmove.stop.prevent>
    <view :class="{ 'chat-container': true, 'chat-location-me': dtoItem.isMe }">
      <view :class="{ 'chat-content-container': true, 'chat-content-container-me': dtoItem.isMe }">
        <view :class="{ 'chat-content-header': true, 'chat-content-header-me': dtoItem.isMe }">
          <view class="chat-icon-container">
            <image class="chat-icon" :src="dtoItem.icon" mode="aspectFill" />
          </view>
          <view :class="dtoItem.isMe ? 'pr-2' : 'pl-2'">
            <text :class="{ 'chat-user-name': true, 'chat-location-me': dtoItem.isMe }">
              {{ dtoItem.name }}
            </text>
          </view>
          <view
            class="flex"
            :class="(dtoItem.isMe ? 'mr-2' : 'ml-2', showBtn ? 'fade-in' : 'fade-out')"
            v-if="dtoItem.status !== 0 && dtoItem.status !== 2 && showBtn"
          >
            <view class="chat-content-header-btn" @click="$emit('compose', item)">
              <uni-icons type="compose" size="22"></uni-icons>
            </view>
            <view
              v-if="dtoItem.isMe"
              class="chat-content-header-btn"
              @click="$emit('refresh', item)"
            >
              <uni-icons type="refreshempty" size="22"></uni-icons>
            </view>
            <view class="chat-content-header-btn" @click="$emit('trash', item)">
              <uni-icons type="trash" size="22"></uni-icons>
            </view>
            <view
              class="chat-content-header-btn"
              :style="{ backgroundColor: item.isPin ? '#f1f1f1' : '#ffffff' }"
              @click="$emit(item.isPin ? 'remove-pin' : 'add-pin', item)"
            >
              <uni-icons
                custom-prefix="iconfont"
                :type="item.isPin ? 'icon-pin-fill' : 'icon-pin'"
                size="22"
              ></uni-icons>
            </view>
            <view class="chat-content-header-btn" @click="$emit('copy', item)">
              <uni-icons custom-prefix="iconfont" type="icon-copy" size="22"></uni-icons>
            </view>
          </view>
        </view>
        <view
          :class="{
            'chat-text-container': true,
            'chat-text-container-me': dtoItem.isMe,
            'show-cursor': showCursor,
          }"
        >
          <view
            v-if="!dtoItem.isMe && dtoItem.status !== 0"
            class="rich-text-box"
            :class="{ 'show-cursor': showCursor }"
            ref="rich-text-box"
          >
            <!-- #ifndef MP -->
            <rich-text
              v-if="nodes && nodes.length"
              space="nbsp"
              :nodes="nodes"
              @itemclick="trOnclick"
            ></rich-text>
            <!-- #endif -->
            <!-- #ifdef MP -->
            <towxml :nodes="nodes" v-if="nodes"></towxml>
            <!-- #endif -->
            <text class="char-text" v-else selectable user-select>&nbsp;&nbsp;...&nbsp;&nbsp;</text>
          </view>
          <view v-else>
            <text selectable user-select v-if="dtoItem.status !== 0" class="char-text char-text-me">
              {{ dtoItem.content }}
            </text>
          </view>
          <text class="cursor" v-if="dtoItem.status === 2"></text>
          <view class="loading" v-if="dtoItem.status === 0">
            <view class="loading__bar"></view>
            <view class="loading__bar"></view>
            <view class="loading__bar"></view>
            <view class="loading__bar"></view>
            <view class="loading__bar"></view>
          </view>
        </view>
      </view>
    </view>
    <view :class="{ 'chat-foot': true, 'chat-foot-me': dtoItem.isMe }">
      <text class="chat-time" v-if="dtoItem.status === 0">正在加载...</text>
      <text class="chat-time" v-else-if="dtoItem.status === 2">正在输入...</text>
      <text class="chat-time" v-else>
        {{ dtoItem.time ? dtoItem.time : '' }}
      </text>
      <text class="chat-violation" selectable user-select v-if="dtoItem.withContent">
        {{ dtoItem.withContent }}
      </text>
      <text class="chat-error" selectable user-select v-if="!dtoItem.isMe && dtoItem.status === -1">
        generate error
      </text>
      <text
        class="chat-error"
        selectable
        user-select
        v-else-if="!dtoItem.isMe && dtoItem.status === -2"
      >
        request error
      </text>
      <text
        class="chat-error"
        selectable
        user-select
        v-else-if="!dtoItem.isMe && dtoItem.status === -3"
      >
        aborted
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
// 引入markdown-it库
import MarkdownIt from '@/lib/markdown-it.min'
// hljs是由 Highlight.js 经兼容性修改后的文件，请勿直接升级。否则会造成uni-app-vue3-Android下有兼容问题
import hljs from '@/lib/highlight/highlight-uni.min'
// 引入html-parser.js库
import parseHtml from '@/lib/html-parser'

// mp解析html，markdown
// #ifdef MP
import { towxml } from '@/wxcomponents/towxml/index.js'
// #endif

const codeDataList = ref([]) // 代码复制

// 初始化 MarkdownIt库
const markdownIt = MarkdownIt({
  // 在源码中启用 HTML 标签
  html: true,
  breaks: true,
  typographer: true,
  // 如果结果以 <pre ... 开头，内部包装器则会跳过。
  highlight: function (str, lang) {
    // 经过highlight.js处理后的html
    let preCode = ''
    try {
      preCode = hljs.highlightAuto(str).value
    } catch (err) {
      preCode = markdownIt.utils.escapeHtml(str)
    }
    // 以换行进行分割
    const lines = preCode.split(/\n/).slice(0, -1)
    // 添加自定义行号
    let html = lines
      .map((item, index) => {
        // 去掉空行
        if (item === '') {
          return ''
        }
        return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
      })
      .join('')
    html = '<ol style="padding: 0px 28px;">' + html + '</ol>'
    // 代码复制功能
    codeDataList.value.push(str)
    let htmlCode = `<div style="background:#0d1117;margin-top: 5px;color: #888;padding:5px 0;border-radius: 5px;">`
    // #ifndef MP
    htmlCode += `<div style="text-align: end;font-size: 12px;">`
    htmlCode += `${lang}<a class="copy-btn" code-data-index="${codeDataList.value.length - 1}" style="cursor: pointer;"> 复制 </a>`
    htmlCode += `</div>`
    // #endif
    htmlCode += `<pre class="hljs" style="padding:0 8px;margin-bottom:5px;overflow: auto;display: block;border-radius: 5px;"><code>${html}</code></pre>`
    htmlCode += '</div>'
    return htmlCode
  },
})

const emit = defineEmits(['compose', 'refresh', 'trash', 'copy', 'add-pin', 'remove-pin'])

interface ChatItem {
  time: string
  icon: string
  name: string
  content: string
  isMe: boolean
  isLoading: boolean
  isPin: boolean
  withContent: string // 内容相关
}
// 在这里使用 props.item
const props = defineProps({
  item: {
    type: Object as PropType<ChatItem>,
    default: () => ({
      time: '',
      icon: '',
      name: '',
      content: '',
      isMe: false,
      isLoading: false,
      isPin: false,
      withContent: '', // 内容相关
    }),
  },
  showBtn: Boolean,
  // 是否显示鼠标闪烁的效果
  showCursor: {
    type: [Boolean, Number],
    default() {
      return false
    },
  },
  isLastMsg: {
    type: Boolean,
    default() {
      return false
    },
  },
})

const dtoItem = computed(() => ({
  ...props.item,
  time: props.item.time && dayjs(props.item.time).format('YYYY/MM/DD HH:mm:ss'),
}))

const msgContent = computed(() => props.item.content)

const nodes = computed(() => {
  if (!msgContent.value) {
    return // 处理特殊情况，比如网络异常导致的响应的 content 的值为空
  }
  let htmlString = ''
  // 修改转换结果的htmlString值 用于正确给界面增加鼠标闪烁的效果
  // 判断markdown中代码块标识符的数量是否为偶数
  if (msgContent.value.split('```').length % 2) {
    let msgCtx = msgContent.value
    // #ifndef MP
    if (msgContent[msgCtx.length - 1] !== '\n') {
      msgCtx += '\n'
    }
    // #endif
    // #ifdef MP
    htmlString = towxml(msgCtx, 'markdown', {
      events: {
        // 为元素绑定的事件方法
        copy: (e) => {
          let copyed_code = ''
          const extract_code = (parsed_item) => {
            if (!parsed_item.children) {
              return
            }
            parsed_item.children.forEach((item) => {
              if (
                item.raw_tag == 'ul' ||
                (item.attrs.class && item.attrs.class.indexOf('h2w__lineNum') != -1)
              ) {
              } else if (item.raw_tag == 'p') {
                copyed_code = copyed_code + '\n\n'
              } else if (item.raw_tag == 'br') {
                copyed_code = copyed_code + '\n'
              } else if (item.type == 'text') {
                copyed_code = copyed_code + item.text
              } else {
                extract_code(item)
              }
            })
          }
          extract_code(e.target.dataset.data)
          uni.setClipboardData({
            data: copyed_code,
            showToast: true,
          })
        },
        tap: () => {},
      },
    })
    // #endif
    // #ifndef MP
    htmlString = markdownIt.render(msgCtx)
    // #endif
  } else {
    // #ifdef MP
    htmlString = towxml(msgContent.value, 'markdown', {
      events: {
        copy: (e) => {
          let copyed_code = ''
          const extract_code = (parsed_item) => {
            if (!parsed_item.children) {
              return
            }
            parsed_item.children.forEach((item) => {
              if (
                item.raw_tag == 'ul' ||
                (item.attrs.class && item.attrs.class.indexOf('h2w__lineNum') != -1)
              ) {
              } else if (item.raw_tag == 'p') {
                copyed_code = copyed_code + '\n\n'
              } else if (item.raw_tag == 'br') {
                copyed_code = copyed_code + '\n'
              } else if (item.type == 'text') {
                copyed_code = copyed_code + item.text
              } else {
                extract_code(item)
              }
            })
          }
          extract_code(e.target.dataset.data)
          uni.setClipboardData({
            data: copyed_code,
            showToast: true,
          })
        },
        tap: () => {},
      },
    })
    // #endif
    // #ifndef MP
    htmlString = markdownIt.render(msgContent.value) + '\n <span class="cursor"></span>'
    // #endif
  }

  // #ifndef APP-NVUE
  return htmlString
  // #endif

  // nvue模式下将htmlString转成htmlArray，其他情况rich-text内部转
  // 注：本示例项目还没使用nvue编译

  // #ifdef APP-NVUE
  // eslint-disable-next-line no-unreachable
  return parseHtml(htmlString)
  // #endif
})

function trOnclick(e) {
  const { attrs } = e.detail.node
  const { 'code-data-index': codeDataIndex, class: className } = attrs
  if (className.includes('copy-btn')) {
    uni.setClipboardData({
      data: codeDataList.value[codeDataIndex],
      showToast: false,
      success() {
        uni.showToast({
          title: '复制成功',
          icon: 'none',
        })
      },
    })
  }
}
</script>

<style scoped>
/* #ifndef MP */
@import '@/lib/highlight/darcula.min.css';
/* #endif */

.chat-item {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
}
.chat-time {
  padding: 4rpx 0rpx;
  font-size: 20rpx;
  color: #aaaaaa;
}
.chat-violation {
  font-size: 20rpx;
  color: #ee9e26;
  padding: 0 10rpx;
}
.chat-error {
  font-size: 20rpx;
  color: #dd524d;
  padding: 0 10rpx;
}
.chat-container {
  display: flex;
  flex-direction: row;
}
.chat-location-me {
  flex-direction: row-reverse;
  text-align: right;
}
.chat-icon-container {
  margin-top: 12rpx;
}

.chat-content-header {
  display: flex;
  align-items: flex-end;
}

.chat-content-header-me {
  flex-direction: row-reverse;
}

.chat-foot {
  margin: 0rpx 15rpx;
  text-align: left;
  display: flex;
  align-items: center;
}
.chat-foot-me {
  justify-content: flex-end;
  text-align: right;
}
.chat-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 25%;
  background-color: #eeeeee;
}
.chat-content-container {
  margin: 0rpx 15rpx;
  display: flex;
  flex-direction: column;
  max-width: 96%;
}

.chat-content-container-me {
  align-items: flex-end;
}

.chat-content-header-btn {
  background: #ffffff;
  border: 1rpx solid rgba(136, 136, 136, 0.4);
  padding: 6rpx;
  margin: 0 12rpx;
  border-radius: 12rpx;
}

.chat-user-name {
  font-size: 26rpx;
  color: #888888;
}
.chat-text-container {
  text-align: left;
  background-color: #f1f1f1;
  border-radius: 8rpx;
  padding: 10rpx 15rpx;
  margin-top: 10rpx;
  /* #ifndef APP-NVUE */
  max-width: 96%;
  /* #endif */
  width: fit-content;
}
.chat-text-container-me {
  background-color: #a5d6ff;
}
.char-text {
  font-size: 0.9rem;
  /* #ifndef APP-NVUE */
  word-break: break-all;
  /* #endif */
  /* #ifdef APP-NVUE */
  max-width: 500rpx;
  /* #endif */
}
.char-text-me {
  color: #312c2c;
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading__bar {
  height: 40rpx;
  width: 8rpx;
  margin: 0 4rpx;
  border-radius: 4rpx;
  animation: loading 1s ease-in-out infinite;
}

.loading__bar:nth-child(1) {
  background-color: #e0e0e0;
  animation-delay: -0.4s;
}

.loading__bar:nth-child(2) {
  background-color: #c3c3c3;
  animation-delay: -0.3s;
}

.loading__bar:nth-child(3) {
  background-color: #a7a7a7;
  animation-delay: -0.2s;
}

.loading__bar:nth-child(4) {
  background-color: #8b8b8b;
  animation-delay: -0.1s;
}

.loading__bar:nth-child(5) {
  background-color: #6e6e6e;
  animation-delay: 0s;
}

@keyframes loading {
  0% {
    transform: scaleY(0.1);
  }
  50% {
    transform: scaleY(1);
  }
  100% {
    transform: scaleY(0.1);
  }
}

/* 光标动画 */
@keyframes cursor {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
/* 光标样式 */
.cursor {
  display: inline-block;
  width: 2px;
  height: 28rpx;
  background-color: black;
  animation: cursor 1s infinite;
  position: relative;
  top: 2px;
}

/* 富文本框样式 */
/* #ifndef APP-NVUE */
.rich-text-box {
  max-width: 100%;
  font-size: 0.9rem;
}
.rich-text-box ::v-deep pre.hljs {
  padding: 5rpx 8rpx;
  margin: 5rpx 0;
  overflow: auto;
}

.rich-text-box ::v-deep table {
  border-spacing: 0;
}

.rich-text-box ::v-deep th,
.rich-text-box ::v-deep td {
  border: 1rpx solid #666;
  padding: 3rpx 5rpx;
}

.cursor {
  display: none;
}

.show-cursor .cursor {
  display: inline-block;
  color: blue;
  font-weight: bold;
  animation: blinking 1s infinite;
}

@keyframes blinking {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
/* #endif */
</style>
