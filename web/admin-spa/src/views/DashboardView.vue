<template>
  <div>
    <!-- 主要统计 -->
    <div>
      <div>
        <div>
          <div>
            <p>总API Keys</p>
            <p>
              {{ dashboardData.totalApiKeys }}
            </p>
            <p>活跃: {{ dashboardData.activeApiKeys || 0 }}</p>
          </div>
          <div></div>
        </div>
      </div>

      <div>
        <div>
          <div>
            <p>服务账户</p>
            <div>
              <p>
                {{ dashboardData.totalAccounts }}
              </p>
              <!-- 各平台账户数量展示 -->
              <div v-if="dashboardData.accountsByPlatform">
                <!-- Claude账户 -->
                <div
                  v-if="
                    dashboardData.accountsByPlatform.claude &&
                    dashboardData.accountsByPlatform.claude.total > 0
                  "
                  :title="`Claude: ${dashboardData.accountsByPlatform.claude.total} 个 (正常: ${dashboardData.accountsByPlatform.claude.normal})`"
                >
                  <span>{{ dashboardData.accountsByPlatform.claude.total }}</span>
                </div>
                <!-- Claude Console账户 -->
                <div
                  v-if="
                    dashboardData.accountsByPlatform['claude-console'] &&
                    dashboardData.accountsByPlatform['claude-console'].total > 0
                  "
                  :title="`Console: ${dashboardData.accountsByPlatform['claude-console'].total} 个 (正常: ${dashboardData.accountsByPlatform['claude-console'].normal})`"
                >
                  <span>{{ dashboardData.accountsByPlatform['claude-console'].total }}</span>
                </div>
                <!-- Gemini账户 -->
                <div
                  v-if="
                    dashboardData.accountsByPlatform.gemini &&
                    dashboardData.accountsByPlatform.gemini.total > 0
                  "
                  :title="`Gemini: ${dashboardData.accountsByPlatform.gemini.total} 个 (正常: ${dashboardData.accountsByPlatform.gemini.normal})`"
                >
                  <span>{{ dashboardData.accountsByPlatform.gemini.total }}</span>
                </div>
                <!-- Bedrock账户 -->
                <div
                  v-if="
                    dashboardData.accountsByPlatform.bedrock &&
                    dashboardData.accountsByPlatform.bedrock.total > 0
                  "
                  :title="`Bedrock: ${dashboardData.accountsByPlatform.bedrock.total} 个 (正常: ${dashboardData.accountsByPlatform.bedrock.normal})`"
                >
                  <span>{{ dashboardData.accountsByPlatform.bedrock.total }}</span>
                </div>
                <!-- OpenAI账户 -->
                <div
                  v-if="
                    dashboardData.accountsByPlatform.openai &&
                    dashboardData.accountsByPlatform.openai.total > 0
                  "
                  :title="`OpenAI: ${dashboardData.accountsByPlatform.openai.total} 个 (正常: ${dashboardData.accountsByPlatform.openai.normal})`"
                >
                  <span>{{ dashboardData.accountsByPlatform.openai.total }}</span>
                </div>
                <!-- Azure OpenAI账户 -->
                <div
                  v-if="
                    dashboardData.accountsByPlatform.azure_openai &&
                    dashboardData.accountsByPlatform.azure_openai.total > 0
                  "
                  :title="`Azure OpenAI: ${dashboardData.accountsByPlatform.azure_openai.total} 个 (正常: ${dashboardData.accountsByPlatform.azure_openai.normal})`"
                >
                  <span>{{ dashboardData.accountsByPlatform.azure_openai.total }}</span>
                </div>
                <!-- OpenAI-Responses账户 -->
                <div
                  v-if="
                    dashboardData.accountsByPlatform['openai-responses'] &&
                    dashboardData.accountsByPlatform['openai-responses'].total > 0
                  "
                  :title="`OpenAI Responses: ${dashboardData.accountsByPlatform['openai-responses'].total} 个 (正常: ${dashboardData.accountsByPlatform['openai-responses'].normal})`"
                >
                  <span>{{ dashboardData.accountsByPlatform['openai-responses'].total }}</span>
                </div>
              </div>
            </div>
            <p>
              正常: {{ dashboardData.normalAccounts || 0 }}
              <span v-if="dashboardData.abnormalAccounts > 0">
                | 异常: {{ dashboardData.abnormalAccounts }}
              </span>
              <span v-if="dashboardData.pausedAccounts > 0">
                | 停止调度: {{ dashboardData.pausedAccounts }}
              </span>
              <span v-if="dashboardData.rateLimitedAccounts > 0">
                | 限流: {{ dashboardData.rateLimitedAccounts }}
              </span>
            </p>
          </div>
          <div></div>
        </div>
      </div>

      <div>
        <div>
          <div>
            <p>今日请求</p>
            <p>
              {{ dashboardData.todayRequests }}
            </p>
            <p>总请求: {{ formatNumber(dashboardData.totalRequests || 0) }}</p>
          </div>
          <div></div>
        </div>
      </div>

      <div>
        <div>
          <div>
            <p>系统状态</p>
            <p>
              {{ dashboardData.systemStatus }}
            </p>
            <p>运行时间: {{ formattedUptime }}</p>
          </div>
          <div></div>
        </div>
      </div>
    </div>

    <!-- Token统计和性能指标 -->
    <div>
      <div>
        <div>
          <div>
            <p>今日Token</p>
            <div>
              <p>
                {{
                  formatNumber(
                    (dashboardData.todayInputTokens || 0) +
                      (dashboardData.todayOutputTokens || 0) +
                      (dashboardData.todayCacheCreateTokens || 0) +
                      (dashboardData.todayCacheReadTokens || 0)
                  )
                }}
              </p>
              <span>/ {{ costsData.todayCosts.formatted.totalCost }}</span>
            </div>
            <div>
              <div>
                <span
                  >输入: <span>{{ formatNumber(dashboardData.todayInputTokens || 0) }}</span></span
                >
                <span
                  >输出: <span>{{ formatNumber(dashboardData.todayOutputTokens || 0) }}</span></span
                >
                <span v-if="(dashboardData.todayCacheCreateTokens || 0) > 0"
                  >缓存创建:
                  <span>{{ formatNumber(dashboardData.todayCacheCreateTokens || 0) }}</span></span
                >
                <span v-if="(dashboardData.todayCacheReadTokens || 0) > 0"
                  >缓存读取:
                  <span>{{ formatNumber(dashboardData.todayCacheReadTokens || 0) }}</span></span
                >
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      <div>
        <div>
          <div>
            <p>总Token消耗</p>
            <div>
              <p>
                {{
                  formatNumber(
                    (dashboardData.totalInputTokens || 0) +
                      (dashboardData.totalOutputTokens || 0) +
                      (dashboardData.totalCacheCreateTokens || 0) +
                      (dashboardData.totalCacheReadTokens || 0)
                  )
                }}
              </p>
              <span>/ {{ costsData.totalCosts.formatted.totalCost }}</span>
            </div>
            <div>
              <div>
                <span
                  >输入: <span>{{ formatNumber(dashboardData.totalInputTokens || 0) }}</span></span
                >
                <span
                  >输出: <span>{{ formatNumber(dashboardData.totalOutputTokens || 0) }}</span></span
                >
                <span v-if="(dashboardData.totalCacheCreateTokens || 0) > 0"
                  >缓存创建:
                  <span>{{ formatNumber(dashboardData.totalCacheCreateTokens || 0) }}</span></span
                >
                <span v-if="(dashboardData.totalCacheReadTokens || 0) > 0"
                  >缓存读取:
                  <span>{{ formatNumber(dashboardData.totalCacheReadTokens || 0) }}</span></span
                >
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      <div>
        <div>
          <div>
            <p>
              实时RPM
              <span>({{ dashboardData.metricsWindow }}分钟)</span>
            </p>
            <p>
              {{ dashboardData.realtimeRPM || 0 }}
            </p>
            <p>
              每分钟请求数
              <span v-if="dashboardData.isHistoricalMetrics"> 历史数据 </span>
            </p>
          </div>
          <div></div>
        </div>
      </div>

      <div>
        <div>
          <div>
            <p>
              实时TPM
              <span>({{ dashboardData.metricsWindow }}分钟)</span>
            </p>
            <p>
              {{ formatNumber(dashboardData.realtimeTPM || 0) }}
            </p>
            <p>
              每分钟Token数
              <span v-if="dashboardData.isHistoricalMetrics"> 历史数据 </span>
            </p>
          </div>
          <div></div>
        </div>
      </div>
    </div>

    <!-- 模型消费统计 -->
    <div>
      <div>
        <h3>模型使用分布与Token使用趋势</h3>
        <div>
          <!-- 快捷日期选择 -->
          <div>
            <button
              v-for="option in dateFilter.presetOptions"
              :key="option.value"
              @click="setDateFilterPreset(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <!-- 粒度切换按钮 -->
          <div>
            <button @click="setTrendGranularity('day')">按天</button>
            <button @click="setTrendGranularity('hour')">按小时</button>
          </div>

          <!-- Element Plus 日期范围选择器 -->
          <div>
            <el-date-picker
              v-model="dateFilter.customRange"
              :default-time="defaultTime"
              :disabled-date="disabledDate"
              end-placeholder="结束日期"
              format="YYYY-MM-DD HH:mm:ss"
              range-separator="至"
              size="default"
              start-placeholder="开始日期"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="onCustomDateRangeChange"
            />
            <span v-if="trendGranularity === 'hour'"> 最多24小时 </span>
          </div>

          <!-- 刷新控制 -->
          <div>
            <!-- 自动刷新控制 -->
            <div>
              <label>
                <input v-model="autoRefreshEnabled" type="checkbox" />
                <!-- 更小的开关 -->
                <div />
                <span>
                  <span>自动刷新</span>
                  <span v-if="autoRefreshEnabled"> {{ refreshCountdown }}s </span>
                </span>
              </label>
            </div>

            <!-- 刷新按钮 -->
            <button :disabled="isRefreshing" title="立即刷新数据" @click="refreshAllData()">
              <span>{{ isRefreshing ? '刷新中' : '刷新' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <!-- 饼图 -->
        <div>
          <h4>Token使用分布</h4>
          <div>
            <canvas ref="modelUsageChart" />
          </div>
        </div>

        <!-- 详细数据表格 -->
        <div>
          <h4>详细统计数据</h4>
          <div v-if="dashboardModelStats.length === 0">
            <p>暂无模型使用数据</p>
          </div>
          <div v-else>
            <table>
              <thead>
                <tr>
                  <th>模型</th>
                  <th>请求数</th>
                  <th>总Token</th>
                  <th>费用</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in dashboardModelStats" :key="stat.model">
                  <td>
                    <span :title="stat.model">
                      {{ stat.model }}
                    </span>
                  </td>
                  <td>
                    {{ formatNumber(stat.requests) }}
                  </td>
                  <td>
                    {{ formatNumber(stat.allTokens) }}
                  </td>
                  <td>
                    {{ stat.formatted ? stat.formatted.total : '$0.000000' }}
                  </td>
                  <td>
                    <span> {{ calculatePercentage(stat.allTokens, dashboardModelStats) }}% </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Token使用趋势图 -->
    <div>
      <div>
        <div>
          <canvas ref="usageTrendChart" />
        </div>
      </div>
    </div>

    <!-- API Keys 使用趋势图 -->
    <div>
      <div>
        <div>
          <h3>API Keys 使用趋势</h3>
          <!-- 维度切换按钮 -->
          <div>
            <button @click="((apiKeysTrendMetric = 'requests'), updateApiKeysUsageTrendChart())">
              <span>请求次数</span><span>请求</span>
            </button>
            <button @click="((apiKeysTrendMetric = 'tokens'), updateApiKeysUsageTrendChart())">
              <span>Token 数量</span><span>Token</span>
            </button>
          </div>
        </div>
        <div>
          <span v-if="apiKeysTrendData.totalApiKeys > 10">
            共 {{ apiKeysTrendData.totalApiKeys }} 个 API Key，显示使用量前 10 个
          </span>
          <span v-else> 共 {{ apiKeysTrendData.totalApiKeys }} 个 API Key </span>
        </div>
        <div>
          <canvas ref="apiKeysUsageTrendChart" />
        </div>
      </div>
    </div>

    <!-- 账号使用趋势图 -->
    <div>
      <div>
        <div>
          <div>
            <h3>账号使用趋势</h3>
            <span> 当前分组：{{ accountUsageTrendData.groupLabel || '未选择' }} </span>
          </div>
          <div>
            <div>
              <button
                v-for="option in accountGroupOptions"
                :key="option.value"
                @click="handleAccountUsageGroupChange(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
        <div>
          <span>共 {{ accountUsageTrendData.totalAccounts || 0 }} 个账号</span>
          <span
            v-if="accountUsageTrendData.topAccounts && accountUsageTrendData.topAccounts.length"
          >
            显示消耗排名前 {{ accountUsageTrendData.topAccounts.length }} 个账号
          </span>
        </div>
        <div v-if="!accountUsageTrendData.data || accountUsageTrendData.data.length === 0">
          暂无账号使用数据
        </div>
        <div v-else>
          <canvas ref="accountUsageTrendChart" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import { useThemeStore } from '@/stores/theme'
import { useChartConfig } from '@/composables/useChartConfig'
import Chart from 'chart.js/auto'

// 初始化 Chart.js 全局配置
const { trendLineColors } = useChartConfig()

const dashboardStore = useDashboardStore()
const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

const {
  dashboardData,
  costsData,
  dashboardModelStats,
  trendData,
  apiKeysTrendData,
  accountUsageTrendData,
  accountUsageGroup,
  formattedUptime,
  dateFilter,
  trendGranularity,
  apiKeysTrendMetric,
  defaultTime
} = storeToRefs(dashboardStore)

const {
  loadDashboardData,
  loadApiKeysTrend,
  setDateFilterPreset,
  onCustomDateRangeChange,
  setTrendGranularity,
  refreshChartsData,
  setAccountUsageGroup,
  disabledDate
} = dashboardStore

// Chart 实例
const modelUsageChart = ref(null)
const usageTrendChart = ref(null)
const apiKeysUsageTrendChart = ref(null)
const accountUsageTrendChart = ref(null)
let modelUsageChartInstance = null
let usageTrendChartInstance = null
let apiKeysUsageTrendChartInstance = null
let accountUsageTrendChartInstance = null

const accountGroupOptions = [
  { value: 'claude', label: 'Claude' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'droid', label: 'Droid' }
]

const accountTrendUpdating = ref(false)

// 自动刷新相关
const autoRefreshEnabled = ref(false)
const autoRefreshInterval = ref(30) // 秒
const autoRefreshTimer = ref(null)
const refreshCountdown = ref(0)
const countdownTimer = ref(null)
const isRefreshing = ref(false)

// 计算倒计时显示
// const refreshCountdownDisplay = computed(() => {
// if (!autoRefreshEnabled.value || refreshCountdown.value <= 0) return ''
// return `${refreshCountdown.value}秒后刷新`
// })

// 图表颜色配置（根据主题动态调整）
const chartColors = computed(() => ({
  text: isDarkMode.value ? '#e5e7eb' : '#374151',
  grid: isDarkMode.value ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)',
  legend: isDarkMode.value ? '#e5e7eb' : '#374151'
}))

// 格式化数字
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toString()
}

function formatCostValue(cost) {
  if (!Number.isFinite(cost)) {
    return '$0.000000'
  }
  if (cost >= 1) {
    return `$${cost.toFixed(2)}`
  }
  if (cost >= 0.01) {
    return `$${cost.toFixed(3)}`
  }
  return `$${cost.toFixed(6)}`
}

// 计算百分比
function calculatePercentage(value, stats) {
  if (!stats || stats.length === 0) return 0
  const total = stats.reduce((sum, stat) => sum + stat.allTokens, 0)
  if (total === 0) return 0
  return ((value / total) * 100).toFixed(1)
}

// 创建模型使用饼图
function createModelUsageChart() {
  if (!modelUsageChart.value) return

  if (modelUsageChartInstance) {
    modelUsageChartInstance.destroy()
  }

  const data = dashboardModelStats.value || []
  const chartData = {
    labels: data.map((d) => d.model),
    datasets: [
      {
        data: data.map((d) => d.allTokens),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#14B8A6',
          '#F97316',
          '#6366F1',
          '#84CC16'
        ],
        borderWidth: 0
      }
    ]
  }

  modelUsageChartInstance = new Chart(modelUsageChart.value, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        }
      }
    }
  })
}
</script>
