<template>
  <div class="space-y-8">
    <!-- 标题区域 -->
    <div class="relative space-y-3">
      <!-- 装饰性背景光晕 -->
      <div
        class="pointer-events-none absolute -left-10 -top-10 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -right-10 -top-5 h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-blue-400/20 blur-2xl"
        style="animation-delay: 1s"
      />

      <h2
        class="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
      >
        使用统计查询
      </h2>
      <p class="relative text-lg text-gray-600 dark:text-gray-400">
        查询您的 API Key 使用情况和统计数据
      </p>
    </div>

    <!-- 输入区域 -->
    <div
      class="group relative overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-purple-300/50 hover:shadow-purple-500/10 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-purple-600/50"
    >
      <!-- 多层装饰性背景 -->
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-100"
      />
      <div
        class="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-gradient-to-tr from-pink-400/15 to-purple-400/15 opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-100"
        style="transition-delay: 150ms"
      />
      <div
        class="pointer-events-none absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-400/10 opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100"
        style="transition-delay: 300ms"
      />

      <!-- 控制栏 -->
      <div
        class="relative z-10 mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- API Key 标签 -->
        <label class="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-gray-200">
          <svg
            class="h-5 w-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
          {{ multiKeyMode ? '输入您的 API Keys（每行一个或用逗号分隔）' : '输入您的 API Key' }}
        </label>

        <!-- 模式切换 -->
        <div class="flex items-center gap-4">
          <div
            class="inline-flex rounded-xl border-2 border-gray-200/80 bg-gray-50 p-1.5 shadow-inner dark:border-gray-700/80 dark:bg-gray-800"
          >
            <button
              :class="[
                'rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-300',
                !multiKeyMode
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 dark:bg-blue-500 dark:shadow-blue-500/20 dark:hover:bg-blue-600'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
              ]"
              title="单一模式"
              @click="multiKeyMode = false"
            >
              <span class="flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
                单一
              </span>
            </button>
            <button
              :class="[
                'rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-300',
                multiKeyMode
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-600 dark:bg-purple-500 dark:shadow-purple-500/20 dark:hover:bg-purple-600'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
              ]"
              title="聚合模式"
              @click="multiKeyMode = true"
            >
              <span class="flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
                聚合
                <span
                  v-if="multiKeyMode && parsedApiKeys.length > 0"
                  class="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/20 px-2 text-xs font-black shadow-inner backdrop-blur-sm"
                >
                  {{ parsedApiKeys.length }}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="relative z-10 space-y-5">
        <!-- API Key 输入 -->
        <div class="relative">
          <!-- 单 Key 模式输入框 -->
          <div v-if="!multiKeyMode" class="relative">
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <input
              v-model="apiKey"
              :disabled="loading"
              :class="[
                'relative w-full rounded-2xl border-2 px-5 py-4 font-mono text-base transition-all duration-300',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                loading
                  ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-900'
                  : 'bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 dark:bg-gray-900/80 dark:focus:bg-gray-900',
                'border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-100',
                'shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-blue-500/10 focus:shadow-2xl focus:shadow-blue-500/20 dark:shadow-gray-900/50'
              ]"
              placeholder="请输入您的 API Key (cr_...)"
              type="password"
              @keyup.enter="queryStats"
            />
          </div>

          <!-- 多 Key 模式输入框 -->
          <div v-else class="relative">
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <textarea
              v-model="apiKey"
              :disabled="loading"
              :class="[
                'relative w-full rounded-2xl border-2 px-5 py-4 font-mono text-base transition-all duration-300',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                loading
                  ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-900'
                  : 'bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/20 dark:bg-gray-900/80 dark:focus:bg-gray-900',
                'border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-100',
                'shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-purple-500/10 focus:shadow-2xl focus:shadow-purple-500/20 dark:shadow-gray-900/50'
              ]"
              placeholder="请输入您的 API Keys，支持以下格式：&#10;cr_xxx&#10;cr_yyy&#10;或&#10;cr_xxx, cr_yyy"
              rows="5"
              @keyup.ctrl.enter="queryStats"
            />
            <button
              v-if="apiKey && !loading"
              :class="[
                'absolute right-4 top-4 rounded-xl p-2.5 transition-all duration-300',
                'bg-white/50 text-gray-400 shadow-sm backdrop-blur-sm hover:bg-red-50 hover:text-red-500 hover:shadow-md',
                'dark:bg-gray-800/50 dark:hover:bg-red-900/20 dark:hover:text-red-400'
              ]"
              title="清空输入"
              @click="clearInput"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- 查询按钮 -->
        <div class="flex justify-end pt-2">
          <button
            :disabled="loading || !hasValidInput"
            :class="[
              'group relative overflow-hidden rounded-2xl px-10 py-4 text-base font-bold transition-all duration-300',
              'transform shadow-lg active:scale-95',
              loading || !hasValidInput
                ? 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-gray-300/50 dark:bg-gray-700 dark:text-gray-500 dark:shadow-gray-700/50'
                : 'bg-purple-600 text-white shadow-purple-500/50 hover:bg-purple-700 hover:shadow-purple-600/60 dark:bg-purple-500 dark:shadow-purple-500/30 dark:hover:bg-purple-600 dark:hover:shadow-purple-600/40'
            ]"
            @click="queryStats"
          >
            <!-- 加载动画 -->
            <span
              v-if="loading"
              class="border-3 mr-3 inline-block h-5 w-5 animate-spin rounded-full border-white/30 border-t-white"
            />

            <span class="relative flex items-center gap-2">
              <svg
                v-if="!loading"
                class="h-5 w-5 transition-transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
              {{ loading ? '查询中...' : '查询统计' }}
            </span>
          </button>
        </div>
      </div>

      <!-- 安全提示 -->
      <div
        class="relative z-10 mt-8 overflow-hidden rounded-2xl border-2 border-blue-200/60 bg-gradient-to-r from-blue-50/80 via-blue-50/60 to-transparent p-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-lg hover:shadow-blue-500/10 dark:border-blue-800/60 dark:from-blue-900/30 dark:via-blue-900/20"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 rounded-xl bg-blue-500/10 p-3 shadow-inner dark:bg-blue-500/20">
            <svg
              class="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clip-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                fill-rule="evenodd"
              />
            </svg>
          </div>
          <p class="flex-1 text-base leading-relaxed text-blue-900 dark:text-blue-200">
            {{
              multiKeyMode
                ? '您的 API Keys 仅用于查询统计数据，不会被存储。聚合模式下部分个体化信息将不显示。'
                : '您的 API Key 仅用于查询自己的统计数据，不会被存储或用于其他用途'
            }}
          </p>
        </div>
      </div>

      <!-- 多 Key 模式额外提示 -->
      <div
        v-if="multiKeyMode"
        class="relative z-10 mt-4 overflow-hidden rounded-2xl border-2 border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-amber-50/60 to-transparent p-5 backdrop-blur-sm transition-all duration-300 hover:border-amber-300/80 hover:shadow-lg hover:shadow-amber-500/10 dark:border-amber-800/60 dark:from-amber-900/30 dark:via-amber-900/20"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex-shrink-0 rounded-xl bg-amber-500/10 p-3 shadow-inner dark:bg-amber-500/20"
          >
            <svg
              class="h-6 w-6 text-amber-600 dark:text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clip-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                fill-rule="evenodd"
              />
            </svg>
          </div>
          <span class="flex-1 text-base leading-relaxed text-amber-900 dark:text-amber-200"
            >提示：最多支持同时查询 30 个 API Keys。使用
            <kbd
              class="mx-1 rounded-lg bg-amber-200/50 px-2 py-1 font-mono text-sm font-bold text-amber-900 shadow-sm dark:bg-amber-800/50 dark:text-amber-100"
              >Ctrl+Enter</kbd
            >
            快速查询。</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const { apiKey, loading, multiKeyMode } = storeToRefs(apiStatsStore)
const { queryStats, clearInput } = apiStatsStore

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
