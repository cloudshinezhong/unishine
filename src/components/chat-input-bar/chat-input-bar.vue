<!--聊天输入框 -->
<template>
  <view class="chat-input-bar">
    <view class="chat-edit" @click="leftClick">
      <uni-icons type="settings" size="26"></uni-icons>
    </view>
    <view class="chat-input-container">
      <view class="flex center pl-1 pr-1" @click="innerLeftClick">
        <uni-icons type="plus" size="28" color="rgb(192, 196, 204)"></uni-icons>
      </view>
      <textarea
        placeholder="请输入内容"
        v-model="msg"
        :auto-height="true"
        @confirm="sendClick"
        @input="setInput"
        :flex="true"
        :disable-default-padding="true"
        :hold-keyboard="false"
        :confirm-hold="false"
        :auto-blur="false"
        confirm-type="send"
        :show-confirm-bar="false"
        :cursor-spacing="20"
        maxlength="9999"
        @focus="focusHandle"
        @blur="blurHandle"
        @linechange="$emit('linechange', $event)"
        :fixed="true"
        :adjust-position="true"
        class="chat-input"
      />
      <view class="flex center pl-1 pr-1" v-if="msg.length > 0" @click="clearable">
        <uni-icons type="clear" size="24" color="rgb(192, 196, 204)"></uni-icons>
      </view>
    </view>
    <view
      class="chat-input-send"
      @click="sendClick"
      :class="isDisabled ? 'chat-input-send-disabled' : ''"
    >
      <uni-icons type="paperplane" size="24" color="white"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  name: 'chat-input-bar',
  emits: ['send', 'focus', 'blur', 'leftClick', 'innerLeftClick', 'update:value', 'linechange'],
  props: {
    disabled: {
      type: Boolean,
      default() {
        return false
      },
    },
    checked: {
      type: Boolean,
      default() {
        return false
      },
    },
    value: {
      type: String,
      default() {
        return ''
      },
    },
  },
  watch: {
    value(newValue) {
      this.msg = newValue
      this.$emit('update:value', this.msg)
    },
    disabled(newValue) {
      this.isDisabled = newValue
    },
    checked(newValue) {
      this.isChecked = newValue
    },
  },
  data() {
    return {
      msg: '',
      isDisabled: false,
      isChecked: false,
      isFocus: false,
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.isDisabled = this.disabled
      this.isChecked = this.checked
    },
    setInput(e) {
      this.$emit('update:value', e.detail.value)
    },
    clearable() {
      this.msg = ''
      this.$emit('update:value', this.msg)
    },
    focusHandle(e) {
      this.$emit('focus', e)
    },
    blurHandle(e) {
      this.$emit('blur', e)
    },
    sendClick() {
      if (!this.msg.length) return
      if (this.isDisabled) return
      this.$emit('send', this.msg)
      this.msg = ''
      this.$emit('update:value', this.msg)
    },
    innerLeftClick() {
      this.$emit('innerLeftClick')
    },
    leftClick() {
      this.$emit('leftClick', this.isChecked)
    },
  },
}
</script>

<style scoped>
.chat-input-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-top: solid 1px #eaeaea;
  padding: 6px 6px;
}
.chat-edit {
  height: 28px;
  display: flex;
  align-items: center;
  margin: 0 8px;
}
.chat-edit-tip {
  font-size: 22rpx;
}

.chat-input-container {
  flex: 1;
  display: flex;
  /* #ifndef APP-NVUE */
  padding: 8px 2px;
  /* #endif */
  /* #ifdef APP-NVUE */
  padding: 4px 2px;
  /* #endif */
  background-color: white;
  border-radius: 6px;
  line-height: 24px;
}
.chat-input {
  flex: 1;
  font-size: 28rpx;
  /*height: 42rpx;*/
  width: 80%;
}
.chat-input-send {
  background-color: #007aff;
  margin: 10rpx 10rpx 10rpx 20rpx;
  border-radius: 10rpx;
  padding: 10rpx 24rpx;
}

.chat-input-send-text {
  color: white;
  font-size: 26rpx;
}

.chat-input-send-disabled {
  opacity: 0.3;
}
</style>
