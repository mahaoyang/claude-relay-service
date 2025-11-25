<template>
  <div class="space-y-8">
    <!-- 基本信息 / 批量概要 -->
    <Card>
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            {{ multiKeyMode ? '批量查询概要' : 'API Key 信息' }}
          </h3>
        </div>

        <!-- 批量模式 -->
        <div
          v-if="multiKeyMode && aggregatedStats"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
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
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                查询 Keys 数
              </p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                {{ aggregatedStats.totalKeys }} 个
              </p>
              <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
                有效 <span class="font-semibold">{{ aggregatedStats.activeKeys }}</span> 个
              </p>
            </div>
          </div>

          <div v-if="invalidKeys.length > 0" class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20"
            >
              <svg
                class="h-4 w-4 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                无效 Keys 数
              </p>
              <p class="text-sm font-bold text-red-600 dark:text-red-400">
                {{ invalidKeys.length }} 个
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                总请求数
              </p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                {{ formatNumber(aggregatedStats.usage.requests) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                总 Token 数
              </p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                {{ formatNumber(aggregatedStats.usage.allTokens) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20"
            >
              <svg
                class="h-4 w-4 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                总费用
              </p>
              <p class="text-sm font-bold text-green-600 dark:text-green-400">
                {{ aggregatedStats.usage.formattedCost }}
              </p>
            </div>
          </div>

          <div v-if="individualStats.length > 1" class="flex items-start gap-3 sm:col-span-2">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20"
            >
              <svg
                class="h-4 w-4 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Top 3 贡献占比
              </p>
              <div class="mt-2 space-y-1">
                <div
                  v-for="stat in topContributors"
                  :key="stat.apiId"
                  class="flex items-center justify-between text-xs"
                >
                  <span class="truncate text-gray-600 dark:text-gray-400">{{ stat.name }}</span>
                  <span class="ml-2 font-semibold text-primary-600 dark:text-primary-400"
                    >{{ calculateContribution(stat) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 单 Key 模式 -->
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                名称
              </p>
              <p class="truncate text-xs font-bold text-gray-900 dark:text-white">
                {{ statsData.name }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                状态
              </p>
              <p
                class="text-xs font-bold"
                :class="
                  statsData.isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{ statsData.isActive ? '活跃' : '已停用' }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                权限
              </p>
              <p class="text-xs font-bold text-gray-900 dark:text-white">
                {{ formatPermissions(statsData.permissions) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                创建时间
              </p>
              <p class="text-xs font-bold text-gray-900 dark:text-white">
                {{ formatDate(statsData.createdAt) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-4 w-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                过期时间
              </p>
              <div class="text-xs">
                <template
                  v-if="statsData.expirationMode === 'activation' && !statsData.isActivated"
                >
                  <span
                    class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  >
                    未激活
                  </span>
                  <span class="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                    首次使用后
                    {{
                      statsData.activationDays || (statsData.activationUnit === 'hours' ? 24 : 30)
                    }}
                    {{ statsData.activationUnit === 'hours' ? '小时' : '天' }}过期
                  </span>
                </template>
                <template v-else-if="statsData.expiresAt">
                  <span
                    v-if="isApiKeyExpired(statsData.expiresAt)"
                    class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  >
                    已过期
                  </span>
                  <span
                    v-else-if="isApiKeyExpiringSoon(statsData.expiresAt)"
                    class="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                  >
                    {{ formatExpireDate(statsData.expiresAt) }}
                  </span>
                  <span v-else class="text-xs font-bold text-gray-900 dark:text-white">{{
                    formatExpireDate(statsData.expiresAt)
                  }}</span>
                </template>
                <template v-else>
                  <span
                    class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    永不过期
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 使用统计概览 -->
    <Card>
      <div class="space-y-6">
        <div
          class="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
        >
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">使用统计概览</h3>
          <span
            class="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
          >
            {{ statsPeriod === 'daily' ? '今日' : '本月' }}
          </span>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div class="flex items-start gap-3">
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-5 w-5 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {{ statsPeriod === 'daily' ? '今日' : '本月' }}请求数
              </p>
              <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {{ formatNumber(currentPeriodData.requests) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-5 w-5 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {{ statsPeriod === 'daily' ? '今日' : '本月' }}Token 数
              </p>
              <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {{ formatNumber(currentPeriodData.allTokens) }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-5 w-5 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {{ statsPeriod === 'daily' ? '今日' : '本月' }}费用
              </p>
              <p class="mt-1 text-lg font-bold text-primary-600 dark:text-primary-400">
                {{ currentPeriodData.formattedCost || '$0.000000' }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
            >
              <svg
                class="h-5 w-5 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {{ statsPeriod === 'daily' ? '今日' : '本月' }}输入 Token
              </p>
              <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {{ formatNumber(currentPeriodData.inputTokens) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 专属账号运行状态，仅在单 key 且存在绑定时显示 -->
    <Card v-if="!multiKeyMode && boundAccountList.length > 0">
      <div class="space-y-6">
        <div
          class="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
        >
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">专属账号运行状态</h3>
          <span class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            实时更新
          </span>
        </div>

        <div class="grid grid-cols-1 gap-6" :class="accountGridClass">
          <div
            v-for="account in boundAccountList"
            :key="account.id || account.key"
            class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="mb-4 flex items-start justify-between">
              <div class="flex items-start gap-3">
                <div
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  :class="
                    account.platform === 'claude'
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  "
                >
                  <svg
                    class="h-4 w-4"
                    :class="
                      account.platform === 'claude'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-blue-600 dark:text-blue-400'
                    "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getAccountLabel(account) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ account.platform === 'claude' ? '会话窗口' : '额度窗口' }}
                  </p>
                </div>
              </div>
              <div v-if="getRateLimitDisplay(account.rateLimitStatus)" class="text-xs">
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 font-medium"
                  :class="getRateLimitDisplay(account.rateLimitStatus).class"
                >
                  {{ getRateLimitDisplay(account.rateLimitStatus).text }}
                </span>
              </div>
            </div>

            <!-- Claude 会话窗口 -->
            <div v-if="account.platform === 'claude'" class="space-y-3">
              <div>
                <div class="mb-1 flex items-center justify-between text-xs">
                  <span class="text-gray-600 dark:text-gray-400">使用进度</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{
                      Math.min(100, Math.max(0, Math.round(account.sessionWindow?.progress || 0)))
                    }}%
                  </span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getSessionProgressBarClass(account.sessionWindow?.status, account)"
                    :style="{
                      width: `${Math.min(100, Math.max(0, Math.round(account.sessionWindow?.progress || 0)))}%`
                    }"
                  ></div>
                </div>
              </div>
              <div
                class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
              >
                <span>
                  {{
                    formatSessionWindowRange(
                      account.sessionWindow?.windowStart,
                      account.sessionWindow?.windowEnd
                    )
                  }}
                </span>
                <span v-if="account.sessionWindow?.remainingTime > 0" class="font-medium">
                  剩余 {{ formatSessionRemaining(account.sessionWindow.remainingTime) }}
                </span>
              </div>
            </div>

            <!-- OpenAI Codex 额度窗口 -->
            <div v-else-if="account.platform === 'openai'" class="space-y-3">
              <div v-if="account.codexUsage">
                <div
                  v-for="type in ['primary', 'secondary']"
                  :key="`${account.key}-${type}`"
                  class="space-y-2"
                >
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium text-gray-700 dark:text-gray-300">
                      {{ getCodexWindowLabel(type) }}
                    </span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ formatCodexUsagePercent(account.codexUsage?.[type]) }}
                    </span>
                  </div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="getCodexUsageBarClass(account.codexUsage?.[type])"
                      :style="{ width: getCodexUsageWidth(account.codexUsage?.[type]) }"
                    ></div>
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    重置剩余 {{ formatCodexRemaining(account.codexUsage?.[type]) }}
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-gray-500 dark:text-gray-400">暂无额度使用数据</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { useApiStatsStore } from '@/stores/apistats'
import { Card } from '@/ui'

const apiStatsStore = useApiStatsStore()
const {
  statsData,
  statsPeriod,
  currentPeriodData,
  multiKeyMode,
  aggregatedStats,
  individualStats,
  invalidKeys
} = storeToRefs(apiStatsStore)

const topContributors = computed(() => {
  if (!individualStats.value || individualStats.value.length === 0) return []
  return [...individualStats.value]
    .sort((a, b) => (b.usage?.allTokens || 0) - (a.usage?.allTokens || 0))
    .slice(0, 3)
})

const calculateContribution = (stat) => {
  if (!aggregatedStats.value || !aggregatedStats.value.usage.allTokens) return 0
  const percentage = ((stat.usage?.allTokens || 0) / aggregatedStats.value.usage.allTokens) * 100
  return percentage.toFixed(1)
}

const formatDate = (dateString) => {
  if (!dateString) return '无'
  try {
    return dayjs(dateString).format('YYYY年MM月DD日 HH:mm')
  } catch (error) {
    return '格式错误'
  }
}

const formatExpireDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isApiKeyExpired = (expiresAt) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const isApiKeyExpiringSoon = (expiresAt) => {
  if (!expiresAt) return false
  const expireDate = new Date(expiresAt)
  const now = new Date()
  const daysUntilExpire = (expireDate - now) / (1000 * 60 * 60 * 24)
  return daysUntilExpire > 0 && daysUntilExpire <= 7
}

const formatNumber = (num) => {
  if (typeof num !== 'number') num = parseInt(num) || 0
  if (num === 0) return '0'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toLocaleString()
}

const formatPermissions = (permissions) => {
  const map = {
    claude: 'Claude',
    gemini: 'Gemini',
    openai: 'OpenAI',
    all: '全部模型'
  }
  return map[permissions] || permissions || '未知'
}

const boundAccountList = computed(() => {
  const accounts = statsData.value?.accounts?.details
  if (!accounts) return []
  const result = []
  if (accounts.claude && accounts.claude.accountType === 'dedicated') {
    result.push({ key: 'claude', ...accounts.claude })
  }
  if (accounts.openai && accounts.openai.accountType === 'dedicated') {
    result.push({ key: 'openai', ...accounts.openai })
  }
  return result
})

const accountGridClass = computed(() => {
  const count = boundAccountList.value.length
  if (count <= 1) {
    return 'md:grid-cols-1 lg:grid-cols-1'
  }
  if (count === 2) {
    return 'md:grid-cols-2'
  }
  return 'md:grid-cols-2 xl:grid-cols-3'
})

const getAccountLabel = (account) => {
  if (!account) return '专属账号'
  return account.platform === 'openai' ? 'OpenAI 专属账号' : 'Claude 专属账号'
}

const formatRateLimitTime = (minutes) => {
  if (!minutes || minutes <= 0) return ''
  const total = Math.floor(minutes)
  const days = Math.floor(total / 1440)
  const hours = Math.floor((total % 1440) / 60)
  const mins = total % 60
  if (days > 0) return hours > 0 ? `${days}天${hours}小时` : `${days}天`
  if (hours > 0) return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  return `${mins}分钟`
}

const getRateLimitDisplay = (status) => {
  if (!status) {
    return {
      text: '状态未知',
      class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }
  if (status.isRateLimited) {
    const remaining = formatRateLimitTime(status.minutesRemaining)
    const suffix = remaining ? ` · 剩余约 ${remaining}` : ''
    return {
      text: `限流中${suffix}`,
      class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }
  return {
    text: '未限流',
    class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }
}

const formatSessionWindowRange = (start, end) => {
  if (!start || !end) return '暂无时间窗口信息'
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d) => `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
  return `${fmt(s)} - ${fmt(e)}`
}

const formatSessionRemaining = (minutes) => {
  if (!minutes || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

const getSessionProgressBarClass = (status, account) => {
  if (!status) return 'bg-primary-500'
  if (account?.rateLimitStatus?.isRateLimited) return 'bg-yellow-500'
  const normalized = String(status).toLowerCase()
  if (normalized === 'rejected') return 'bg-red-500'
  if (normalized === 'allowed_warning') return 'bg-orange-500'
  return 'bg-primary-500'
}

const normalizeCodexUsagePercent = (usageItem) => {
  if (!usageItem) return null
  const percent =
    typeof usageItem.usedPercent === 'number' && !Number.isNaN(usageItem.usedPercent)
      ? usageItem.usedPercent
      : null
  const resetAfterSeconds =
    typeof usageItem.resetAfterSeconds === 'number' && !Number.isNaN(usageItem.resetAfterSeconds)
      ? usageItem.resetAfterSeconds
      : null
  const remainingSeconds =
    typeof usageItem.remainingSeconds === 'number' ? usageItem.remainingSeconds : null
  const resetAtMs = usageItem.resetAt ? Date.parse(usageItem.resetAt) : null
  const resetElapsed =
    resetAfterSeconds !== null &&
    ((remainingSeconds !== null && remainingSeconds <= 0) ||
      (resetAtMs !== null && !Number.isNaN(resetAtMs) && Date.now() >= resetAtMs))
  if (resetElapsed) return 0
  if (percent === null) return null
  return Math.max(0, Math.min(100, percent))
}

const getCodexUsageBarClass = (usageItem) => {
  const percent = normalizeCodexUsagePercent(usageItem)
  if (percent === null) return 'bg-gray-300 dark:bg-gray-600'
  if (percent >= 90) return 'bg-red-500'
  if (percent >= 75) return 'bg-orange-500'
  return 'bg-primary-500'
}

const getCodexUsageWidth = (usageItem) => {
  const percent = normalizeCodexUsagePercent(usageItem)
  if (percent === null) return '0%'
  return `${percent}%`
}

const formatCodexUsagePercent = (usageItem) => {
  const percent = normalizeCodexUsagePercent(usageItem)
  if (percent === null) return '--'
  return `${percent.toFixed(1)}%`
}

const formatCodexRemaining = (usageItem) => {
  if (!usageItem) return '--'
  let seconds = usageItem.remainingSeconds
  if (seconds === null || seconds === undefined) {
    seconds = usageItem.resetAfterSeconds
  }
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
    return '--'
  }
  seconds = Math.max(0, Math.floor(Number(seconds)))
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (days > 0) return hours > 0 ? `${days}天${hours}小时` : `${days}天`
  if (hours > 0) return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  if (minutes > 0) return `${minutes}分钟`
  return `${secs}秒`
}

const getCodexWindowLabel = (type) => (type === 'secondary' ? '周限' : '5h')
</script>
