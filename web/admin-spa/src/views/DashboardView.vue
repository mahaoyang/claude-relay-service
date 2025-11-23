<template>
  <PageContainer max-width="7xl">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">系统控制台</h1>
          <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
            实时监控系统状态和使用情况
          </p>
        </div>
        <div class="flex items-center gap-4">
          <!-- 主题切换按钮 -->
          <ThemeToggle class="shadow-sm transition-shadow hover:shadow-md" mode="dropdown" />
        </div>
      </div>
    </template>

    <!-- 系统概览 - 整合卡片 -->
    <Card class="mb-8">
      <!-- Section 2: Token 统计 - 2列网格 -->
      <div
        class="grid grid-cols-1 gap-6 border-b border-gray-200 pb-6 dark:border-gray-700 lg:grid-cols-2"
      >
        <!-- 今日 Token -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="今日 Token"
          >
            <Coins class="h-9 w-9 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              今日 TOKEN
            </p>
            <div class="flex items-baseline gap-2">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{
                formatNumber(
                  (dashboardData.todayInputTokens || 0) +
                    (dashboardData.todayOutputTokens || 0) +
                    (dashboardData.todayCacheCreateTokens || 0) +
                    (dashboardData.todayCacheReadTokens || 0)
                )
              }}</span>
              <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {{ costsData.todayCosts?.formatted?.totalCost || '$0.00' }}
              </span>
            </div>
            <div class="mt-1 flex flex-wrap gap-2 text-[10px] text-gray-600 dark:text-gray-400">
              <span
                >输入
                <span class="font-medium">{{
                  formatNumber(dashboardData.todayInputTokens || 0)
                }}</span></span
              >
              <span
                >输出
                <span class="font-medium">{{
                  formatNumber(dashboardData.todayOutputTokens || 0)
                }}</span></span
              >
              <span
                >缓存创建
                <span class="font-medium">{{
                  formatNumber(dashboardData.todayCacheCreateTokens || 0)
                }}</span></span
              >
              <span
                >缓存读取
                <span class="font-medium">{{
                  formatNumber(dashboardData.todayCacheReadTokens || 0)
                }}</span></span
              >
            </div>
          </div>
        </div>

        <!-- 累计 Token -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="累计 Token"
          >
            <TrendingUp class="h-9 w-9 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              累计 TOKEN
            </p>
            <div class="flex items-baseline gap-2">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{
                formatNumber(
                  (dashboardData.totalInputTokens || 0) +
                    (dashboardData.totalOutputTokens || 0) +
                    (dashboardData.totalCacheCreateTokens || 0) +
                    (dashboardData.totalCacheReadTokens || 0)
                )
              }}</span>
              <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {{ costsData.totalCosts?.formatted?.totalCost || '$0.00' }}
              </span>
            </div>
            <div class="mt-1 flex flex-wrap gap-2 text-[10px] text-gray-600 dark:text-gray-400">
              <span
                >输入
                <span class="font-medium">{{
                  formatNumber(dashboardData.totalInputTokens || 0)
                }}</span></span
              >
              <span
                >输出
                <span class="font-medium">{{
                  formatNumber(dashboardData.totalOutputTokens || 0)
                }}</span></span
              >
              <span
                >缓存创建
                <span class="font-medium">{{
                  formatNumber(dashboardData.totalCacheCreateTokens || 0)
                }}</span></span
              >
              <span
                >缓存读取
                <span class="font-medium">{{
                  formatNumber(dashboardData.totalCacheReadTokens || 0)
                }}</span></span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Section 1+3: 主要指标与实时监控 - 合并网格 -->
      <div class="mb-4 pt-6">
        <h3
          class="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          主要指标与实时监控
        </h3>
      </div>
      <div class="grid grid-cols-1 gap-6 pb-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
        <!-- 系统状态 -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="系统状态"
          >
            <BadgeCheck class="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              系统状态
            </p>
            <p class="text-sm font-bold text-primary-600 dark:text-primary-400">
              {{ dashboardData.systemStatus }}
            </p>
            <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
              运行 <span class="font-semibold">{{ formattedUptime }}</span>
            </p>
          </div>
        </div>

        <!-- API Keys -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="API Keys"
          >
            <KeyRound class="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              API KEYS
            </p>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ dashboardData.totalApiKeys }}
            </p>
            <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
              活跃 <span class="font-semibold">{{ dashboardData.activeApiKeys || 0 }}</span>
            </p>
          </div>
        </div>

        <!-- 今日请求 -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="今日请求"
          >
            <BarChart3 class="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              今日请求
            </p>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ formatNumber(dashboardData.todayRequests) }}
            </p>
            <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
              总计
              <span class="font-semibold text-primary-600 dark:text-primary-400">{{
                formatNumber(dashboardData.totalRequests || 0)
              }}</span>
              次
            </p>
          </div>
        </div>

        <!-- 服务账户 -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="服务账户"
          >
            <Server class="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              服务账户
            </p>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ dashboardData.totalAccounts }}
            </p>
            <div
              class="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400"
            >
              <span
                >正常
                <span class="font-semibold">{{ dashboardData.normalAccounts || 0 }}</span></span
              >
              <span v-if="dashboardData.abnormalAccounts > 0">·</span>
              <span
                v-if="dashboardData.abnormalAccounts > 0"
                class="text-primary-600 dark:text-primary-400"
              >
                异常 <span class="font-semibold">{{ dashboardData.abnormalAccounts }}</span>
              </span>
              <span v-if="dashboardData.pausedAccounts > 0">·</span>
              <span
                v-if="dashboardData.pausedAccounts > 0"
                class="text-primary-600 dark:text-primary-400"
              >
                停止 <span class="font-semibold">{{ dashboardData.pausedAccounts }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 实时 RPM -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="实时 RPM"
          >
            <Activity class="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              实时 RPM
            </p>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ dashboardData.realtimeRPM || 0 }}
            </p>
            <p class="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              {{ dashboardData.metricsWindow || 5 }} 分钟
              <span
                v-if="dashboardData.isHistoricalMetrics"
                class="text-primary-600 dark:text-primary-400"
              >
                (历史)
              </span>
            </p>
          </div>
        </div>

        <!-- 实时 TPM -->
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="实时 TPM"
          >
            <Gauge class="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              实时 TPM
            </p>
            <p class="text-sm font-bold text-gray-900 dark:text-white">
              {{ formatNumber(dashboardData.realtimeTPM || 0) }}
            </p>
            <p class="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              {{ dashboardData.metricsWindow || 5 }} 分钟
              <span
                v-if="dashboardData.isHistoricalMetrics"
                class="text-primary-600 dark:text-primary-400"
              >
                (历史)
              </span>
            </p>
          </div>
        </div>

        <!-- 平台分布 -->
        <div class="flex items-start gap-3 lg:col-span-2">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            title="平台分布"
          >
            <Boxes class="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              平台分布
            </p>
            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ platformCount }}</p>
            <div v-if="dashboardData.accountsByPlatform" class="mt-1 flex flex-wrap gap-1">
              <span
                v-if="
                  dashboardData.accountsByPlatform.claude &&
                  dashboardData.accountsByPlatform.claude.total > 0
                "
                class="rounded bg-primary-100 px-[6px] pb-[2px] pt-[1.5px] text-[8px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                :title="`Claude: ${dashboardData.accountsByPlatform.claude.total} 个 (正常: ${dashboardData.accountsByPlatform.claude.normal})`"
              >
                Claude {{ dashboardData.accountsByPlatform.claude.total }}
              </span>
              <span
                v-if="
                  dashboardData.accountsByPlatform['claude-console'] &&
                  dashboardData.accountsByPlatform['claude-console'].total > 0
                "
                class="rounded bg-primary-100 px-[6px] pb-[2px] pt-[1.5px] text-[8px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                :title="`Console: ${dashboardData.accountsByPlatform['claude-console'].total} 个 (正常: ${dashboardData.accountsByPlatform['claude-console'].normal})`"
              >
                Console {{ dashboardData.accountsByPlatform['claude-console'].total }}
              </span>
              <span
                v-if="
                  dashboardData.accountsByPlatform.gemini &&
                  dashboardData.accountsByPlatform.gemini.total > 0
                "
                class="rounded bg-primary-100 px-[6px] pb-[2px] pt-[1.5px] text-[8px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                :title="`Gemini: ${dashboardData.accountsByPlatform.gemini.total} 个 (正常: ${dashboardData.accountsByPlatform.gemini.normal})`"
              >
                Gemini {{ dashboardData.accountsByPlatform.gemini.total }}
              </span>
              <span
                v-if="
                  dashboardData.accountsByPlatform.bedrock &&
                  dashboardData.accountsByPlatform.bedrock.total > 0
                "
                class="rounded bg-primary-100 px-[6px] pb-[2px] pt-[1.5px] text-[8px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                :title="`Bedrock: ${dashboardData.accountsByPlatform.bedrock.total} 个 (正常: ${dashboardData.accountsByPlatform.bedrock.normal})`"
              >
                Bedrock {{ dashboardData.accountsByPlatform.bedrock.total }}
              </span>
              <span
                v-if="
                  dashboardData.accountsByPlatform.openai &&
                  dashboardData.accountsByPlatform.openai.total > 0
                "
                class="rounded bg-primary-100 px-[6px] pb-[2px] pt-[1.5px] text-[8px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                :title="`OpenAI: ${dashboardData.accountsByPlatform.openai.total} 个 (正常: ${dashboardData.accountsByPlatform.openai.normal})`"
              >
                OpenAI {{ dashboardData.accountsByPlatform.openai.total }}
              </span>
              <span
                v-if="
                  dashboardData.accountsByPlatform.azure_openai &&
                  dashboardData.accountsByPlatform.azure_openai.total > 0
                "
                class="rounded bg-primary-100 px-[6px] pb-[2px] pt-[1.5px] text-[8px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                :title="`Azure OpenAI: ${dashboardData.accountsByPlatform.azure_openai.total} 个 (正常: ${dashboardData.accountsByPlatform.azure_openai.normal})`"
              >
                Azure {{ dashboardData.accountsByPlatform.azure_openai.total }}
              </span>
              <span
                v-if="
                  dashboardData.accountsByPlatform['openai-responses'] &&
                  dashboardData.accountsByPlatform['openai-responses'].total > 0
                "
                class="rounded bg-primary-100 px-[6px] pb-[2px] pt-[1.5px] text-[8px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                :title="`OpenAI Responses: ${dashboardData.accountsByPlatform['openai-responses'].total} 个 (正常: ${dashboardData.accountsByPlatform['openai-responses'].normal})`"
              >
                Responses {{ dashboardData.accountsByPlatform['openai-responses'].total }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 模型消费统计 -->
    <Card class="mb-8">
      <div class="space-y-6 p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            模型使用分布与Token使用趋势
          </h3>
          <div class="flex flex-wrap items-center gap-3">
            <!-- 快捷日期选择 -->
            <div class="flex gap-2">
              <button
                v-for="option in dateFilter.presetOptions"
                :key="option.value"
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                :class="
                  dateFilter.preset === option.value
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                "
                @click="setDateFilterPreset(option.value)"
              >
                {{ option.label }}
              </button>
            </div>

            <!-- 粒度切换按钮 -->
            <div class="flex gap-2">
              <button
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                :class="
                  trendGranularity === 'day'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                "
                @click="setTrendGranularity('day')"
              >
                按天
              </button>
              <button
                class="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                :class="
                  trendGranularity === 'hour'
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                "
                @click="setTrendGranularity('hour')"
              >
                按小时
              </button>
            </div>

            <!-- Element Plus 日期范围选择器 -->
            <div class="flex items-center gap-2">
              <el-date-picker
                v-model="dateFilter.customRange"
                class="w-auto"
                :default-time="defaultTime"
                :disabled-date="disabledDate"
                end-placeholder="结束日期"
                format="YYYY-MM-DD HH:mm:ss"
                range-separator="至"
                size="small"
                start-placeholder="开始日期"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="onCustomDateRangeChange"
              />
              <span
                v-if="trendGranularity === 'hour'"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                最多24小时
              </span>
            </div>

            <!-- 刷新控制 -->
            <div class="flex items-center gap-2">
              <!-- 自动刷新控制 -->
              <label class="flex cursor-pointer items-center gap-2">
                <input v-model="autoRefreshEnabled" class="peer sr-only" type="checkbox" />
                <div
                  class="relative h-4 w-7 rounded-full bg-gray-200 transition-colors peer-checked:bg-primary-600 dark:bg-gray-700"
                >
                  <div
                    class="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-3"
                  ></div>
                </div>
                <span class="text-xs text-gray-600 dark:text-gray-400">
                  自动刷新
                  <span v-if="autoRefreshEnabled" class="text-primary-600 dark:text-primary-400">
                    {{ refreshCountdown }}s
                  </span>
                </span>
              </label>

              <!-- 刷新按钮 -->
              <button
                class="rounded-md bg-primary-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
                :disabled="isRefreshing"
                title="立即刷新数据"
                @click="refreshAllData()"
              >
                {{ isRefreshing ? '刷新中' : '刷新' }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- 饼图 -->
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-white">Token使用分布</h4>
            <div class="h-[300px]">
              <canvas ref="modelUsageChart" />
            </div>
          </div>

          <!-- 详细数据表格 -->
          <div class="space-y-4">
            <h4 class="text-base font-medium text-gray-900 dark:text-white">详细统计数据</h4>
            <div
              v-if="dashboardModelStats.length === 0"
              class="flex h-[300px] items-center justify-center text-gray-500 dark:text-gray-400"
            >
              <p>暂无模型使用数据</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead
                  class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                      模型
                    </th>
                    <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                      请求数
                    </th>
                    <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                      总Token
                    </th>
                    <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                      费用
                    </th>
                    <th class="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                      占比
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr
                    v-for="stat in dashboardModelStats"
                    :key="stat.model"
                    class="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td class="px-4 py-2 text-gray-900 dark:text-white">
                      <span class="block max-w-[200px] truncate" :title="stat.model">
                        {{ stat.model }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                      {{ formatNumber(stat.requests) }}
                    </td>
                    <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                      {{ formatNumber(stat.allTokens) }}
                    </td>
                    <td class="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                      {{ stat.formatted ? stat.formatted.total : '$0.000000' }}
                    </td>
                    <td class="px-4 py-2 text-right">
                      <span class="font-medium text-primary-600 dark:text-primary-400">
                        {{ calculatePercentage(stat.allTokens, dashboardModelStats) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Token使用趋势图 -->
    <Card class="mb-8">
      <div class="space-y-4 p-6">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Token 使用趋势</h3>
        <div class="h-[400px]">
          <canvas ref="usageTrendChart" />
        </div>
      </div>
    </Card>

    <!-- API Keys 使用趋势图 -->
    <Card class="mb-8">
      <div class="space-y-4 p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">API Keys 使用趋势</h3>
          <!-- 维度切换按钮 -->
          <div class="flex gap-2">
            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                apiKeysTrendMetric === 'requests'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              "
              @click="((apiKeysTrendMetric = 'requests'), updateApiKeysUsageTrendChart())"
            >
              <span class="hidden sm:inline">请求次数</span>
              <span class="sm:hidden">请求</span>
            </button>
            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                apiKeysTrendMetric === 'tokens'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              "
              @click="((apiKeysTrendMetric = 'tokens'), updateApiKeysUsageTrendChart())"
            >
              <span class="hidden sm:inline">Token 数量</span>
              <span class="sm:hidden">Token</span>
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          <span v-if="apiKeysTrendData.totalApiKeys > 10">
            共 {{ apiKeysTrendData.totalApiKeys }} 个 API Key，显示使用量前 10 个
          </span>
          <span v-else> 共 {{ apiKeysTrendData.totalApiKeys }} 个 API Key </span>
        </p>
        <div class="h-[400px]">
          <canvas ref="apiKeysUsageTrendChart" />
        </div>
      </div>
    </Card>

    <!-- 账号使用趋势图 -->
    <Card class="mb-8">
      <div class="space-y-4 p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">账号使用趋势</h3>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              当前分组：{{ accountUsageTrendData.groupLabel || '未选择' }}
            </span>
          </div>
          <div class="flex gap-2">
            <button
              v-for="option in accountGroupOptions"
              :key="option.value"
              class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              :class="
                accountUsageGroup === option.value
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              "
              @click="handleAccountUsageGroupChange(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          <span>共 {{ accountUsageTrendData.totalAccounts || 0 }} 个账号</span>
          <span
            v-if="accountUsageTrendData.topAccounts && accountUsageTrendData.topAccounts.length"
          >
            ，显示消耗排名前 {{ accountUsageTrendData.topAccounts.length }} 个账号
          </span>
        </p>
        <div
          v-if="!accountUsageTrendData.data || accountUsageTrendData.data.length === 0"
          class="flex h-[400px] items-center justify-center text-gray-500 dark:text-gray-400"
        >
          暂无账号使用数据
        </div>
        <div v-else class="h-[400px]">
          <canvas ref="accountUsageTrendChart" />
        </div>
      </div>
    </Card>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import { useThemeStore } from '@/stores/theme'
import { useChartConfig } from '@/composables/useChartConfig'
import { Card } from '@/ui'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import Chart from 'chart.js/auto'
import {
  BadgeCheck,
  KeyRound,
  BarChart3,
  Server,
  Activity,
  Gauge,
  Coins,
  TrendingUp,
  Boxes
} from 'lucide-vue-next'

// 初始化 Chart.js 全局配置
useChartConfig()

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

// 图表颜色配置（根据主题动态调整）
const chartColors = computed(() => ({
  text: isDarkMode.value ? '#e5e7eb' : '#374151',
  grid: isDarkMode.value ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)',
  legend: isDarkMode.value ? '#e5e7eb' : '#374151'
}))

// 计算平台总数
const platformCount = computed(() => {
  if (!dashboardData.value.accountsByPlatform) return 0
  const platforms = dashboardData.value.accountsByPlatform
  let count = 0
  if (platforms.claude && platforms.claude.total > 0) count++
  if (platforms['claude-console'] && platforms['claude-console'].total > 0) count++
  if (platforms.gemini && platforms.gemini.total > 0) count++
  if (platforms.bedrock && platforms.bedrock.total > 0) count++
  if (platforms.openai && platforms.openai.total > 0) count++
  if (platforms.azure_openai && platforms.azure_openai.total > 0) count++
  if (platforms['openai-responses'] && platforms['openai-responses'].total > 0) count++
  return count
})

// 格式化数字
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toString()
}

// 格式化成本显示
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
          'rgb(252, 207, 195)', // primary-200
          'rgb(249, 171, 149)', // primary-300
          'rgb(240, 138, 110)', // primary-400
          'rgb(217, 119, 87)', // primary-500
          'rgb(204, 95, 61)', // primary-600
          'rgb(168, 78, 50)', // primary-700
          'rgb(139, 64, 41)', // primary-800
          'rgb(114, 53, 34)', // primary-900
          'rgb(65, 29, 17)', // primary-950
          'rgb(254, 244, 242)' // primary-50
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
            },
            color: chartColors.value.legend
          }
        }
      }
    }
  })
}

// 创建使用趋势图
function createUsageTrendChart() {
  if (!usageTrendChart.value) return

  if (usageTrendChartInstance) {
    usageTrendChartInstance.destroy()
  }

  const data = trendData.value || []

  // 准备多维度数据
  const inputData = data.map((d) => d.inputTokens || 0)
  const outputData = data.map((d) => d.outputTokens || 0)
  const cacheCreateData = data.map((d) => d.cacheCreateTokens || 0)
  const cacheReadData = data.map((d) => d.cacheReadTokens || 0)
  const requestsData = data.map((d) => d.requests || 0)
  const costData = data.map((d) => d.cost || 0)

  // 根据数据类型确定标签字段和格式
  const labelField = data[0]?.date ? 'date' : 'hour'
  const labels = data.map((d) => {
    // 优先使用后端提供的label字段
    if (d.label) {
      return d.label
    }

    if (labelField === 'hour') {
      // 格式化小时显示
      const date = new Date(d.hour)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      return `${month}/${day} ${hour}:00`
    }
    // 按天显示时，只显示月/日，不显示年份
    const dateStr = d.date
    if (dateStr && dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts.length >= 3) {
        return `${parts[1]}/${parts[2]}`
      }
    }
    return d.date
  })

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: '输入Token',
        data: inputData,
        borderColor: 'rgb(217, 119, 87)', // primary-500
        backgroundColor: 'rgba(217, 119, 87, 0.1)',
        tension: 0.3
      },
      {
        label: '输出Token',
        data: outputData,
        borderColor: 'rgb(240, 138, 110)', // primary-400
        backgroundColor: 'rgba(240, 138, 110, 0.1)',
        tension: 0.3
      },
      {
        label: '缓存创建Token',
        data: cacheCreateData,
        borderColor: 'rgb(204, 95, 61)', // primary-600
        backgroundColor: 'rgba(204, 95, 61, 0.1)',
        tension: 0.3
      },
      {
        label: '缓存读取Token',
        data: cacheReadData,
        borderColor: 'rgb(168, 78, 50)', // primary-700
        backgroundColor: 'rgba(168, 78, 50, 0.1)',
        tension: 0.3
      },
      {
        label: '费用 (USD)',
        data: costData,
        borderColor: 'rgb(139, 64, 41)', // primary-800
        backgroundColor: 'rgba(139, 64, 41, 0.1)',
        tension: 0.3,
        yAxisID: 'y2'
      },
      {
        label: '请求数',
        data: requestsData,
        borderColor: 'rgb(249, 171, 149)', // primary-300
        backgroundColor: 'rgba(249, 171, 149, 0.1)',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  }

  usageTrendChartInstance = new Chart(usageTrendChart.value, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: chartColors.value.legend
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          itemSort: function (a, b) {
            // 按值倒序排列，费用和请求数特殊处理
            const aLabel = a.dataset.label || ''
            const bLabel = b.dataset.label || ''

            // 费用和请求数使用不同的轴，单独处理
            if (aLabel === '费用 (USD)' || bLabel === '费用 (USD)') {
              return aLabel === '费用 (USD)' ? -1 : 1
            }
            if (aLabel === '请求数' || bLabel === '请求数') {
              return aLabel === '请求数' ? 1 : -1
            }

            // 其他按token值倒序
            return b.parsed.y - a.parsed.y
          },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || ''
              let value = context.parsed.y

              if (label === '费用 (USD)') {
                // 格式化费用显示
                if (value < 0.01) {
                  return label + ': $' + value.toFixed(6)
                } else {
                  return label + ': $' + value.toFixed(4)
                }
              } else if (label === '请求数') {
                return label + ': ' + value.toLocaleString() + ' 次'
              } else {
                // 格式化token数显示
                if (value >= 1000000) {
                  return label + ': ' + (value / 1000000).toFixed(2) + 'M tokens'
                } else if (value >= 1000) {
                  return label + ': ' + (value / 1000).toFixed(2) + 'K tokens'
                } else {
                  return label + ': ' + value.toLocaleString() + ' tokens'
                }
              }
            }
          }
        }
      },
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: trendGranularity.value === 'hour' ? '时间' : '日期',
            color: chartColors.value.text
          },
          ticks: {
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Token数量',
            color: chartColors.value.text
          },
          ticks: {
            callback: function (value) {
              return formatNumber(value)
            },
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: '请求数',
            color: chartColors.value.text
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            callback: function (value) {
              return value.toLocaleString()
            },
            color: chartColors.value.text
          }
        },
        y2: {
          type: 'linear',
          display: false, // 隐藏费用轴，在tooltip中显示
          position: 'right'
        }
      }
    }
  })
}

// 创建 API Keys 使用趋势图
function createApiKeysUsageTrendChart() {
  if (!apiKeysUsageTrendChart.value) return

  if (apiKeysUsageTrendChartInstance) {
    apiKeysUsageTrendChartInstance.destroy()
  }

  const data = apiKeysTrendData.value.data || []
  const metric = apiKeysTrendMetric.value

  // 颜色数组 - 使用主色的深浅变化
  const colors = [
    'rgb(252, 207, 195)', // primary-200
    'rgb(249, 171, 149)', // primary-300
    'rgb(240, 138, 110)', // primary-400
    'rgb(217, 119, 87)', // primary-500
    'rgb(204, 95, 61)', // primary-600
    'rgb(168, 78, 50)', // primary-700
    'rgb(139, 64, 41)', // primary-800
    'rgb(114, 53, 34)', // primary-900
    'rgb(65, 29, 17)', // primary-950
    'rgb(254, 244, 242)' // primary-50
  ]

  // 准备数据集
  const datasets =
    apiKeysTrendData.value.topApiKeys?.map((apiKeyId, index) => {
      const data = apiKeysTrendData.value.data.map((item) => {
        if (!item.apiKeys || !item.apiKeys[apiKeyId]) return 0
        return metric === 'tokens'
          ? item.apiKeys[apiKeyId].tokens
          : item.apiKeys[apiKeyId].requests || 0
      })

      // 获取API Key名称
      const apiKeyName =
        apiKeysTrendData.value.data.find((item) => item.apiKeys && item.apiKeys[apiKeyId])?.apiKeys[
          apiKeyId
        ]?.name || `API Key ${apiKeyId}`

      return {
        label: apiKeyName,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.4,
        fill: false
      }
    }) || []

  // 根据数据类型确定标签字段
  const labelField = data[0]?.date ? 'date' : 'hour'

  const chartData = {
    labels: data.map((d) => {
      // 优先使用后端提供的label字段
      if (d.label) {
        return d.label
      }

      if (labelField === 'hour') {
        // 格式化小时显示
        const date = new Date(d.hour)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        return `${month}/${day} ${hour}:00`
      }
      // 按天显示时，只显示月/日，不显示年份
      const dateStr = d.date
      if (dateStr && dateStr.includes('-')) {
        const parts = dateStr.split('-')
        if (parts.length >= 3) {
          return `${parts[1]}/${parts[2]}`
        }
      }
      return d.date
    }),
    datasets: datasets
  }

  apiKeysUsageTrendChartInstance = new Chart(apiKeysUsageTrendChart.value, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            },
            color: chartColors.value.legend
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          itemSort: function (a, b) {
            // 按值倒序排列
            return b.parsed.y - a.parsed.y
          },
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              const dataIndex = context.dataIndex
              const dataPoint = apiKeysTrendData.value.data[dataIndex]

              // 获取所有数据集在这个时间点的值，用于排名
              const allValues = context.chart.data.datasets
                .map((dataset, idx) => ({
                  value: dataset.data[dataIndex] || 0,
                  index: idx
                }))
                .sort((a, b) => b.value - a.value)

              // 找出当前数据集的排名
              const rank = allValues.findIndex((item) => item.index === context.datasetIndex) + 1

              // 准备排名标识
              let rankIcon = ''
              if (rank === 1) rankIcon = '🥇 '
              else if (rank === 2) rankIcon = '🥈 '
              else if (rank === 3) rankIcon = '🥉 '

              if (apiKeysTrendMetric.value === 'tokens') {
                // 格式化token显示
                let formattedValue = ''
                if (value >= 1000000) {
                  formattedValue = (value / 1000000).toFixed(2) + 'M'
                } else if (value >= 1000) {
                  formattedValue = (value / 1000).toFixed(2) + 'K'
                } else {
                  formattedValue = value.toLocaleString()
                }

                // 获取对应API Key的费用信息
                const apiKeyId = apiKeysTrendData.value.topApiKeys[context.datasetIndex]
                const apiKeyData = dataPoint?.apiKeys?.[apiKeyId]
                const cost = apiKeyData?.formattedCost || '$0.00'

                return `${rankIcon}${label}: ${formattedValue} tokens (${cost})`
              } else {
                return `${rankIcon}${label}: ${value.toLocaleString()} 次`
              }
            }
          }
        }
      },
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: trendGranularity.value === 'hour' ? '时间' : '日期',
            color: chartColors.value.text
          },
          ticks: {
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: apiKeysTrendMetric.value === 'tokens' ? 'Token 数量' : '请求次数',
            color: chartColors.value.text
          },
          ticks: {
            callback: function (value) {
              return formatNumber(value)
            },
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        }
      }
    }
  })
}

// 创建账号使用趋势图
function createAccountUsageTrendChart() {
  if (!accountUsageTrendChart.value) return

  if (accountUsageTrendChartInstance) {
    accountUsageTrendChartInstance.destroy()
  }

  const trend = accountUsageTrendData.value?.data || []
  const topAccounts = accountUsageTrendData.value?.topAccounts || []

  // 颜色数组 - 使用主色的深浅变化
  const colors = [
    'rgb(252, 207, 195)', // primary-200
    'rgb(249, 171, 149)', // primary-300
    'rgb(240, 138, 110)', // primary-400
    'rgb(217, 119, 87)', // primary-500
    'rgb(204, 95, 61)', // primary-600
    'rgb(168, 78, 50)', // primary-700
    'rgb(139, 64, 41)', // primary-800
    'rgb(114, 53, 34)', // primary-900
    'rgb(65, 29, 17)', // primary-950
    'rgb(254, 244, 242)' // primary-50
  ]

  const datasets = topAccounts.map((accountId, index) => {
    const dataPoints = trend.map((item) => {
      if (!item.accounts || !item.accounts[accountId]) return 0
      return item.accounts[accountId].cost || 0
    })

    const accountName =
      trend.find((item) => item.accounts && item.accounts[accountId])?.accounts[accountId]?.name ||
      `账号 ${String(accountId).slice(0, 6)}`

    return {
      label: accountName,
      data: dataPoints,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      tension: 0.4,
      fill: false
    }
  })

  const labelField = trend[0]?.date ? 'date' : 'hour'

  const chartData = {
    labels: trend.map((item) => {
      if (item.label) {
        return item.label
      }

      if (labelField === 'hour') {
        const date = new Date(item.hour)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        return `${month}/${day} ${hour}:00`
      }

      if (item.date && item.date.includes('-')) {
        const parts = item.date.split('-')
        if (parts.length >= 3) {
          return `${parts[1]}/${parts[2]}`
        }
      }

      return item.date
    }),
    datasets
  }

  const topAccountIds = topAccounts

  accountUsageTrendChartInstance = new Chart(accountUsageTrendChart.value, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            },
            color: chartColors.value.legend
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          itemSort: (a, b) => b.parsed.y - a.parsed.y,
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || ''
              const value = context.parsed.y || 0
              const dataIndex = context.dataIndex
              const datasetIndex = context.datasetIndex
              const accountId = topAccountIds[datasetIndex]
              const dataPoint = accountUsageTrendData.value.data[dataIndex]
              const accountDetail = dataPoint?.accounts?.[accountId]

              const allValues = context.chart.data.datasets
                .map((dataset, idx) => ({
                  value: dataset.data[dataIndex] || 0,
                  index: idx
                }))
                .sort((a, b) => b.value - a.value)

              const rank = allValues.findIndex((item) => item.index === datasetIndex) + 1
              let rankIcon = ''
              if (rank === 1) rankIcon = '🥇 '
              else if (rank === 2) rankIcon = '🥈 '
              else if (rank === 3) rankIcon = '🥉 '

              const formattedCost = accountDetail?.formattedCost || formatCostValue(value)
              const requests = accountDetail?.requests || 0

              return `${rankIcon}${label}: ${formattedCost} / ${requests.toLocaleString()} 次`
            }
          }
        }
      },
      scales: {
        x: {
          type: 'category',
          display: true,
          title: {
            display: true,
            text: trendGranularity.value === 'hour' ? '时间' : '日期',
            color: chartColors.value.text
          },
          ticks: {
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '消耗金额 (USD)',
            color: chartColors.value.text
          },
          ticks: {
            callback: (value) => formatCostValue(Number(value)),
            color: chartColors.value.text
          },
          grid: {
            color: chartColors.value.grid
          }
        }
      }
    }
  })
}

// 更新 API Keys 使用趋势图
async function updateApiKeysUsageTrendChart() {
  await loadApiKeysTrend(apiKeysTrendMetric.value)
  await nextTick()
  createApiKeysUsageTrendChart()
}

// 处理账号使用分组变化
async function handleAccountUsageGroupChange(group) {
  if (accountTrendUpdating.value) return
  accountTrendUpdating.value = true

  try {
    await setAccountUsageGroup(group)
    await nextTick()
    createAccountUsageTrendChart()
  } finally {
    accountTrendUpdating.value = false
  }
}

// 刷新所有数据
async function refreshAllData() {
  if (isRefreshing.value) return

  isRefreshing.value = true
  try {
    await loadDashboardData()
    await refreshChartsData()
    await nextTick()
    createModelUsageChart()
    createUsageTrendChart()
    createApiKeysUsageTrendChart()
    createAccountUsageTrendChart()
  } finally {
    isRefreshing.value = false
  }
}

// 启动自动刷新
function startAutoRefresh() {
  stopAutoRefresh()
  refreshCountdown.value = autoRefreshInterval.value

  // 启动倒计时定时器
  countdownTimer.value = setInterval(() => {
    refreshCountdown.value--
    if (refreshCountdown.value <= 0) {
      refreshCountdown.value = autoRefreshInterval.value
    }
  }, 1000)

  // 启动刷新定时器
  autoRefreshTimer.value = setInterval(() => {
    refreshAllData()
  }, autoRefreshInterval.value * 1000)
}

// 停止自动刷新
function stopAutoRefresh() {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  refreshCountdown.value = 0
}

// 监听自动刷新开关
watch(autoRefreshEnabled, (enabled) => {
  if (enabled) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// 监听主题变化，重新创建图表
watch(isDarkMode, () => {
  nextTick(() => {
    createModelUsageChart()
    createUsageTrendChart()
    createApiKeysUsageTrendChart()
    createAccountUsageTrendChart()
  })
})

// 监听数据变化，更新图表
watch([dashboardModelStats, trendData, apiKeysTrendData, accountUsageTrendData], () => {
  nextTick(() => {
    createModelUsageChart()
    createUsageTrendChart()
    createApiKeysUsageTrendChart()
    createAccountUsageTrendChart()
  })
})

onMounted(async () => {
  // 初始化主题
  themeStore.initTheme()

  // 加载所有数据
  await refreshAllData()

  // 创建图表
  await nextTick()
  createModelUsageChart()
  createUsageTrendChart()
  createApiKeysUsageTrendChart()
  createAccountUsageTrendChart()
})

onUnmounted(() => {
  stopAutoRefresh()
  if (modelUsageChartInstance) modelUsageChartInstance.destroy()
  if (usageTrendChartInstance) usageTrendChartInstance.destroy()
  if (apiKeysUsageTrendChartInstance) apiKeysUsageTrendChartInstance.destroy()
  if (accountUsageTrendChartInstance) accountUsageTrendChartInstance.destroy()
})
</script>
