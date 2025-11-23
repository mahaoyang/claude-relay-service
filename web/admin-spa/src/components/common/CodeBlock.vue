<template>
  <div class="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 dark:bg-gray-950">
    <div
      v-for="(line, index) in lines"
      :key="index"
      class="font-mono text-sm"
      :class="getLineClass(line)"
    >
      {{ line }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lines: {
    type: Array,
    required: true
  },
  language: {
    type: String,
    default: 'bash'
  }
})

const getLineClass = (line) => {
  // 注释行（以 # 开头）
  if (line.trim().startsWith('#')) {
    return 'text-gray-400'
  }

  // 根据语言类型返回不同的颜色
  switch (props.language) {
    case 'json':
      return 'text-yellow-300'
    case 'toml':
    case 'ini':
      return 'text-gray-300'
    case 'powershell':
    case 'cmd':
      return 'text-green-400'
    case 'bash':
    case 'shell':
      return 'text-cyan-400'
    default:
      return 'text-gray-300'
  }
}
</script>
