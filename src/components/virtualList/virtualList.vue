<template>
    <view>
        <scroll-view
            :scroll-y="true"
            class="list-container"
            @scroll="scrollEvent"
            @scrolltolower="scrolltolower"
            :style="{height}">
            <view
                :style="{height: listHeight + 'px'}"
                class="list-phantom"></view>
            <view :style="{transform: getTransform}" class="list">
                <!-- 自定义内容 容器必须包含 .cc-list-item 类名，必须绑定id -->
                <slot :data="visibleData"></slot>
            </view>
            <view class="list-last" id="list-last" key="list-last">
              <!-- 高度为0的 最后一个元素用于方便滚动到最后一个元素 -->
            </view>
        </scroll-view>
    </view>
</template>
<script>
    export default {
        props: {
            // 所有列表数据
            listData: {
                type: Array,
                default: () => []
            },
            // 预估高度
            estimatedItemSize: {
                type: Number,
                required: true
            },
            // 容器高度
            height: {
                type: String,
                default: '100vh'
            },
            // 缓冲区比例
            bufferScale: {
                type: Number,
                default: 1
            }
        },
        computed: {
            visibleCount() {
                return Math.ceil(this.screenHeight / this.estimatedItemSize);
            },
            visibleData() {
                let start = this.start - this.aboveCount;
                let end = this.end + this.belowCount;
                return this.listData.slice(start, end);
            },
            // 偏移量对应的style
            getTransform() {
                return `translateY(${this.startOffset}px)`;
            },
            // 列表总高度
            listHeight() {
                return this.positions[this.positions.length - 1] && this.positions[this.positions.length - 1].bottom;
            },
            // 上方缓冲数
            aboveCount() {
                return Math.min(this.start, this.bufferScale * this.visibleCount);
            },
            // 下方缓冲数
            belowCount() {
                return Math.min(
                    this.listData.length - this.end,
                    this.bufferScale * this.visibleCount
                );
            }
        },
        watch: {
            listData(val) {
                this.$nextTick(this.initPositions);
            }
        },
        created() {
            this.initPositions();
        },
        mounted() {
            const {screenHeight} = uni.getSystemInfoSync();
            this.screenHeight = screenHeight;
            this.start = 0;
            this.end = this.start + this.visibleCount;
        },
        updated() {
            this.$nextTick(function () {
                // 获取真实元素大小，修改对应的尺寸缓存
                this.updateItemsSize();
                // 更新真实偏移量
                this.setStartOffset();
            });
        },
        data() {
            return {
                // 可视区域高度
                screenHeight: 0,
                // 起始索引
                start: 0,
                // 结束索引
                end: 0,
                // 顶部偏移量
                startOffset: 0,
                // 预估数据
                positions: [],
            };
        },
        methods: {
            initPositions() {
                this.positions = this.listData.map((d, index) => ({
                    index: d.id,
                    height: this.estimatedItemSize,
                    top: index * this.estimatedItemSize,
                    bottom: (index + 1) * this.estimatedItemSize
                }));
            },
            // 获取列表起始索引
            getStartIndex(scrollTop = 0) {
                // 二分法查找
                return this.binarySearch(this.positions, scrollTop);
            },
            // 二分法查找
            binarySearch(list, value) {
                let start = 0;
                let end = list.length - 1;
                let tempIndex = null;
                while (start <= end) {
                    let midIndex = parseInt((start + end) / 2);
                    let midValue = list[midIndex].bottom;
                    if (midValue === value) {
                        return midIndex + 1;
                    } else if (midValue < value) {
                        start = midIndex + 1;
                    } else if (midValue > value) {
                        if (tempIndex === null || tempIndex > midIndex) {
                            tempIndex = midIndex;
                        }
                        end = end - 1;
                    }
                }
                return tempIndex;
            },
            // 获取列表项的当前尺寸
            updateItemsSize() {
                this.$nextTick(() => {
                    uni.createSelectorQuery()
                        .in(this)
                        .selectAll('.cc-list-item')
                        .boundingClientRect(nodes => {
                            if (!nodes || !nodes.length) {
                                return;
                            }
                            nodes.forEach((node, nodeIndex) => {
                                let height = node.height;
                                let index = this.positions.findIndex(
                                    item => item.index === +node.id
                                );
                                let oldHeight = this.positions[index] && this.positions[index].height;
                                let dValue = oldHeight - height;
                                //存在差值
                                if (dValue) {
                                    this.positions[index].bottom =
                                        this.positions[index].bottom - dValue;
                                    this.positions[index].height = height;
                                    for (let k = index + 1; k < this.positions.length; k++) {
                                        this.positions[k].top = this.positions[k - 1].bottom;
                                        this.positions[k].bottom =
                                            this.positions[k].bottom - dValue;
                                    }
                                }
                            });
                        })
                        .exec();
                });
            },
            // 获取当前的偏移量
            setStartOffset() {
                let startOffset;
                if (this.start >= 1) {
                    let size =
                        this.positions[this.start].top -
                        (this.positions[this.start - this.aboveCount]
                            ? this.positions[this.start - this.aboveCount].top
                            : 0);
                    startOffset = this.positions[this.start - 1]?.bottom - size;
                } else {
                    startOffset = 0;
                }
                this.startOffset = startOffset;
            },
            // 滚动事件
            scrollEvent(e) {
                //当前滚动位置
                let scrollTop = e.detail.scrollTop;
                //此时的开始索引
                this.start = this.getStartIndex(scrollTop);
                //此时的结束索引
                this.end = this.start + this.visibleCount;
                //此时的偏移量
                this.setStartOffset();
            },
            // 滚动到底
            scrolltolower(e) {
                this.$emit('scrolltolower', e);
            },
          // 滚动到底
          scrollTo(index) {
            if (index < 0 || index >= this.listData.length) {
              console.warn('scrollTo: index out of bounds');
              return;
            }
            // 使用 uni.pageScrollTo 滚动到指定索引位置
            uni.pageScrollTo({
              scrollTop: this.positions[index].top, // 滚动到目标索引的顶部
              duration: 300, // 可选，设置滚动动画时长
              selector: '.list-container', // 滚动目标选择器，确保滚动到正确的 scroll-view
            });
          },
        }
    };
</script>
<style lang="scss" scoped>
    .list-container {
        overflow: auto;
        position: relative;

        .list-phantom {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            z-index: -1;
        }

        .list {
            left: 0;
            right: 0;
            top: 0;
            position: absolute;

            .cc-list-item {
                text-align: center;
                border-bottom: 1px solid #ccc;
                box-sizing: border-box;
            }
        }
    }
</style>
