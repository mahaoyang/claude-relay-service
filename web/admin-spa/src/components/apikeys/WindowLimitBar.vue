<template>
  <div>
    <!-- 时间窗口进度条 -->
    <div>
      <!-- 时间进度条背景 -->
      <div></div>

      <!-- 文字层 -->
      <div>
        <div>
          <span> {{ rateLimitWindow }}分钟窗口 </span>
        </div>
        <span>
          {{ remainingSeconds > 0 ? formatTime(remainingSeconds) : '未激活' }}
        </span>
      </div>
    </div>

    <!-- 费用和请求限制（如果有的话） -->
    <div v-if="costLimit > 0 || requestLimit > 0">
      <!-- 费用限制进度条 -->
      <div v-if="costLimit > 0">
        <!-- 进度条 -->
        <div></div>

        <!-- 文字 -->
        <div>
          <span>费用</span>
          <span> ${{ currentCost.toFixed(1) }}/${{ costLimit.toFixed(0) }} </span>
        </div>
      </div>

      <!-- 请求限制进度条 -->
      <div v-if="requestLimit > 0">
        <!-- 进度条 -->
        <div></div>

        <!-- 文字 -->
        <div>
          <span>请求</span>
          <span> {{ currentRequests }}/{{ requestLimit }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rateLimitWindow: {
    type: Number,
    required: true
  },
  remainingSeconds: {
    type: Number,
    default: 0
  },
  currentRequests: {
    type: Number,
    default: 0
  },
  requestLimit: {
    type: Number,
    default: 0
  },
  currentCost: {
    type: Number,
    default: 0
  },
  costLimit: {
    type: Number,
    default: 0
  },
  currentTokens: {
    type: Number,
    default: 0
  },
  tokenLimit: {
    type: Number,
    default: 0
  }
})

// 费用进度
const costProgress = computed(() => {
  if (!props.costLimit || props.costLimit === 0) return 0
  const percentage = (props.currentCost / props.costLimit) * 100
  return Math.min(percentage, 100)
})

// 请求进度
const requestProgress = computed(() => {
  if (!props.requestLimit || props.requestLimit === 0) return 0
  const percentage = (props.currentRequests / props.requestLimit) * 100
  return Math.min(percentage, 100)
})

// eslint-disable-next-line no-unused-vars
const timeProgress = computed(() => {
  if (!props.rateLimitWindow || props.rateLimitWindow === 0) return 0
  const totalSeconds = props.rateLimitWindow * 60
  const elapsed = totalSeconds - props.remainingSeconds
  return Math.max(0, (elapsed / totalSeconds) * 100)
})

// eslint-disable-next-line no-unused-vars
const getCostProgressBarClass = () => {
  const p = costProgress.value
  if (p >= 90) {
    return ' '
  } else if (p >= 70) {
    return ' '
  } else {
    return ' '
  }
}

// eslint-disable-next-line no-unused-vars
const getRequestProgressBarClass = () => {
  const p = requestProgress.value
  if (p >= 90) {
    return ' '
  } else if (p >= 70) {
    return ' '
  } else {
    return ' '
  }
}

// eslint-disable-next-line no-unused-vars
const getCostTextClass = () => {
  const p = costProgress.value
  if (p > 50) {
    return ' drop-'
  } else {
    return ' dark:'
  }
}

// eslint-disable-next-line no-unused-vars
const getCostValueTextClass = () => {
  const p = costProgress.value
  if (p > 50) {
    return ' drop-'
  } else {
    return ' dark:'
  }
}

// eslint-disable-next-line no-unused-vars
const getRequestTextClass = () => {
  const p = requestProgress.value
  if (p > 50) {
    return ' drop-'
  } else {
    return ' dark:'
  }
}

// eslint-disable-next-line no-unused-vars
const getRequestValueTextClass = () => {
  const p = requestProgress.value
  if (p > 50) {
    return ' drop-'
  } else {
    return ' dark:'
  }
}

// 格式化时间
const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m${secs}s`
  } else {
    return `${secs}s`
  }
}

// 格式化Token数 - 暂时未使用
// const formatTokens = (count) => {
// if (count >= 1000000) {
// return (count / 1000000).toFixed(1) + 'M'
// } else if (count >= 1000) {
// return (count / 1000).toFixed(1) + 'K'
// }
// return count.toString()
// }
</script>
