<template>
  <div class="flex items-center gap-4">
    <!-- Logo区域 -->
    <div class="flex-shrink-0">
      <template v-if="!loading">
        <img
          v-if="logoSrc"
          alt="Logo"
          class="h-10 w-10 rounded-lg object-cover"
          :src="logoSrc"
          @error="handleLogoError"
        />
      </template>
      <div v-else class="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>

    <!-- 标题区域 -->
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <template v-if="!loading && title">
          <h1 class="truncate text-xl font-bold text-gray-900 dark:text-white">
            {{ title }}
          </h1>
        </template>
        <div
          v-else-if="loading"
          class="h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
        />
        <!-- 插槽用于版本信息等额外内容 -->
        <slot name="after-title" />
      </div>
      <p v-if="subtitle" class="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  logoSrc: {
    type: String,
    default: ''
  },
  titleClass: {
    type: String,
    default: ''
  }
})

// 处理图片加载错误
const handleLogoError = (e) => {
  e.target.style.display = 'none'
}
</script>
