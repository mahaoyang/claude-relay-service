<template>
  <div class="space-y-8 text-center">
    <!-- 标题区域 -->
    <div class="mb-4 space-y-1.5">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        API Key 使用统计
      </h2>
      <p class="mx-auto max-w-2xl text-xs text-gray-500 dark:text-gray-400">
        查询您的 API Key 实时使用情况、费用消耗及限制信息
      </p>
    </div>

    <!-- 输入区域 -->
    <div class="relative mx-auto max-w-2xl">
      <!-- 模式切换 - 缩小尺寸 -->
      <div class="absolute -top-9 right-0 origin-top-right scale-75">
        <TabGroup v-model="multiKeyMode" :options="modeOptions" />
      </div>
      <!-- 输入框容器 -->
      <div class="group relative">
        <div
          class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 opacity-10 blur transition-all duration-700 ease-out group-focus-within:opacity-25 group-hover:opacity-20"
        ></div>
        <div
          class="relative rounded-xl bg-white shadow-lg transition-shadow duration-300 group-focus-within:shadow-xl dark:bg-gray-900"
        >
          <!-- 单 Key 模式 -->
          <div v-if="!multiKeyMode" class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <input
              v-model="apiKey"
              :disabled="loading"
              type="password"
              class="block w-full rounded-lg border border-transparent bg-transparent py-4 pl-11 pr-32 text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm sm:leading-6"
              placeholder="输入您的 API Key (cr_...)"
              @keyup.enter="queryStats"
            />
          </div>

          <!-- 多 Key 模式 -->
          <div v-else class="relative">
            <textarea
              v-model="apiKey"
              :disabled="loading"
              rows="4"
              class="block w-full resize-none rounded-lg border border-transparent bg-transparent p-4 text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white sm:text-sm sm:leading-6"
              placeholder="输入多个 API Keys，每行一个..."
              @keyup.ctrl.enter="queryStats"
            />
            <!-- 计数器 -->
            <div
              class="absolute bottom-4 right-4 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-400 dark:bg-gray-800"
            >
              {{ parsedApiKeys.length }} / 30
            </div>
          </div>

          <!-- 查询按钮 (绝对定位在输入框右侧) -->
          <div class="absolute bottom-2 right-2 top-2" v-if="!multiKeyMode">
            <button
              @click="queryStats"
              :disabled="loading || !hasValidInput"
              class="flex h-full items-center gap-2 rounded-lg bg-primary-600 px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              <svg
                v-if="loading"
                class="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span v-else>查询</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 多行模式下的独立查询按钮 -->
      <div v-if="multiKeyMode" class="mt-4 flex justify-end">
        <button
          @click="queryStats"
          :disabled="loading || !hasValidInput"
          class="flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-2.5 font-medium text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
        >
          <svg
            v-if="loading"
            class="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>查询统计</span>
        </button>
      </div>

      <!-- 提示信息 -->
      <div
        class="mt-6 flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
      >
        <svg
          class="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-left leading-relaxed">
          {{
            multiKeyMode
              ? '聚合模式支持最多 30 个 API Key。查询结果将显示汇总数据和每个 Key 的详细使用情况。'
              : '您的 API Key 仅用于查询统计数据，系统不会存储您的密钥。'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import TabGroup from '@/components/common/TabGroup.vue'

const apiStatsStore = useApiStatsStore()
const { apiKey, loading, multiKeyMode } = storeToRefs(apiStatsStore)
const { queryStats, clearInput } = apiStatsStore

// 模式选项
const modeOptions = [
  {
    value: false,
    label: '单一',
    svgPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    value: true,
    label: '聚合',
    svgPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  }
]

// 解析输入的 API Keys
const parsedApiKeys = computed(() => {
  if (!multiKeyMode.value || !apiKey.value) return []

  // 支持逗号和换行符分隔
  const keys = apiKey.value
    .split(/[,\n]+/)
    .map((key) => key.trim())
    .filter((key) => key.length > 0)

  // 去重并限制最多30个
  const uniqueKeys = [...new Set(keys)]
  return uniqueKeys.slice(0, 30)
})

// 判断是否有有效输入
const hasValidInput = computed(() => {
  if (multiKeyMode.value) {
    return parsedApiKeys.value.length > 0
  }
  return apiKey.value && apiKey.value.trim().length > 0
})
</script>
