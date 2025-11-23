<template>
  <PageContainer max-width="5xl">
    <template #header>
      <div class="flex items-center justify-between">
        <LogoTitle
          class="transform transition-transform hover:scale-[1.01]"
          :loading="oemLoading"
          :logo-src="oemSettings.siteIconData || oemSettings.siteIcon"
          :subtitle="currentTab === 'stats' ? 'API Key 使用统计' : '使用教程'"
          :title="oemSettings.siteName"
        />
        <div class="flex items-center gap-4">
          <!-- 主题切换按钮 -->
          <ThemeToggle class="shadow-sm transition-shadow hover:shadow-md" mode="dropdown" />

          <!-- 分隔线 -->
          <div
            v-if="oemSettings.ldapEnabled || oemSettings.showAdminButton !== false"
            class="h-6 w-px bg-gray-200 dark:bg-gray-700"
          />

          <!-- 用户登录按钮 (仅在 LDAP 启用时显示) -->
          <router-link v-if="oemSettings.ldapEnabled" to="/user-login">
            <Button class="font-medium" size="sm" variant="ghost">
              <span>用户登录</span>
            </Button>
          </router-link>
          <!-- 管理后台按钮 -->
          <router-link v-if="oemSettings.showAdminButton !== false" to="/dashboard">
            <Button
              class="shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/30"
              size="sm"
              variant="primary"
            >
              <span>管理后台</span>
            </Button>
          </router-link>
        </div>
      </div>
    </template>

    <!-- 主要内容区域 -->
    <Card :no-padding="true">
      <!-- Tab 导航 -->
      <div class="px-6 pt-4">
        <Tabs
          v-model="currentTab"
          active-class="text-primary-600 dark:text-primary-400"
          class="w-full"
          inactive-class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          tab-class="pb-4 px-4 text-sm font-medium transition-colors relative"
          :tabs="[
            { key: 'stats', label: '统计查询' },
            { key: 'tutorial', label: '使用教程' }
          ]"
        >
        </Tabs>
      </div>

      <!-- 内容面板 -->
      <div class="min-h-[400px] p-6 sm:p-8">
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
          mode="out-in"
        >
          <!-- 统计内容 -->
          <div v-if="currentTab === 'stats'" key="stats" class="space-y-8">
            <!-- API Key 输入区域 -->
            <div class="mx-auto max-w-2xl">
              <ApiKeyInput />
            </div>

            <!-- 错误提示 -->
            <Alert
              v-if="error"
              class="animate-shake"
              :closable="true"
              title="查询失败"
              variant="danger"
              @close="error = ''"
            >
              {{ error }}
            </Alert>

            <!-- 统计数据展示区域 -->
            <div v-if="statsData" class="animate-fade-in-up space-y-8">
              <!-- 时间范围选择器 -->
              <div
                class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/50"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  >
                    <svg
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clip-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        fill-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >统计时间范围</span
                  >
                </div>
                <div
                  class="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <button
                    v-for="period in ['daily', 'monthly']"
                    :key="period"
                    class="rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200"
                    :class="
                      statsPeriod === period
                        ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900/30 dark:text-primary-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    "
                    :disabled="loading || modelStatsLoading"
                    @click="switchPeriod(period)"
                  >
                    {{ period === 'daily' ? '今日' : '本月' }}
                  </button>
                </div>
              </div>

              <!-- 基本信息和统计概览 -->
              <StatsOverview />

              <!-- Token 分布和限制配置 -->
              <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <TokenDistribution class="h-full" />
                <div class="h-full">
                  <template v-if="multiKeyMode">
                    <AggregatedStatsCard />
                  </template>
                  <template v-else>
                    <LimitConfig />
                  </template>
                </div>
              </div>

              <!-- 模型使用统计 -->
              <ModelUsageStats />
            </div>
          </div>

          <!-- 教程内容 -->
          <div v-else-if="currentTab === 'tutorial'" key="tutorial">
            <TutorialView />
          </div>
        </Transition>
      </div>
    </Card>

    <template #footer>
      <p>&copy; {{ new Date().getFullYear() }} {{ oemSettings.siteName }}. All rights reserved.</p>
    </template>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import { useThemeStore } from '@/stores/theme'
import { Button, Card, Tabs, Alert } from '@/ui'
import LogoTitle from '@/components/common/LogoTitle.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import ApiKeyInput from '@/components/apistats/ApiKeyInput.vue'
import StatsOverview from '@/components/apistats/StatsOverview.vue'
import TokenDistribution from '@/components/apistats/TokenDistribution.vue'
import LimitConfig from '@/components/apistats/LimitConfig.vue'
import AggregatedStatsCard from '@/components/apistats/AggregatedStatsCard.vue'
import ModelUsageStats from '@/components/apistats/ModelUsageStats.vue'
import TutorialView from './TutorialView.vue'

const route = useRoute()
const apiStatsStore = useApiStatsStore()
const themeStore = useThemeStore()

// 当前标签页
const currentTab = ref('stats')

const {
  apiKey,
  apiId,
  loading,
  modelStatsLoading,
  oemLoading,
  error,
  statsPeriod,
  statsData,
  oemSettings,
  multiKeyMode
} = storeToRefs(apiStatsStore)

const { queryStats, switchPeriod, loadStatsWithApiId, loadOemSettings, reset } = apiStatsStore

// 处理键盘快捷键
const handleKeyDown = (event) => {
  // Ctrl/Cmd + Enter 查询
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (!loading.value && apiKey.value.trim()) {
      queryStats()
    }
    event.preventDefault()
  }

  // ESC 清除数据
  if (event.key === 'Escape') {
    reset()
  }
}

// 初始化
onMounted(() => {
  // API Stats Page loaded

  // 初始化主题（因为该页面不在 MainLayout 内）
  themeStore.initTheme()

  // 加载 OEM 设置
  loadOemSettings()

  // 检查 URL 参数
  const urlApiId = route.query.apiId
  const urlApiKey = route.query.apiKey

  if (
    urlApiId &&
    urlApiId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)
  ) {
    // 如果 URL 中有 apiId，直接使用 apiId 加载数据
    apiId.value = urlApiId
    loadStatsWithApiId()
  } else if (urlApiKey && urlApiKey.length > 10) {
    // 向后兼容，支持 apiKey 参数
    apiKey.value = urlApiKey
  }

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
})

// 清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 监听 API Key 变化
watch(apiKey, (newValue) => {
  if (!newValue) {
    apiStatsStore.clearData()
  }
})
</script>
