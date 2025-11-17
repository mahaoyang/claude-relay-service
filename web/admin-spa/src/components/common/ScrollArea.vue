<template>
  <div class="scroll-area-root">
    <div ref="viewportRef" class="scroll-area-viewport" @scroll="handleScroll">
      <slot />
    </div>
    <!-- 垂直滚动条 -->
    <div
      v-show="showVerticalScrollbar"
      class="scroll-area-scrollbar scroll-area-scrollbar-vertical"
      :class="{ 'scroll-area-scrollbar-visible': isScrolling }"
      @mousedown="handleVerticalThumbMouseDown"
    >
      <div
        ref="verticalThumbRef"
        class="scroll-area-thumb"
        :style="{ height: verticalThumbHeight + 'px', transform: `translateY(${verticalThumbPosition}px)` }"
      />
    </div>
    <!-- 横向滚动条 -->
    <div
      v-show="showHorizontalScrollbar"
      class="scroll-area-scrollbar scroll-area-scrollbar-horizontal"
      :class="{ 'scroll-area-scrollbar-visible': isScrolling }"
      @mousedown="handleHorizontalThumbMouseDown"
    >
      <div
        ref="horizontalThumbRef"
        class="scroll-area-thumb"
        :style="{ width: horizontalThumbWidth + 'px', transform: `translateX(${horizontalThumbPosition}px)` }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const viewportRef = ref(null)
const verticalThumbRef = ref(null)
const horizontalThumbRef = ref(null)

// 垂直滚动条
const verticalThumbHeight = ref(0)
const verticalThumbPosition = ref(0)
const showVerticalScrollbar = ref(false)

// 横向滚动条
const horizontalThumbWidth = ref(0)
const horizontalThumbPosition = ref(0)
const showHorizontalScrollbar = ref(false)

const isScrolling = ref(false)
let scrollTimeout = null

// 垂直拖拽状态
let isVerticalDragging = false
let verticalDragStartY = 0
let verticalDragStartScroll = 0

// 横向拖拽状态
let isHorizontalDragging = false
let horizontalDragStartX = 0
let horizontalDragStartScroll = 0

// 计算滚动条是否需要显示
const updateScrollbar = () => {
  if (!viewportRef.value) return

  const { scrollHeight, clientHeight, scrollTop, scrollWidth, clientWidth, scrollLeft } =
    viewportRef.value

  // 垂直滚动条
  showVerticalScrollbar.value = scrollHeight > clientHeight
  if (showVerticalScrollbar.value) {
    const verticalRatio = clientHeight / scrollHeight
    verticalThumbHeight.value = Math.max(clientHeight * verticalRatio, 30) // 最小30px
    const verticalScrollRatio = scrollTop / (scrollHeight - clientHeight)
    const maxVerticalThumbPosition = clientHeight - verticalThumbHeight.value
    verticalThumbPosition.value = verticalScrollRatio * maxVerticalThumbPosition
  }

  // 横向滚动条
  showHorizontalScrollbar.value = scrollWidth > clientWidth
  if (showHorizontalScrollbar.value) {
    const horizontalRatio = clientWidth / scrollWidth
    horizontalThumbWidth.value = Math.max(clientWidth * horizontalRatio, 30) // 最小30px
    const horizontalScrollRatio = scrollLeft / (scrollWidth - clientWidth)
    const maxHorizontalThumbPosition = clientWidth - horizontalThumbWidth.value
    horizontalThumbPosition.value = horizontalScrollRatio * maxHorizontalThumbPosition
  }
}

// 处理滚动事件
const handleScroll = () => {
  updateScrollbar()

  // 显示滚动中状态
  isScrolling.value = true

  // 清除之前的定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  // 1秒后隐藏滚动中状态
  scrollTimeout = setTimeout(() => {
    isScrolling.value = false
  }, 1000)
}

// 垂直滚动条拖拽
const handleVerticalThumbMouseDown = (e) => {
  if (!viewportRef.value) return

  isVerticalDragging = true
  verticalDragStartY = e.clientY
  verticalDragStartScroll = viewportRef.value.scrollTop

  document.addEventListener('mousemove', handleVerticalMouseMove)
  document.addEventListener('mouseup', handleVerticalMouseUp)

  e.preventDefault()
}

const handleVerticalMouseMove = (e) => {
  if (!isVerticalDragging || !viewportRef.value) return

  const deltaY = e.clientY - verticalDragStartY
  const { scrollHeight, clientHeight } = viewportRef.value

  const maxThumbPosition = clientHeight - verticalThumbHeight.value
  const scrollRatio = deltaY / maxThumbPosition
  const scrollDelta = scrollRatio * (scrollHeight - clientHeight)

  viewportRef.value.scrollTop = verticalDragStartScroll + scrollDelta
}

const handleVerticalMouseUp = () => {
  isVerticalDragging = false
  document.removeEventListener('mousemove', handleVerticalMouseMove)
  document.removeEventListener('mouseup', handleVerticalMouseUp)
}

// 横向滚动条拖拽
const handleHorizontalThumbMouseDown = (e) => {
  if (!viewportRef.value) return

  isHorizontalDragging = true
  horizontalDragStartX = e.clientX
  horizontalDragStartScroll = viewportRef.value.scrollLeft

  document.addEventListener('mousemove', handleHorizontalMouseMove)
  document.addEventListener('mouseup', handleHorizontalMouseUp)

  e.preventDefault()
}

const handleHorizontalMouseMove = (e) => {
  if (!isHorizontalDragging || !viewportRef.value) return

  const deltaX = e.clientX - horizontalDragStartX
  const { scrollWidth, clientWidth } = viewportRef.value

  const maxThumbPosition = clientWidth - horizontalThumbWidth.value
  const scrollRatio = deltaX / maxThumbPosition
  const scrollDelta = scrollRatio * (scrollWidth - clientWidth)

  viewportRef.value.scrollLeft = horizontalDragStartScroll + scrollDelta
}

const handleHorizontalMouseUp = () => {
  isHorizontalDragging = false
  document.removeEventListener('mousemove', handleHorizontalMouseMove)
  document.removeEventListener('mouseup', handleHorizontalMouseUp)
}

// 监听内容变化
const resizeObserver = ref(null)

onMounted(() => {
  updateScrollbar()

  // 监听viewport尺寸变化
  if (viewportRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      updateScrollbar()
    })
    resizeObserver.value.observe(viewportRef.value)
  }

  // 监听窗口尺寸变化
  window.addEventListener('resize', updateScrollbar)
})

onUnmounted(() => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }

  window.removeEventListener('resize', updateScrollbar)
  document.removeEventListener('mousemove', handleVerticalMouseMove)
  document.removeEventListener('mouseup', handleVerticalMouseUp)
  document.removeEventListener('mousemove', handleHorizontalMouseMove)
  document.removeEventListener('mouseup', handleHorizontalMouseUp)
})
</script>

<style scoped>
.scroll-area-root {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.scroll-area-viewport {
  width: 100%;
  height: 100%;
  overflow: auto;
  /* 隐藏原生滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.scroll-area-viewport::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.scroll-area-scrollbar {
  position: absolute;
  padding: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10;
}

.scroll-area-scrollbar-vertical {
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
}

.scroll-area-scrollbar-horizontal {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 10px;
}

.scroll-area-scrollbar-visible {
  opacity: 1;
  pointer-events: auto;
}

.scroll-area-root:hover .scroll-area-scrollbar {
  opacity: 1;
  pointer-events: auto;
}

.scroll-area-scrollbar-vertical .scroll-area-thumb {
  position: relative;
  width: 6px;
  margin: 0 auto;
  background: rgba(20, 184, 166, 0.5);
  border-radius: 3px;
  transition: background 0.2s ease;
  cursor: pointer;
}

.scroll-area-scrollbar-horizontal .scroll-area-thumb {
  position: relative;
  height: 6px;
  margin: auto 0;
  background: rgba(20, 184, 166, 0.5);
  border-radius: 3px;
  transition: background 0.2s ease;
  cursor: pointer;
}

.scroll-area-thumb:hover {
  background: rgba(20, 184, 166, 0.7);
}

.scroll-area-thumb:active {
  background: rgba(20, 184, 166, 0.9);
}

/* 暗黑模式 */
:global(.dark) .scroll-area-thumb {
  background: rgba(45, 212, 191, 0.4);
}

:global(.dark) .scroll-area-thumb:hover {
  background: rgba(45, 212, 191, 0.6);
}

:global(.dark) .scroll-area-thumb:active {
  background: rgba(45, 212, 191, 0.8);
}
</style>
