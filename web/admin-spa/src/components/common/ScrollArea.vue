<template>
  <div>
    <div ref="viewportRef" @scroll="handleScroll">
      <slot />
    </div>
    <!-- 垂直滚动条 -->
    <div v-show="showVerticalScrollbar" @mousedown="handleVerticalThumbMouseDown">
      <div ref="verticalThumbRef" />
    </div>
    <!-- 横向滚动条 -->
    <div v-show="showHorizontalScrollbar" @mousedown="handleHorizontalThumbMouseDown">
      <div ref="horizontalThumbRef" />
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
