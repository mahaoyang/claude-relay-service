<template>
  <div class="min-h-screen bg-gray-50 p-6 dark:bg-dark-bg">
    <!-- 顶部导航 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <LogoTitle
          :loading="oemLoading"
          :logo-src="oemSettings.siteIconData || oemSettings.siteIcon"
          :subtitle="currentTab === 'stats' ? 'API Key 使用统计' : '使用教程'"
          :title="oemSettings.siteName"
        />
        <div class="flex items-center gap-3">
          <!-- 主题切换按钮 -->
          <div>
            <ThemeToggle mode="dropdown" />
          </div>

          <!-- 分隔线 -->
          <div
            v-if="oemSettings.ldapEnabled || oemSettings.showAdminButton !== false"
            class="h-6 w-px bg-secondary-700"
          />

          <!-- 用户登录按钮 (仅在 LDAP 启用时显示) -->
          <router-link v-if="oemSettings.ldapEnabled" to="/user-login">
            <Button variant="ghost" size="sm">
              <span>用户登录</span>
            </Button>
          </router-link>
          <!-- 管理后台按钮 -->
          <router-link v-if="oemSettings.showAdminButton !== false" to="/dashboard">
            <Button variant="primary" size="sm">
              <span>管理后台</span>
            </Button>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <Card class="mb-6">
      <Tabs
        v-model="currentTab"
        :tabs="[
          { key: 'stats', label: '统计查询' },
          { key: 'tutorial', label: '使用教程' }
        ]"
      >
        <!-- 统计内容 -->
        <template #panel-stats>
          <div class="space-y-6">
            <!-- API Key 输入区域 -->
            <ApiKeyInput />

            <!-- 错误提示 -->
            <Alert v-if="error" variant="danger" title="错误" :closable="true" @close="error = ''">
              {{ error }}
            </Alert>

            <!-- 统计数据展示区域 -->
            <div v-if="statsData" class="space-y-6">
              <!-- 时间范围选择器 -->
              <Card>
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm font-medium text-secondary-300">统计时间范围</span>
                  </div>
                  <div class="flex gap-2">
                    <Button
                      :disabled="loading || modelStatsLoading"
                      :variant="statsPeriod === 'daily' ? 'primary' : 'ghost'"
                      size="sm"
                      @click="switchPeriod('daily')"
                    >
                      今日
                    </Button>
                    <Button
                      :disabled="loading || modelStatsLoading"
                      :variant="statsPeriod === 'monthly' ? 'primary' : 'ghost'"
                      size="sm"
                      @click="switchPeriod('monthly')"
                    >
                      本月
                    </Button>
                  </div>
                </div>
              </Card>

              <!-- 基本信息和统计概览 -->
              <StatsOverview />

              <!-- Token 分布和限制配置 -->
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TokenDistribution />
                <template v-if="multiKeyMode">
                  <AggregatedStatsCard />
                </template>
                <template v-else>
                  <LimitConfig />
                </template>
              </div>

              <!-- 模型使用统计 -->
              <ModelUsageStats />
            </div>
          </div>
        </template>

        <!-- 教程内容 -->
        <template #panel-tutorial>
          <div>
            <TutorialView />
          </div>
        </template>
      </Tabs>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import { useThemeStore } from '@/stores/theme'
import { Button, Card, Tabs, Alert } from '@/ui'
import LogoTitle from '@/components/common/LogoTitle.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
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

// 主题相关
const isDarkMode = computed(() => themeStore.isDarkMode)

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
