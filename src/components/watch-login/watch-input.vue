<template>
  <view class="main-list oBorder">
    <!-- 文本框 -->
    <input
      class="main-input"
      :value="modelValue"
      :type="_type"
      :focus="_focus"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :placeholder-style="'font-size:26rpx'"
      :password="_showPassword"
      @input="handleInput($event)"
      @focus="handleFocus"
      @blur="handleBlur"
      @longpress="handleLongPress"
      @confirm="handleConfirm"
      @click="handleClick"
      @longtap="handleLongTap"
      @touchcancel="handleTouchCancel"
      @touchend="handleTouchEnd"
      @touchmove="handleTouchMove"
      @touchstart="handleTouchStart"
    />
    <!-- 是否可见密码 -->
    <image
      v-if="!_isShowPass && typed === 'password'"
      class="img cuIcon"
      :class="showPassword ? 'cuIcon-attention' : 'cuIcon-attentionforbid'"
      @tap="showPass"
    ></image>
    <!-- 倒计时 -->
    <view
      v-if="_isShowCode && !_isShowPass"
      :class="['vercode', { 'vercode-run': second > 0 }]"
      @click="setCode($event)"
    >
      {{ getVerCodeSecond }}
    </view>
  </view>
</template>

<script lang="ts" setup>
let _this, countDown

const emit = defineEmits([
  'update:modelValue',
  'input',
  'focus',
  'blur',
  'longpress',
  'confirm',
  'click',
  'longtap',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'setCode',
  'runCodeStart',
  'runCodeEnd',
])

const handleInput = (event: InputEvent) => {
  emit('update:modelValue', (event.detail as unknown as HTMLDataElement).value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleLongPress = (event: MouseEvent) => {
  emit('longpress', event)
}

const handleConfirm = (event: KeyboardEvent) => {
  emit('confirm', event)
}

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

const handleLongTap = (event: MouseEvent) => {
  emit('longtap', event)
}

const handleTouchCancel = (event: TouchEvent) => {
  emit('touchcancel', event)
}

const handleTouchEnd = (event: TouchEvent) => {
  emit('touchend', event)
}

const handleTouchMove = (event: TouchEvent) => {
  emit('touchmove', event)
}

const handleTouchStart = (event: TouchEvent) => {
  emit('touchstart', event)
}

const handleSetCode = (event: Event) => {
  emit('setCode', event)
}

// 暴露给父组件调用的方法
defineExpose({
  runCode,
  getIsRunCode,
})

const showPassword = ref<boolean>(true) // 是否显示明文，改成默认不显示:password true是不显示
const second = ref<number>(0) // 倒计时
const isRunCode = ref<boolean>(false) // 是否开始倒计时
const isFocus = ref<boolean>(false) // 是否聚焦

const props = defineProps({
  typed: String, // 类型
  // value: String, // 值
  modelValue: String, // Vue3使用modelValue值
  placeholder: String, // 框内提示
  maxlength: {
    // 最大长度
    type: [Number, String],
    default: 20,
  },
  isShowPass: {
    // 是否显示密码图标（二选一）
    type: [Boolean, String],
    default: false,
  },
  isShowCode: {
    // 是否显示获取验证码（二选一）
    type: [Boolean, String],
    default: false,
  },
  codeText: {
    type: String,
    default: '获取验证码',
  },
  setTime: {
    // 倒计时时间设置
    type: [Number, String],
    default: 60,
  },
  focus: {
    // 是否聚焦
    type: [Boolean, String],
    default: false,
  },
})

onMounted(() => {
  _this = getCurrentInstance()
  clearInterval(countDown) // 先清理一次循环，避免缓存
})

function showPass() {
  // 是否显示密码
  showPassword.value = !showPassword.value
}

function getIsRunCode() {
  return isRunCode.value
}

function setCode($event) {
  // 设置获取验证码的事件
  if (isRunCode.value) {
    // 判断是否开始倒计时，避免重复点击
    return false
  }
  handleSetCode($event)
}
function runCode(val) {
  // 开始倒计时
  if (String(val) === '0') {
    // 判断是否需要终止循环
    second.value = 0 // 初始倒计时
    clearInterval(countDown) // 清理循环
    isRunCode.value = false // 关闭循环状态
    return false
  }
  if (isRunCode.value) {
    // 判断是否开始倒计时，避免重复点击
    return false
  }
  isRunCode.value = true
  emit('runCodeStart')
  second.value = _setTime.value // 倒数秒数
  countDown = setInterval(function () {
    second.value--
    if (second.value === 0) {
      isRunCode.value = false
      emit('runCodeEnd')
      clearInterval(countDown)
    }
  }, 1000)
}

const _type = computed(() =>
  props.typed === 'password' && !showPassword.value ? 'text' : props.typed,
)
const _showPassword = computed(() => props.typed === 'password' && showPassword.value)
const _isShowPass = computed(() => ['true', true].includes(props.isShowPass))
const _isShowCode = computed(() => ['true', true].includes(props.isShowCode))
const _setTime = computed(() => (Number(props.setTime) > 0 ? Number(props.setTime) : 60))
const _focus = computed(() => ['true', true].includes(props.focus))
const getVerCodeSecond = computed(() => {
  if (second.value <= 0) {
    return props.codeText
  } else {
    return second.value < 10 ? '0' + second.value : second.value.toString()
  }
})
</script>

<style>
@import url('./css/icon.css');

.main-list {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  /* height: 36rpx; */ /* Input 高度 */
  color: #333333;
  padding: 32rpx 32rpx;
  margin: 32rpx 0;
  width: 620rpx;
}
.img {
  width: 32rpx;
  height: 32rpx;
  font-size: 32rpx;
}
.main-input {
  flex: 1;
  text-align: left;
  font-size: 28rpx;
  /* line-height: 100rpx; */
  padding-right: 10rpx;
  margin-left: 20rpx;
}

/* 使用更加特定的 CSS 选择器覆盖 Edge 浏览器默认样式 */
.vercode {
  border-radius: 12rpx;
  padding: 16rpx 12rpx;
  background: rgba(165, 214, 255, 0.4);
  color: rgba(0, 0, 0, 0.7);
  font-size: 24rpx;
  /* line-height: 100rpx; */
}
.vercode-run {
  background: rgba(165, 214, 255, 0.7);
  color: rgba(0, 0, 0, 0.4) !important;
}
.oBorder {
  border: none;
  border-radius: 2rem;
  -webkit-box-shadow: 0 0 60rpx 0 rgba(43, 86, 112, 0.1);
  box-shadow: 0 0 60rpx 0 rgba(43, 86, 112, 0.1);
}
</style>
