<route lang="json5">
{
  style: { navigationBarTitleText: 'AI工具' },
}
</route>

<template>
  <view class="content h-full">
    <uni-section
      v-for="item in menuList"
      :key="item.key"
      :title="item.title"
      :sub-title="item.subTitle"
      type="line"
      padding
    >
      <uni-grid
        :column="3"
        :show-border="false"
        :square="false"
        @change="menuClickHandle(item.key, $event)"
      >
        <uni-grid-item v-for="it in item.menu" :key="it.key">
          <view class="grid-item-box">
            <image class="image" :src="it.icon" mode="aspectFill" />
            <text class="text">{{ it.name }}</text>
            <view v-if="item.badge" class="grid-dot">
              <uni-badge :text="it.badge" :type="it.type" />
            </view>
          </view>
        </uni-grid-item>
      </uni-grid>
    </uni-section>
  </view>
</template>

<script lang="ts" setup>
import menuJson from './nine-menu.json'
import { useMailUserStore } from '@/store/mailuser'
// 获取屏幕边界到安全区域距离
const mailUserStore = useMailUserStore()

const show = ref(false)

const menuList = computed(() => menuJson.map((i) => ({ ...i })))

function menuClickHandle(fkey, e) {
  const parents = menuList.value.find((i) => i.key === fkey)
  const child = parents.menu[e.detail.index]
  if (mailUserStore.isLogin) {
    uni.navigateTo({
      url: `/pages/tool/pages/${child.key}?parents=${encodeURIComponent(
        JSON.stringify({
          key: parents.key,
          title: parents.title,
          subTitle: parents.subTitle,
          icon: parents.icon,
          name: parents.name,
        }),
      )}&child=${encodeURIComponent(JSON.stringify(child))}`,
    })
  } else {
    uni.showToast({
      icon: 'none',
      position: 'bottom',
      title: '无法使用，请先登录',
    })
  }
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
}

.image {
  width: 25px;
  height: 25px;
}

.text {
  font-size: 14px;
  margin-top: 5px;
}

.example-body {
  /* #ifndef APP-NVUE */
  /*display: block; */
  /* #endif */
}

.grid-dynamic-box {
  margin-bottom: 15px;
}

.grid-item-box {
  flex: 1;
  /* position: relative; */
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
}

.grid-dot {
  position: absolute;
  top: 5px;
  right: 15px;
}

.swiper {
  height: 420px;
}

/* #ifdef H5 */
@media screen and (min-width: 768px) and (max-width: 1425px) {
  .swiper {
    height: 630px;
  }
}

@media screen and (min-width: 1425px) {
  .swiper {
    height: 830px;
  }
}
/* #endif */
</style>
