<template>
  <div class="p-6">
    <!-- 标题区域 -->
    <div class="mb-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">账户管理</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            管理 Claude、Gemini、OpenAI 等账户与代理配置
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- 刷新按钮 -->
          <div>
            <el-tooltip
              content="刷新数据 (Ctrl/⌘+点击强制刷新所有缓存)"
              effect="dark"
              placement="bottom"
            >
              <button
                class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="accountsLoading"
                @click.ctrl.exact="loadAccounts(true)"
                @click.exact="loadAccounts(false)"
                @click.meta.exact="loadAccounts(true)"
              >
                <Icon
                  class="h-3.5 w-3.5"
                  :class="{ 'animate-spin': accountsLoading }"
                  name="RefreshCw"
                />
                <span>刷新</span>
              </button>
            </el-tooltip>
          </div>

          <!-- 选择/取消选择按钮 -->
          <button
            class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="toggleSelectionMode"
          >
            <Icon class="h-3.5 w-3.5" :name="showCheckboxes ? 'X' : 'CheckSquare'" />
            <span>{{ showCheckboxes ? '取消选择' : '选择' }}</span>
          </button>

          <!-- 批量删除按钮 -->
          <button
            v-if="selectedAccounts.length > 0"
            class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            @click="batchDeleteAccounts"
          >
            <Icon class="h-3.5 w-3.5" name="Trash" />
            <span>删除选中 ({{ selectedAccounts.length }})</span>
          </button>

          <!-- 添加账户按钮 -->
          <button
            class="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-600 px-3 text-xs font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            @click.stop="openCreateAccountModal"
          >
            <Icon class="h-3.5 w-3.5" name="Plus" />
            <span>添加账户</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选器区域 -->
    <div class="mb-6">
      <div class="flex flex-wrap items-center gap-2">
            <!-- 排序选择器 -->
            <div class="flex items-center gap-2">
              <Icon class="h-4 w-4 text-gray-500 dark:text-gray-400" name="ArrowUpDown" />
              <CustomDropdown
                v-model="accountSortBy"
                icon="ArrowUpDown"
                icon-color="text-gray-500"
                :options="sortOptions"
                placeholder="选择排序"
                size="small"
                @change="sortAccounts()"
              />
            </div>

            <!-- 平台筛选器 -->
            <div class="flex items-center gap-2">
              <Icon class="h-4 w-4 text-gray-500 dark:text-gray-400" name="Server" />
              <CustomDropdown
                v-model="platformFilter"
                icon="Server"
                icon-color="text-gray-500"
                :options="platformOptions"
                placeholder="选择平台"
                size="small"
                @change="filterByPlatform"
              />
            </div>

            <!-- 分组筛选器 -->
            <div class="flex items-center gap-2">
              <Icon class="h-4 w-4 text-gray-500 dark:text-gray-400" name="Layers" />
              <CustomDropdown
                v-model="groupFilter"
                icon="Layers"
                icon-color="text-gray-500"
                :options="groupOptions"
                placeholder="选择分组"
                size="small"
                @change="filterByGroup"
              />
            </div>

            <!-- 搜索框 -->
            <div class="relative flex items-center gap-2">
              <Icon class="h-4 w-4 text-gray-500 dark:text-gray-400" name="Search" />
              <div class="relative">
                <input
                  v-model="searchKeyword"
                  class="h-8 w-48 rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-xs text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="搜索账户名称..."
                  type="text"
                />
                <button
                  v-if="searchKeyword"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="clearSearch"
                >
                  <Icon class="h-3.5 w-3.5" name="X" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div>
      <div v-if="accountsLoading" class="flex flex-col items-center justify-center py-16">
          <Icon class="h-8 w-8 animate-spin text-primary-600 dark:text-primary-500" name="Loader" />
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">正在加载账户...</p>
        </div>

        <div
          v-else-if="sortedAccounts.length === 0"
          class="flex flex-col items-center justify-center py-16"
        >
          <Icon class="h-12 w-12 text-gray-400 dark:text-gray-600" name="Database" />
          <p class="mt-4 text-base font-medium text-gray-900 dark:text-white">暂无账户</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            点击上方按钮添加您的第一个账户
          </p>
        </div>

        <!-- 桌面端表格视图 -->
        <div
          v-else
          class="hidden overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 md:block"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th v-if="shouldShowCheckboxes" class="px-4 py-3 text-left">
                    <div class="flex items-center">
                      <input
                        v-model="selectAllChecked"
                        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                        :indeterminate="isIndeterminate"
                        type="checkbox"
                        @change="handleSelectAll"
                      />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortAccounts('name')"
                  >
                    <div class="flex items-center gap-1">
                      名称
                      <Icon
                        v-if="accountsSortBy === 'name'"
                        class="h-3 w-3"
                        :name="accountsSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortAccounts('platform')"
                  >
                    <div class="flex items-center gap-1">
                      平台/类型
                      <Icon
                        v-if="accountsSortBy === 'platform'"
                        class="h-3 w-3"
                        :name="accountsSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortAccounts('expiresAt')"
                  >
                    <div class="flex items-center gap-1">
                      到期时间
                      <Icon
                        v-if="accountsSortBy === 'expiresAt'"
                        class="h-3 w-3"
                        :name="accountsSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortAccounts('status')"
                  >
                    <div class="flex items-center gap-1">
                      状态
                      <Icon
                        v-if="accountsSortBy === 'status'"
                        class="h-3 w-3"
                        :name="accountsSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortAccounts('priority')"
                  >
                    <div class="flex items-center gap-1">
                      优先级
                      <Icon
                        v-if="accountsSortBy === 'priority'"
                        class="h-3 w-3"
                        :name="accountsSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    代理
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    今日使用
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    <div class="flex items-center gap-1">
                      <span>会话窗口</span>
                      <el-tooltip placement="top">
                        <template #content>
                          <div>
                            <div>
                              <div>Claude 系列</div>
                              <div>
                                会话窗口进度表示 5 小时窗口的时间推移，颜色提示当前调度状态。
                              </div>
                              <div>
                                <div>
                                  <div></div>
                                  <span>正常：请求正常处理</span>
                                </div>
                                <div>
                                  <div></div>
                                  <span>警告：接近限制</span>
                                </div>
                                <div>
                                  <div></div>
                                  <span>拒绝：达到速率限制</span>
                                </div>
                              </div>
                            </div>

                            <div></div>
                            <div>
                              <div>OpenAI</div>
                              <div>
                                进度条分别展示 5h 与周限窗口的额度使用比例，颜色含义与上方保持一致。
                              </div>
                              <div>
                                <div>
                                  <span>5h 窗口：5小时使用量进度，到达重置时间后会自动归零。</span>
                                </div>
                                <div>
                                  <span>周限窗口：7天使用量进度，重置时同样回到 0%。</span>
                                </div>
                                <div>
                                  <span>当“重置剩余”为 0 时，进度条与百分比会同步清零。</span>
                                </div>
                              </div>
                            </div>
                            <div></div>
                            <div>
                              <div>Claude OAuth 账户</div>
                              <div>展示三个窗口的使用率（utilization百分比），颜色含义同上。</div>
                              <div>
                                <div>
                                  <span>5h 窗口：5小时滑动窗口的使用率。</span>
                                </div>
                                <div>
                                  <span>7d 窗口：7天总限额的使用率。</span>
                                </div>
                                <div>
                                  <span>Opus 窗口：7天Opus模型专用限额。</span>
                                </div>
                                <div>
                                  <span>到达重置时间后自动归零。</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </template>
                      </el-tooltip>
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    最后使用
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody
                class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900"
              >
                <tr
                  v-for="account in paginatedAccounts"
                  :key="account.id"
                  class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td v-if="shouldShowCheckboxes" class="whitespace-nowrap px-4 py-3">
                    <div class="flex items-center">
                      <input
                        v-model="selectedAccounts"
                        class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                        type="checkbox"
                        :value="account.id"
                        @change="updateSelectAllState"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2">
                        <div
                          class="font-medium text-gray-900 dark:text-white"
                          :title="account.name"
                        >
                          {{ account.name }}
                        </div>
                        <span
                          v-if="account.accountType === 'dedicated'"
                          class="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        >
                          专属
                        </span>
                        <span
                          v-else-if="account.accountType === 'group'"
                          class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          分组调度
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          共享
                        </span>
                      </div>
                      <!-- 显示所有分组 - 换行显示 -->
                      <div
                        v-if="account.groupInfos && account.groupInfos.length > 0"
                        class="flex flex-wrap gap-1"
                      >
                        <span
                          v-for="group in account.groupInfos"
                          :key="group.id"
                          class="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                          :title="`所属分组: ${group.name}`"
                        >
                          {{ group.name }}
                        </span>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400" :title="account.id">
                        {{ account.id }}
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <div class="flex flex-col gap-1 text-sm">
                      <!-- 平台图标和名称 -->
                      <div
                        v-if="account.platform === 'gemini'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">Gemini</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ getGeminiAuthType() }}
                        </span>
                      </div>
                      <div
                        v-else-if="account.platform === 'claude-console'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">Console</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">API Key</span>
                      </div>
                      <div
                        v-else-if="account.platform === 'bedrock'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">Bedrock</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">AWS</span>
                      </div>
                      <div
                        v-else-if="account.platform === 'openai'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">OpenAi</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{
                          getOpenAIAuthType()
                        }}</span>
                      </div>
                      <div
                        v-else-if="account.platform === 'azure_openai'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">Azure OpenAI</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">API Key</span>
                      </div>
                      <div
                        v-else-if="account.platform === 'openai-responses'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">OpenAI-Responses</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">API Key</span>
                      </div>
                      <div
                        v-else-if="
                          account.platform === 'claude' || account.platform === 'claude-oauth'
                        "
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">{{ getClaudeAccountType(account) }}</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ getClaudeAuthType(account) }}
                        </span>
                      </div>
                      <div
                        v-else-if="account.platform === 'ccr'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">CCR</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">Relay</span>
                      </div>
                      <div
                        v-else-if="account.platform === 'droid'"
                        class="flex items-center gap-1.5 text-gray-900 dark:text-white"
                      >
                        <span class="font-medium">Droid</span>
                        <span class="text-gray-400 dark:text-gray-600">·</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                          {{ getDroidAuthType(account) }}
                        </span>
                        <span
                          v-if="isDroidApiKeyMode(account)"
                          class="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          x{{ getDroidApiKeyCount(account) }}
                        </span>
                      </div>
                      <div v-else class="text-gray-500 dark:text-gray-400">
                        <span>未知</span>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <div class="text-sm">
                      <!-- 已设置过期时间 -->
                      <span v-if="account.expiresAt">
                        <span
                          v-if="isExpired(account.expiresAt)"
                          class="cursor-pointer text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                          @click.stop="startEditAccountExpiry(account)"
                        >
                          已过期
                        </span>
                        <span
                          v-else-if="isExpiringSoon(account.expiresAt)"
                          class="cursor-pointer text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400"
                          @click.stop="startEditAccountExpiry(account)"
                        >
                          {{ formatExpireDate(account.expiresAt) }}
                        </span>
                        <span
                          v-else
                          class="cursor-pointer text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-500"
                          @click.stop="startEditAccountExpiry(account)"
                        >
                          {{ formatExpireDate(account.expiresAt) }}
                        </span>
                      </span>
                      <!-- 永不过期 -->
                      <span
                        v-else
                        class="cursor-pointer text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500"
                        @click.stop="startEditAccountExpiry(account)"
                      >
                        永不过期
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-col gap-1.5 text-sm">
                      <span
                        class="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        :class="{
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400':
                            account.status === 'blocked' || account.status === 'unauthorized',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400':
                            account.status === 'temp_error',
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
                            account.isActive &&
                            account.status !== 'blocked' &&
                            account.status !== 'unauthorized' &&
                            account.status !== 'temp_error'
                        }"
                      >
                        <div
                          class="h-1.5 w-1.5 rounded-full"
                          :class="{
                            'bg-red-600 dark:bg-red-500':
                              account.status === 'blocked' || account.status === 'unauthorized',
                            'bg-yellow-600 dark:bg-yellow-500': account.status === 'temp_error',
                            'bg-green-600 dark:bg-green-500':
                              account.isActive &&
                              account.status !== 'blocked' &&
                              account.status !== 'unauthorized' &&
                              account.status !== 'temp_error'
                          }"
                        />
                        {{
                          account.status === 'blocked'
                            ? '已封锁'
                            : account.status === 'unauthorized'
                              ? '异常'
                              : account.status === 'temp_error'
                                ? '临时异常'
                                : account.isActive
                                  ? '正常'
                                  : '异常'
                        }}
                      </span>
                      <span
                        v-if="
                          (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
                          account.rateLimitStatus === 'limited'
                        "
                        class="inline-flex w-fit items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                      >
                        限流中
                        <span
                          v-if="
                            account.rateLimitStatus &&
                            typeof account.rateLimitStatus === 'object' &&
                            account.rateLimitStatus.minutesRemaining > 0
                          "
                          class="ml-1"
                        >
                          ({{ formatRateLimitTime(account.rateLimitStatus.minutesRemaining) }})
                        </span>
                      </span>
                      <span
                        v-if="account.schedulable === false"
                        class="inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        不可调度
                        <el-tooltip
                          v-if="getSchedulableReason(account)"
                          :content="getSchedulableReason(account)"
                          effect="dark"
                          placement="top"
                        >
                          <Icon class="h-3 w-3" name="Info" />
                        </el-tooltip>
                      </span>
                      <span
                        v-if="account.status === 'blocked' && account.errorMessage"
                        class="text-xs text-red-600 dark:text-red-500"
                        :title="account.errorMessage"
                      >
                        {{ account.errorMessage }}
                      </span>
                      <span
                        v-if="account.accountType === 'dedicated'"
                        class="text-xs text-gray-500 dark:text-gray-400"
                      >
                        绑定: {{ account.boundApiKeysCount || 0 }} 个API Key
                      </span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <div
                      v-if="
                        account.platform === 'claude' ||
                        account.platform === 'claude-console' ||
                        account.platform === 'bedrock' ||
                        account.platform === 'gemini' ||
                        account.platform === 'openai' ||
                        account.platform === 'openai-responses' ||
                        account.platform === 'azure_openai' ||
                        account.platform === 'ccr' ||
                        account.platform === 'droid'
                      "
                      class="flex items-center gap-2 text-sm"
                    >
                      <div
                        class="h-2 w-2 rounded-full"
                        :class="{
                          'bg-green-500': account.priority >= 70,
                          'bg-blue-500': account.priority >= 50 && account.priority < 70,
                          'bg-yellow-500': account.priority >= 30 && account.priority < 50,
                          'bg-gray-500': account.priority < 30
                        }"
                      />
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ account.priority || 50 }}
                      </span>
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                      <span>N/A</span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <div
                      v-if="formatProxyDisplay(account.proxy)"
                      class="text-sm text-gray-900 dark:text-white"
                      :title="formatProxyDisplay(account.proxy)"
                    >
                      {{ formatProxyDisplay(account.proxy) }}
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400">无代理</div>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="account.usage && account.usage.daily" class="flex flex-col gap-1">
                      <div class="flex items-center gap-1.5 text-sm">
                        <Icon class="h-3.5 w-3.5 text-blue-500" name="Activity" />
                        <span class="text-gray-900 dark:text-white"
                          >{{ account.usage.daily.requests || 0 }} 次</span
                        >
                      </div>
                      <div class="flex items-center gap-1.5 text-sm">
                        <Icon class="h-3.5 w-3.5 text-purple-500" name="Cpu" />
                        <span class="text-gray-900 dark:text-white"
                          >{{ formatNumber(account.usage.daily.allTokens || 0) }}M</span
                        >
                      </div>
                      <div class="flex items-center gap-1.5 text-sm">
                        <Icon class="h-3.5 w-3.5 text-green-500" name="DollarSign" />
                        <span class="text-gray-900 dark:text-white"
                          >${{ calculateDailyCost(account) }}</span
                        >
                      </div>
                      <div
                        v-if="account.usage.averages && account.usage.averages.rpm > 0"
                        class="text-xs text-gray-500 dark:text-gray-400"
                      >
                        平均 {{ account.usage.averages.rpm.toFixed(2) }} RPM
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500 dark:text-gray-400">暂无数据</div>
                  </td>
                  <td class="px-4 py-3">
                    <div v-if="account.platform === 'claude'">
                      <!-- OAuth 账户：显示三窗口 OAuth usage -->
                      <div v-if="isClaudeOAuth(account) && account.claudeUsage">
                        <!-- 5小时窗口 -->
                        <div>
                          <div>
                            <span> 5h </span>
                            <div>
                              <div>
                                <div>
                                  <div />
                                </div>
                                <span>
                                  {{ formatClaudeUsagePercent(account.claudeUsage.fiveHour) }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            重置剩余 {{ formatClaudeRemaining(account.claudeUsage.fiveHour) }}
                          </div>
                        </div>
                        <!-- 7天窗口 -->
                        <div>
                          <div>
                            <span> 7d </span>
                            <div>
                              <div>
                                <div>
                                  <div />
                                </div>
                                <span>
                                  {{ formatClaudeUsagePercent(account.claudeUsage.sevenDay) }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            重置剩余 {{ formatClaudeRemaining(account.claudeUsage.sevenDay) }}
                          </div>
                        </div>
                        <!-- 7天Opus窗口 -->
                        <div>
                          <div>
                            <span> Opus </span>
                            <div>
                              <div>
                                <div>
                                  <div />
                                </div>
                                <span>
                                  {{ formatClaudeUsagePercent(account.claudeUsage.sevenDayOpus) }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            重置剩余 {{ formatClaudeRemaining(account.claudeUsage.sevenDayOpus) }}
                          </div>
                        </div>
                      </div>
                      <!-- Setup Token 账户：显示原有的会话窗口时间进度 -->
                      <div
                        v-else-if="
                          !isClaudeOAuth(account) &&
                          account.sessionWindow &&
                          account.sessionWindow.hasActiveWindow
                        "
                      >
                        <!-- 使用统计在顶部 -->
                        <div v-if="account.usage && account.usage.sessionWindow">
                          <div>
                            <div />
                            <span>
                              {{ formatNumber(account.usage.sessionWindow.totalTokens) }}M
                            </span>
                          </div>
                          <div>
                            <div />
                            <span> ${{ formatCost(account.usage.sessionWindow.totalCost) }} </span>
                          </div>
                        </div>

                        <!-- 进度条 -->
                        <div>
                          <div>
                            <div />
                          </div>
                          <span> {{ account.sessionWindow.progress }}% </span>
                        </div>

                        <!-- 时间信息 -->
                        <div>
                          <div>
                            {{
                              formatSessionWindow(
                                account.sessionWindow.windowStart,
                                account.sessionWindow.windowEnd
                              )
                            }}
                          </div>
                          <div v-if="account.sessionWindow.remainingTime > 0">
                            剩余 {{ formatRemainingTime(account.sessionWindow.remainingTime) }}
                          </div>
                        </div>
                      </div>
                      <div v-else>暂无统计</div>
                    </div>
                    <!-- Claude Console: 显示每日额度和并发状态 -->
                    <div v-else-if="account.platform === 'claude-console'">
                      <div>
                        <template v-if="Number(account.dailyQuota) > 0">
                          <div>
                            <span>额度进度</span>
                            <span> {{ getQuotaUsagePercent(account).toFixed(1) }}% </span>
                          </div>
                          <div>
                            <div>
                              <div />
                            </div>
                            <span>
                              ${{ formatCost(account.usage?.daily?.cost || 0) }} / ${{
                                Number(account.dailyQuota).toFixed(2)
                              }}
                            </span>
                          </div>
                          <div>
                            剩余 ${{ formatRemainingQuota(account) }}
                            <span>重置 {{ account.quotaResetTime || '00:00' }}</span>
                          </div>
                        </template>
                        <template v-else>
                          <div></div>
                        </template>
                      </div>

                      <div>
                        <div>
                          <span>并发状态</span>
                          <span v-if="Number(account.maxConcurrentTasks || 0) > 0">
                            {{ getConsoleConcurrencyPercent(account).toFixed(0) }}%
                          </span>
                        </div>
                        <div v-if="Number(account.maxConcurrentTasks || 0) > 0">
                          <div>
                            <div />
                          </div>
                          <span>
                            {{ Number(account.activeTaskCount || 0) }} /
                            {{ Number(account.maxConcurrentTasks || 0) }}
                          </span>
                        </div>
                        <div v-else>并发无限制</div>
                      </div>
                    </div>
                    <div v-else-if="account.platform === 'openai'">
                      <div v-if="account.codexUsage">
                        <div>
                          <div>
                            <span>
                              {{ getCodexWindowLabel('primary') }}
                            </span>
                            <div>
                              <div>
                                <div>
                                  <div />
                                </div>
                                <span>
                                  {{ formatCodexUsagePercent(account.codexUsage.primary) }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>重置剩余 {{ formatCodexRemaining(account.codexUsage.primary) }}</div>
                        </div>
                        <div>
                          <div>
                            <span>
                              {{ getCodexWindowLabel('secondary') }}
                            </span>
                            <div>
                              <div>
                                <div>
                                  <div />
                                </div>
                                <span>
                                  {{ formatCodexUsagePercent(account.codexUsage.secondary) }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            重置剩余 {{ formatCodexRemaining(account.codexUsage.secondary) }}
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <span>N/A</span>
                      </div>
                    </div>
                    <div v-else>
                      <span>N/A</span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {{ formatLastUsed(account.lastUsedAt) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button
                        v-if="
                          (account.platform === 'claude' ||
                            account.platform === 'claude-console' ||
                            account.platform === 'openai' ||
                            account.platform === 'openai-responses') &&
                          (account.status === 'unauthorized' ||
                            account.status !== 'active' ||
                            account.rateLimitStatus?.isRateLimited ||
                            account.rateLimitStatus === 'limited' ||
                            !account.isActive)
                        "
                        class="inline-flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-2.5 py-1.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                        :disabled="account.isResetting"
                        :title="account.isResetting ? '重置中...' : '重置所有异常状态'"
                        @click="resetAccountStatus(account)"
                      >
                        <Icon class="h-3.5 w-3.5" name="RotateCcw" />
                        <span>重置状态</span>
                      </button>
                      <button
                        class="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        :disabled="account.isTogglingSchedulable"
                        :title="account.schedulable ? '点击禁用调度' : '点击启用调度'"
                        @click="toggleSchedulable(account)"
                      >
                        <Icon class="h-3.5 w-3.5" :name="account.schedulable ? 'Pause' : 'Play'" />
                        <span>{{ account.schedulable ? '调度' : '停用' }}</span>
                      </button>
                      <button
                        v-if="canViewUsage(account)"
                        class="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        :title="'查看使用详情'"
                        @click="openAccountUsageModal(account)"
                      >
                        <Icon class="h-3.5 w-3.5" name="BarChart" />
                        <span>详情</span>
                      </button>
                      <button
                        class="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        :title="'编辑账户'"
                        @click="editAccount(account)"
                      >
                        <Icon class="h-3.5 w-3.5" name="Edit" />
                        <span>编辑</span>
                      </button>
                      <button
                        class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        :title="'删除账户'"
                        @click="deleteAccount(account)"
                      >
                        <Icon class="h-3.5 w-3.5" name="Trash" />
                        <span>删除</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 移动端卡片视图 -->
        <div v-if="!accountsLoading && sortedAccounts.length > 0" class="space-y-4 md:hidden">
          <div
            v-for="account in paginatedAccounts"
            :key="account.id"
            class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <!-- 卡片头部 -->
            <div
              class="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <input
                  v-if="shouldShowCheckboxes"
                  v-model="selectedAccounts"
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  type="checkbox"
                  :value="account.id"
                  @change="updateSelectAllState"
                />
                <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30"></div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ account.name || account.email }}
                  </h4>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span>{{ account.platform }}</span>
                    <span class="mx-1">|</span>
                    <span>{{ account.type }}</span>
                  </div>
                </div>
              </div>
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
                    account.isActive,
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': !account.isActive
                }"
              >
                <div
                  class="h-1.5 w-1.5 rounded-full"
                  :class="{
                    'bg-green-600': account.isActive,
                    'bg-red-600': !account.isActive
                  }"
                />
                {{ getAccountStatusText(account) }}
              </span>
            </div>

            <!-- 使用统计 -->
            <div class="grid grid-cols-2 gap-4 border-b border-gray-200 p-4 dark:border-gray-700">
              <div>
                <p class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">今日使用</p>
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <Icon class="h-3 w-3 text-blue-500" name="Activity" />
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ account.usage?.daily?.requests || 0 }} 次
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Icon class="h-3 w-3 text-purple-500" name="Cpu" />
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ formatNumber(account.usage?.daily?.allTokens || 0) }}M
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Icon class="h-3 w-3 text-green-500" name="DollarSign" />
                    <p class="text-sm text-gray-900 dark:text-white">
                      ${{ calculateDailyCost(account) }}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">会话窗口</p>
                <div v-if="account.usage && account.usage.sessionWindow" class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <Icon class="h-3 w-3 text-purple-500" name="Cpu" />
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ formatNumber(account.usage.sessionWindow.totalTokens) }}M
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Icon class="h-3 w-3 text-green-500" name="DollarSign" />
                    <p class="text-sm text-gray-900 dark:text-white">
                      ${{ formatCost(account.usage.sessionWindow.totalCost) }}
                    </p>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">-</div>
              </div>
            </div>

            <!-- 状态信息 -->
            <div class="p-4">
              <!-- 会话窗口 -->
              <div v-if="account.platform === 'claude'">
                <!-- OAuth 账户：显示三窗口 OAuth usage -->
                <div v-if="isClaudeOAuth(account) && account.claudeUsage">
                  <!-- 5小时窗口 -->
                  <div>
                    <div>
                      <span> 5h </span>
                      <div>
                        <div>
                          <div>
                            <div />
                          </div>
                          <span>
                            {{ formatClaudeUsagePercent(account.claudeUsage.fiveHour) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>重置剩余 {{ formatClaudeRemaining(account.claudeUsage.fiveHour) }}</div>
                  </div>
                  <!-- 7天窗口 -->
                  <div>
                    <div>
                      <span> 7d </span>
                      <div>
                        <div>
                          <div>
                            <div />
                          </div>
                          <span>
                            {{ formatClaudeUsagePercent(account.claudeUsage.sevenDay) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>重置剩余 {{ formatClaudeRemaining(account.claudeUsage.sevenDay) }}</div>
                  </div>
                  <!-- 7天Opus窗口 -->
                  <div>
                    <div>
                      <span> Opus </span>
                      <div>
                        <div>
                          <div>
                            <div />
                          </div>
                          <span>
                            {{ formatClaudeUsagePercent(account.claudeUsage.sevenDayOpus) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      重置剩余 {{ formatClaudeRemaining(account.claudeUsage.sevenDayOpus) }}
                    </div>
                  </div>
                </div>
                <!-- Setup Token 账户：显示原有的会话窗口时间进度 -->
                <div
                  v-else-if="
                    !isClaudeOAuth(account) &&
                    account.sessionWindow &&
                    account.sessionWindow.hasActiveWindow
                  "
                >
                  <div>
                    <div>
                      <span>会话窗口</span>
                      <el-tooltip
                        content="会话窗口进度不代表使用量，仅表示距离下一个5小时窗口的剩余时间"
                        placement="top"
                      >
                      </el-tooltip>
                    </div>
                    <span> {{ account.sessionWindow.progress }}% </span>
                  </div>
                  <div>
                    <div />
                  </div>
                  <div>
                    <span>
                      {{
                        formatSessionWindow(
                          account.sessionWindow.windowStart,
                          account.sessionWindow.windowEnd
                        )
                      }}
                    </span>
                    <span v-if="account.sessionWindow.remainingTime > 0">
                      剩余 {{ formatRemainingTime(account.sessionWindow.remainingTime) }}
                    </span>
                    <span v-else> 已结束 </span>
                  </div>
                </div>
                <div v-else>暂无统计</div>
              </div>
              <div v-else-if="account.platform === 'openai'">
                <div v-if="account.codexUsage">
                  <div>
                    <div>
                      <span>
                        {{ getCodexWindowLabel('primary') }}
                      </span>
                      <div>
                        <div>
                          <div>
                            <div />
                          </div>
                          <span>
                            {{ formatCodexUsagePercent(account.codexUsage.primary) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>重置剩余 {{ formatCodexRemaining(account.codexUsage.primary) }}</div>
                  </div>
                  <div>
                    <div>
                      <span>
                        {{ getCodexWindowLabel('secondary') }}
                      </span>
                      <div>
                        <div>
                          <div>
                            <div />
                          </div>
                          <span>
                            {{ formatCodexUsagePercent(account.codexUsage.secondary) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>重置剩余 {{ formatCodexRemaining(account.codexUsage.secondary) }}</div>
                  </div>
                </div>
                <div v-if="!account.codexUsage">暂无统计</div>
              </div>

              <!-- 最后使用时间 -->
              <div class="flex items-center justify-between py-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">最后使用</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ account.lastUsedAt ? formatRelativeTime(account.lastUsedAt) : '从未使用' }}
                </span>
              </div>

              <!-- 代理配置 -->
              <div
                v-if="account.proxyConfig && account.proxyConfig.type !== 'none'"
                class="flex items-center justify-between py-2"
              >
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">代理</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ account.proxyConfig.type.toUpperCase() }}
                </span>
              </div>

              <!-- 调度优先级 -->
              <div class="flex items-center justify-between py-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">优先级</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ account.priority || 50 }}
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div
              class="flex gap-2 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <button
                class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                :disabled="account.isTogglingSchedulable"
                @click="toggleSchedulable(account)"
              >
                <Icon class="mx-auto h-4 w-4" :name="account.schedulable ? 'Pause' : 'Play'" />
                {{ account.schedulable ? '暂停' : '启用' }}
              </button>

              <button
                v-if="canViewUsage(account)"
                class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                @click="openAccountUsageModal(account)"
              >
                详情
              </button>

              <button
                class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                @click="editAccount(account)"
              >
                编辑
              </button>

              <button
                class="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                @click="deleteAccount(account)"
              >
                <Icon class="mx-auto h-4 w-4" name="Trash" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="!accountsLoading && sortedAccounts.length > 0"
        class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
          <span> 共 {{ sortedAccounts.length }} 条记录 </span>
          <div class="flex items-center gap-2">
            <span>每页显示</span>
            <select
              v-model="pageSize"
              class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              @change="currentPage = 1"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
            <span>条</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <Icon class="h-4 w-4" name="ChevronLeft" />
          </button>

          <div class="flex items-center gap-1">
            <button
              v-if="shouldShowFirstPage"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="currentPage = 1"
            >
              1
            </button>

            <span v-if="showLeadingEllipsis" class="px-2 text-gray-500 dark:text-gray-400">
              ...
            </span>

            <button
              v-for="page in pageNumbers"
              :key="page"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
              :class="
                currentPage === page
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              "
              @click="currentPage = page"
            >
              {{ page }}
            </button>

            <span v-if="showTrailingEllipsis" class="px-2 text-gray-500 dark:text-gray-400">
              ...
            </span>

            <button
              v-if="shouldShowLastPage"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="currentPage = totalPages"
            >
              {{ totalPages }}
            </button>
          </div>

          <button
            class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage++"
          >
            <Icon class="h-4 w-4" name="ChevronRight" />
          </button>
        </div>
      </div>
    </div>
    </div>

    <!-- 添加账户模态框 -->
    <AccountForm
      v-if="showCreateAccountModal && (!newAccountPlatform || newAccountPlatform !== 'ccr')"
      @close="closeCreateAccountModal"
      @platform-changed="newAccountPlatform = $event"
      @success="handleCreateSuccess"
    />
    <CcrAccountForm
      v-else-if="showCreateAccountModal && newAccountPlatform === 'ccr'"
      @close="closeCreateAccountModal"
      @success="handleCreateSuccess"
    />

    <!-- 编辑账户模态框 -->
    <CcrAccountForm
      v-if="showEditAccountModal && editingAccount && editingAccount.platform === 'ccr'"
      :account="editingAccount"
      @close="showEditAccountModal = false"
      @success="handleEditSuccess"
    />
    <AccountForm
      v-else-if="showEditAccountModal"
      :account="editingAccount"
      @close="showEditAccountModal = false"
      @success="handleEditSuccess"
    />

    <!-- 确认弹窗 -->
    <ConfirmModal
      :cancel-text="confirmOptions.cancelText"
      :confirm-text="confirmOptions.confirmText"
      :message="confirmOptions.message"
      :show="showConfirmModal"
      :title="confirmOptions.title"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    />

    <AccountUsageDetailModal
      v-if="showAccountUsageModal"
      :account="selectedAccountForUsage || {}"
      :generated-at="accountUsageGeneratedAt"
      :history="accountUsageHistory"
      :loading="accountUsageLoading"
      :overview="accountUsageOverview"
      :show="showAccountUsageModal"
      :summary="accountUsageSummary"
      @close="closeAccountUsageModal"
    />

    <!-- 账户过期时间编辑弹窗 -->
    <AccountExpiryEditModal
      ref="expiryEditModalRef"
      :account="editingExpiryAccount || { id: null, expiresAt: null, name: '' }"
      :show="!!editingExpiryAccount"
      @close="closeAccountExpiryEdit"
      @save="handleSaveAccountExpiry"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'
import { useConfirm } from '@/composables/useConfirm'
import AccountForm from '@/components/accounts/AccountForm.vue'
import CcrAccountForm from '@/components/accounts/CcrAccountForm.vue'
import AccountUsageDetailModal from '@/components/accounts/AccountUsageDetailModal.vue'
import AccountExpiryEditModal from '@/components/accounts/AccountExpiryEditModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import CustomDropdown from '@/components/common/CustomDropdown.vue'

// 使用确认弹窗
const { showConfirmModal, confirmOptions, showConfirm, handleConfirm, handleCancel } = useConfirm()

// 数据状态
const accounts = ref([])
const accountsLoading = ref(false)
const accountSortBy = ref('name')
const accountsSortBy = ref('')
const accountsSortOrder = ref('asc')
const apiKeys = ref([])
const accountGroups = ref([])
const groupFilter = ref('all')
const platformFilter = ref('all')
const searchKeyword = ref('')
const PAGE_SIZE_STORAGE_KEY = 'accountsPageSize'
const getInitialPageSize = () => {
  const saved = localStorage.getItem(PAGE_SIZE_STORAGE_KEY)
  if (saved) {
    const parsedSize = parseInt(saved, 10)
    if ([10, 20, 50, 100].includes(parsedSize)) {
      return parsedSize
    }
  }
  return 10
}
const pageSizeOptions = [10, 20, 50, 100]
const pageSize = ref(getInitialPageSize())
const currentPage = ref(1)

// 多选状态
const selectedAccounts = ref([])
const selectAllChecked = ref(false)
const isIndeterminate = ref(false)
const showCheckboxes = ref(false)

// 账号使用详情弹窗状态
const showAccountUsageModal = ref(false)
const accountUsageLoading = ref(false)
const selectedAccountForUsage = ref(null)
const accountUsageHistory = ref([])
const accountUsageSummary = ref({})
const accountUsageOverview = ref({})
const accountUsageGeneratedAt = ref('')

const supportedUsagePlatforms = [
  'claude',
  'claude-console',
  'openai',
  'openai-responses',
  'gemini',
  'droid'
]

// 过期时间编辑弹窗状态
const editingExpiryAccount = ref(null)
const expiryEditModalRef = ref(null)

// 缓存状态标志
const apiKeysLoaded = ref(false)
const groupsLoaded = ref(false)
const groupMembersLoaded = ref(false)
const accountGroupMap = ref(new Map()) // Map<accountId, Array<groupInfo>>

// 下拉选项数据
const sortOptions = ref([
  { value: 'name', label: '按名称排序', icon: 'fa-font' },
  { value: 'dailyTokens', label: '按今日Token排序', icon: 'fa-coins' },
  { value: 'dailyRequests', label: '按今日请求数排序', icon: 'fa-chart-line' },
  { value: 'totalTokens', label: '按总Token排序', icon: 'fa-database' },
  { value: 'lastUsed', label: '按最后使用排序', icon: 'fa-clock' }
])

const platformOptions = ref([
  { value: 'all', label: '所有平台', icon: 'fa-globe' },
  { value: 'claude', label: 'Claude', icon: 'fa-brain' },
  { value: 'claude-console', label: 'Claude Console', icon: 'fa-terminal' },
  { value: 'gemini', label: 'Gemini', icon: 'fab fa-google' },
  { value: 'openai', label: 'OpenAi', icon: 'fa-openai' },
  { value: 'azure_openai', label: 'Azure OpenAI', icon: 'fab fa-microsoft' },
  { value: 'bedrock', label: 'Bedrock', icon: 'fab fa-aws' },
  { value: 'openai-responses', label: 'OpenAI-Responses', icon: 'fa-server' },
  { value: 'ccr', label: 'CCR', icon: 'fa-code-branch' },
  { value: 'droid', label: 'Droid', icon: 'fa-robot' }
])

const groupOptions = computed(() => {
  const options = [
    { value: 'all', label: '所有账户', icon: 'fa-globe' },
    { value: 'ungrouped', label: '未分组账户', icon: 'fa-user' }
  ]
  accountGroups.value.forEach((group) => {
    options.push({
      value: group.id,
      label: `${group.name} (${group.platform === 'claude' ? 'Claude' : group.platform === 'gemini' ? 'Gemini' : group.platform === 'openai' ? 'OpenAI' : 'Droid'})`,
      icon:
        group.platform === 'claude'
          ? 'fa-brain'
          : group.platform === 'gemini'
            ? 'fa-robot'
            : group.platform === 'openai'
              ? 'fa-openai'
              : 'fa-robot'
    })
  })
  return options
})

const shouldShowCheckboxes = computed(() => showCheckboxes.value)

// 模态框状态
const showCreateAccountModal = ref(false)
const newAccountPlatform = ref(null) // 跟踪新建账户选择的平台
const showEditAccountModal = ref(false)
const editingAccount = ref(null)

const collectAccountSearchableStrings = (account) => {
  const values = new Set()

  const baseFields = [
    account?.name,
    account?.email,
    account?.accountName,
    account?.owner,
    account?.ownerName,
    account?.ownerDisplayName,
    account?.displayName,
    account?.username,
    account?.identifier,
    account?.alias,
    account?.title,
    account?.label
  ]

  baseFields.forEach((field) => {
    if (typeof field === 'string') {
      const trimmed = field.trim()
      if (trimmed) {
        values.add(trimmed)
      }
    }
  })

  if (Array.isArray(account?.groupInfos)) {
    account.groupInfos.forEach((group) => {
      if (group && typeof group.name === 'string') {
        const trimmed = group.name.trim()
        if (trimmed) {
          values.add(trimmed)
        }
      }
    })
  }

  Object.entries(account || {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const lowerKey = key.toLowerCase()
      if (lowerKey.includes('name') || lowerKey.includes('email')) {
        const trimmed = value.trim()
        if (trimmed) {
          values.add(trimmed)
        }
      }
    }
  })

  return Array.from(values)
}

const accountMatchesKeyword = (account, normalizedKeyword) => {
  if (!normalizedKeyword) return true
  return collectAccountSearchableStrings(account).some((value) =>
    value.toLowerCase().includes(normalizedKeyword)
  )
}

const canViewUsage = (account) => !!account && supportedUsagePlatforms.includes(account.platform)

const openAccountUsageModal = async (account) => {
  if (!canViewUsage(account)) {
    showToast('该账户类型暂不支持查看详情', 'warning')
    return
  }

  selectedAccountForUsage.value = account
  showAccountUsageModal.value = true
  accountUsageLoading.value = true
  accountUsageHistory.value = []
  accountUsageSummary.value = {}
  accountUsageOverview.value = {}
  accountUsageGeneratedAt.value = ''

  try {
    const response = await apiClient.get(
      `/admin/accounts/${account.id}/usage-history?platform=${account.platform}&days=30`
    )

    if (response.success) {
      const data = response.data || {}
      accountUsageHistory.value = data.history || []
      accountUsageSummary.value = data.summary || {}
      accountUsageOverview.value = data.overview || {}
      accountUsageGeneratedAt.value = data.generatedAt || ''
    } else {
      showToast(response.error || '加载账号使用详情失败', 'error')
    }
  } catch (error) {
    showToast('加载账号使用详情失败', 'error')
  } finally {
    accountUsageLoading.value = false
  }
}

const closeAccountUsageModal = () => {
  showAccountUsageModal.value = false
  accountUsageLoading.value = false
  selectedAccountForUsage.value = null
}

// 计算排序后的账户列表
const sortedAccounts = computed(() => {
  let sourceAccounts = accounts.value

  const keyword = searchKeyword.value.trim()
  if (keyword) {
    const normalizedKeyword = keyword.toLowerCase()
    sourceAccounts = sourceAccounts.filter((account) =>
      accountMatchesKeyword(account, normalizedKeyword)
    )
  }

  if (!accountsSortBy.value) return sourceAccounts

  const sorted = [...sourceAccounts].sort((a, b) => {
    let aVal = a[accountsSortBy.value]
    let bVal = b[accountsSortBy.value]

    // 处理统计数据
    if (accountsSortBy.value === 'dailyTokens') {
      aVal = a.usage?.daily?.allTokens || 0
      bVal = b.usage?.daily?.allTokens || 0
    } else if (accountsSortBy.value === 'dailyRequests') {
      aVal = a.usage?.daily?.requests || 0
      bVal = b.usage?.daily?.requests || 0
    } else if (accountsSortBy.value === 'totalTokens') {
      aVal = a.usage?.total?.allTokens || 0
      bVal = b.usage?.total?.allTokens || 0
    }

    // 处理最后使用时间
    if (accountsSortBy.value === 'lastUsed') {
      aVal = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0
      bVal = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0
    }

    // 处理状态
    if (accountsSortBy.value === 'status') {
      aVal = a.isActive ? 1 : 0
      bVal = b.isActive ? 1 : 0
    }

    if (aVal < bVal) return accountsSortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return accountsSortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return sorted
})

const totalPages = computed(() => {
  const total = sortedAccounts.value.length
  return Math.ceil(total / pageSize.value) || 0
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    let start = Math.max(1, current - 2)
    let end = Math.min(total, current + 2)

    if (current <= 3) {
      end = 5
    } else if (current >= total - 2) {
      start = total - 4
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

const shouldShowFirstPage = computed(() => {
  const pages = pageNumbers.value
  if (pages.length === 0) return false
  return pages[0] > 1
})

const shouldShowLastPage = computed(() => {
  const pages = pageNumbers.value
  if (pages.length === 0) return false
  return pages[pages.length - 1] < totalPages.value
})

const showLeadingEllipsis = computed(() => {
  const pages = pageNumbers.value
  if (pages.length === 0) return false
  return shouldShowFirstPage.value && pages[0] > 2
})

const showTrailingEllipsis = computed(() => {
  const pages = pageNumbers.value
  if (pages.length === 0) return false
  return shouldShowLastPage.value && pages[pages.length - 1] < totalPages.value - 1
})

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedAccounts.value.slice(start, end)
})

const updateSelectAllState = () => {
  const currentIds = paginatedAccounts.value.map((account) => account.id)
  const selectedInCurrentPage = currentIds.filter((id) =>
    selectedAccounts.value.includes(id)
  ).length
  const totalInCurrentPage = currentIds.length

  if (selectedInCurrentPage === 0) {
    selectAllChecked.value = false
    isIndeterminate.value = false
  } else if (selectedInCurrentPage === totalInCurrentPage) {
    selectAllChecked.value = true
    isIndeterminate.value = false
  } else {
    selectAllChecked.value = false
    isIndeterminate.value = true
  }
}

const handleSelectAll = () => {
  if (selectAllChecked.value) {
    paginatedAccounts.value.forEach((account) => {
      if (!selectedAccounts.value.includes(account.id)) {
        selectedAccounts.value.push(account.id)
      }
    })
  } else {
    const currentIds = new Set(paginatedAccounts.value.map((account) => account.id))
    selectedAccounts.value = selectedAccounts.value.filter((id) => !currentIds.has(id))
  }
  updateSelectAllState()
}

const toggleSelectionMode = () => {
  showCheckboxes.value = !showCheckboxes.value
  if (!showCheckboxes.value) {
    selectedAccounts.value = []
    selectAllChecked.value = false
    isIndeterminate.value = false
  } else {
    updateSelectAllState()
  }
}

const cleanupSelectedAccounts = () => {
  const validIds = new Set(accounts.value.map((account) => account.id))
  selectedAccounts.value = selectedAccounts.value.filter((id) => validIds.has(id))
  updateSelectAllState()
}

// 加载账户列表
const loadAccounts = async (forceReload = false) => {
  accountsLoading.value = true
  try {
    // 构建查询参数（用于其他筛选情况）
    const params = {}
    if (platformFilter.value !== 'all') {
      params.platform = platformFilter.value
    }
    if (groupFilter.value !== 'all') {
      params.groupId = groupFilter.value
    }

    // 根据平台筛选决定需要请求哪些接口
    const requests = []

    if (platformFilter.value === 'all') {
      // 请求所有平台
      requests.push(
        apiClient.get('/admin/claude-accounts', { params }),
        apiClient.get('/admin/claude-console-accounts', { params }),
        apiClient.get('/admin/bedrock-accounts', { params }),
        apiClient.get('/admin/gemini-accounts', { params }),
        apiClient.get('/admin/openai-accounts', { params }),
        apiClient.get('/admin/azure-openai-accounts', { params }),
        apiClient.get('/admin/openai-responses-accounts', { params }),
        apiClient.get('/admin/ccr-accounts', { params }),
        apiClient.get('/admin/droid-accounts', { params })
      )
    } else {
      // 只请求指定平台，其他平台设为null占位
      switch (platformFilter.value) {
        case 'claude':
          requests.push(
            apiClient.get('/admin/claude-accounts', { params }),
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            Promise.resolve({ success: true, data: [] }), // openai 占位
            Promise.resolve({ success: true, data: [] }), // azure-openai 占位
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'claude-console':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            apiClient.get('/admin/claude-console-accounts', { params }),
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            Promise.resolve({ success: true, data: [] }), // openai 占位
            Promise.resolve({ success: true, data: [] }), // azure-openai 占位
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'bedrock':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            apiClient.get('/admin/bedrock-accounts', { params }),
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            Promise.resolve({ success: true, data: [] }), // openai 占位
            Promise.resolve({ success: true, data: [] }), // azure-openai 占位
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'gemini':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            apiClient.get('/admin/gemini-accounts', { params }),
            Promise.resolve({ success: true, data: [] }), // openai 占位
            Promise.resolve({ success: true, data: [] }), // azure-openai 占位
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'openai':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            apiClient.get('/admin/openai-accounts', { params }),
            Promise.resolve({ success: true, data: [] }), // azure-openai 占位
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'azure_openai':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            Promise.resolve({ success: true, data: [] }), // openai 占位
            apiClient.get('/admin/azure-openai-accounts', { params }),
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'openai-responses':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            Promise.resolve({ success: true, data: [] }), // openai 占位
            Promise.resolve({ success: true, data: [] }), // azure-openai 占位
            apiClient.get('/admin/openai-responses-accounts', { params }),
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'ccr':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            Promise.resolve({ success: true, data: [] }), // openai 占位
            Promise.resolve({ success: true, data: [] }), // azure 占位
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            apiClient.get('/admin/ccr-accounts', { params }),
            Promise.resolve({ success: true, data: [] }) // droid 占位
          )
          break
        case 'droid':
          requests.push(
            Promise.resolve({ success: true, data: [] }), // claude 占位
            Promise.resolve({ success: true, data: [] }), // claude-console 占位
            Promise.resolve({ success: true, data: [] }), // bedrock 占位
            Promise.resolve({ success: true, data: [] }), // gemini 占位
            Promise.resolve({ success: true, data: [] }), // openai 占位
            Promise.resolve({ success: true, data: [] }), // azure 占位
            Promise.resolve({ success: true, data: [] }), // openai-responses 占位
            Promise.resolve({ success: true, data: [] }), // ccr 占位
            apiClient.get('/admin/droid-accounts', { params })
          )
          break
        default:
          // 默认情况下返回空数组
          requests.push(
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] }),
            Promise.resolve({ success: true, data: [] })
          )
          break
      }
    }

    // 使用缓存机制加载 API Keys 和分组数据
    await Promise.all([loadApiKeys(forceReload), loadAccountGroups(forceReload)])

    // 后端账户API已经包含分组信息，不需要单独加载分组成员关系
    // await loadGroupMembers(forceReload)

    const [
      claudeData,
      claudeConsoleData,
      bedrockData,
      geminiData,
      openaiData,
      azureOpenaiData,
      openaiResponsesData,
      ccrData,
      droidData
    ] = await Promise.all(requests)

    const allAccounts = []

    if (claudeData.success) {
      const claudeAccounts = (claudeData.data || []).map((acc) => {
        // 计算每个Claude账户绑定的API Key数量
        const boundApiKeysCount = apiKeys.value.filter(
          (key) => key.claudeAccountId === acc.id
        ).length
        // 后端已经包含了groupInfos，直接使用
        return { ...acc, platform: 'claude', boundApiKeysCount }
      })
      allAccounts.push(...claudeAccounts)
    }

    if (claudeConsoleData.success) {
      const claudeConsoleAccounts = (claudeConsoleData.data || []).map((acc) => {
        // 计算每个Claude Console账户绑定的API Key数量
        const boundApiKeysCount = apiKeys.value.filter(
          (key) => key.claudeConsoleAccountId === acc.id
        ).length
        // 后端已经包含了groupInfos，直接使用
        return { ...acc, platform: 'claude-console', boundApiKeysCount }
      })
      allAccounts.push(...claudeConsoleAccounts)
    }

    if (bedrockData.success) {
      const bedrockAccounts = (bedrockData.data || []).map((acc) => {
        // Bedrock账户暂时不支持直接绑定
        // 后端已经包含了groupInfos，直接使用
        return { ...acc, platform: 'bedrock', boundApiKeysCount: 0 }
      })
      allAccounts.push(...bedrockAccounts)
    }

    if (geminiData.success) {
      const geminiAccounts = (geminiData.data || []).map((acc) => {
        // 计算每个Gemini账户绑定的API Key数量
        const boundApiKeysCount = apiKeys.value.filter(
          (key) => key.geminiAccountId === acc.id
        ).length
        // 后端已经包含了groupInfos，直接使用
        return { ...acc, platform: 'gemini', boundApiKeysCount }
      })
      allAccounts.push(...geminiAccounts)
    }
    if (openaiData.success) {
      const openaiAccounts = (openaiData.data || []).map((acc) => {
        // 计算每个OpenAI账户绑定的API Key数量
        const boundApiKeysCount = apiKeys.value.filter(
          (key) => key.openaiAccountId === acc.id
        ).length
        // 后端已经包含了groupInfos，直接使用
        return { ...acc, platform: 'openai', boundApiKeysCount }
      })
      allAccounts.push(...openaiAccounts)
    }
    if (azureOpenaiData && azureOpenaiData.success) {
      const azureOpenaiAccounts = (azureOpenaiData.data || []).map((acc) => {
        // 计算每个Azure OpenAI账户绑定的API Key数量
        const boundApiKeysCount = apiKeys.value.filter(
          (key) => key.azureOpenaiAccountId === acc.id
        ).length
        // 后端已经包含了groupInfos，直接使用
        return { ...acc, platform: 'azure_openai', boundApiKeysCount }
      })
      allAccounts.push(...azureOpenaiAccounts)
    }

    if (openaiResponsesData && openaiResponsesData.success) {
      const openaiResponsesAccounts = (openaiResponsesData.data || []).map((acc) => {
        // 计算每个OpenAI-Responses账户绑定的API Key数量
        // OpenAI-Responses账户使用 responses: 前缀
        const boundApiKeysCount = apiKeys.value.filter(
          (key) => key.openaiAccountId === `responses:${acc.id}`
        ).length
        // 后端已经包含了groupInfos，直接使用
        return { ...acc, platform: 'openai-responses', boundApiKeysCount }
      })
      allAccounts.push(...openaiResponsesAccounts)
    }

    // CCR 账户
    if (ccrData && ccrData.success) {
      const ccrAccounts = (ccrData.data || []).map((acc) => {
        // CCR 不支持 API Key 绑定，固定为 0
        return { ...acc, platform: 'ccr', boundApiKeysCount: 0 }
      })
      allAccounts.push(...ccrAccounts)
    }

    // Droid 账户
    if (droidData && droidData.success) {
      const droidAccounts = (droidData.data || []).map((acc) => {
        return {
          ...acc,
          platform: 'droid',
          boundApiKeysCount: acc.boundApiKeysCount ?? 0
        }
      })
      allAccounts.push(...droidAccounts)
    }

    // 根据分组筛选器过滤账户
    let filteredAccounts = allAccounts
    if (groupFilter.value !== 'all') {
      if (groupFilter.value === 'ungrouped') {
        // 筛选未分组的账户（没有 groupInfos 或 groupInfos 为空数组）
        filteredAccounts = allAccounts.filter((account) => {
          return !account.groupInfos || account.groupInfos.length === 0
        })
      } else {
        // 筛选属于特定分组的账户
        filteredAccounts = allAccounts.filter((account) => {
          if (!account.groupInfos || account.groupInfos.length === 0) {
            return false
          }
          // 检查账户是否属于选中的分组
          return account.groupInfos.some((group) => group.id === groupFilter.value)
        })
      }
    }

    filteredAccounts = filteredAccounts.map((account) => {
      const proxyConfig = normalizeProxyData(account.proxyConfig || account.proxy)
      return {
        ...account,
        proxyConfig: proxyConfig || null
      }
    })

    accounts.value = filteredAccounts
    cleanupSelectedAccounts()

    // 异步加载 Claude OAuth 账户的 usage 数据
    if (filteredAccounts.some((acc) => acc.platform === 'claude')) {
      loadClaudeUsage().catch((err) => {
        console.debug('Claude usage loading failed:', err)
      })
    }
  } catch (error) {
    showToast('加载账户失败', 'error')
  } finally {
    accountsLoading.value = false
  }
}

// 异步加载 Claude 账户的 Usage 数据
const loadClaudeUsage = async () => {
  try {
    const response = await apiClient.get('/admin/claude-accounts/usage')
    if (response.success && response.data) {
      const usageMap = response.data

      // 更新账户列表中的 claudeUsage 数据
      accounts.value = accounts.value.map((account) => {
        if (account.platform === 'claude' && usageMap[account.id]) {
          return {
            ...account,
            claudeUsage: usageMap[account.id]
          }
        }
        return account
      })
    }
  } catch (error) {
    console.debug('Failed to load Claude usage data:', error)
  }
}

// 排序账户
const sortAccounts = (field) => {
  if (field) {
    if (accountsSortBy.value === field) {
      accountsSortOrder.value = accountsSortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      accountsSortBy.value = field
      accountsSortOrder.value = 'asc'
    }
  }
}

// 格式化数字（与原版保持一致）
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  const number = Number(num)
  if (number >= 1000000) {
    return (number / 1000000).toFixed(2)
  } else if (number >= 1000) {
    return (number / 1000000).toFixed(4)
  }
  return (number / 1000000).toFixed(6)
}

// 格式化最后使用时间
const formatLastUsed = (dateString) => {
  if (!dateString) return '从未使用'

  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

  return date.toLocaleDateString('zh-CN')
}

const clearSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

// 加载API Keys列表（缓存版本）
const loadApiKeys = async (forceReload = false) => {
  if (!forceReload && apiKeysLoaded.value) {
    return // 使用缓存数据
  }

  try {
    const response = await apiClient.get('/admin/api-keys')
    if (response.success) {
      apiKeys.value = response.data || []
      apiKeysLoaded.value = true
    }
  } catch (error) {
    // 静默处理错误
  }
}

// 加载账户分组列表（缓存版本）
const loadAccountGroups = async (forceReload = false) => {
  if (!forceReload && groupsLoaded.value) {
    return // 使用缓存数据
  }

  try {
    const response = await apiClient.get('/admin/account-groups')
    if (response.success) {
      accountGroups.value = response.data || []
      groupsLoaded.value = true
    }
  } catch (error) {
    // 静默处理错误
  }
}

// 清空缓存的函数
const clearCache = () => {
  apiKeysLoaded.value = false
  groupsLoaded.value = false
  groupMembersLoaded.value = false
  accountGroupMap.value.clear()
}

// 按平台筛选账户
const filterByPlatform = () => {
  currentPage.value = 1
  loadAccounts()
}

// 按分组筛选账户
const filterByGroup = () => {
  currentPage.value = 1
  loadAccounts()
}

// 规范化代理配置，支持字符串与对象
function normalizeProxyData(proxy) {
  if (!proxy) {
    return null
  }

  let proxyObject = proxy
  if (typeof proxy === 'string') {
    try {
      proxyObject = JSON.parse(proxy)
    } catch (error) {
      return null
    }
  }

  if (!proxyObject || typeof proxyObject !== 'object') {
    return null
  }

  const candidate =
    proxyObject.proxy && typeof proxyObject.proxy === 'object' ? proxyObject.proxy : proxyObject

  const host =
    typeof candidate.host === 'string'
      ? candidate.host.trim()
      : candidate.host !== undefined && candidate.host !== null
        ? String(candidate.host).trim()
        : ''

  const port =
    candidate.port !== undefined && candidate.port !== null ? String(candidate.port).trim() : ''

  if (!host || !port) {
    return null
  }

  const type =
    typeof candidate.type === 'string' && candidate.type.trim() ? candidate.type.trim() : 'socks5'

  const username =
    typeof candidate.username === 'string'
      ? candidate.username
      : candidate.username !== undefined && candidate.username !== null
        ? String(candidate.username)
        : ''

  const password =
    typeof candidate.password === 'string'
      ? candidate.password
      : candidate.password !== undefined && candidate.password !== null
        ? String(candidate.password)
        : ''

  return {
    type,
    host,
    port,
    username,
    password
  }
}

// 格式化代理信息显示
const formatProxyDisplay = (proxy) => {
  const parsed = normalizeProxyData(proxy)
  if (!parsed) {
    return null
  }

  const typeShort = parsed.type.toLowerCase() === 'socks5' ? 'S5' : parsed.type.toUpperCase()

  let host = parsed.host
  if (host.length > 15) {
    host = host.substring(0, 12) + '...'
  }

  let display = `${typeShort}://${host}:${parsed.port}`

  if (parsed.username) {
    display = `${typeShort}://***@${host}:${parsed.port}`
  }

  return display
}

// 格式化会话窗口时间
const formatSessionWindow = (windowStart, windowEnd) => {
  if (!windowStart || !windowEnd) return '--'

  const start = new Date(windowStart)
  const end = new Date(windowEnd)

  const startHour = start.getHours().toString().padStart(2, '0')
  const startMin = start.getMinutes().toString().padStart(2, '0')
  const endHour = end.getHours().toString().padStart(2, '0')
  const endMin = end.getMinutes().toString().padStart(2, '0')

  return `${startHour}:${startMin} - ${endHour}:${endMin}`
}

// 格式化剩余时间
const formatRemainingTime = (minutes) => {
  if (!minutes || minutes <= 0) return '已结束'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
}

// 格式化限流时间（支持显示天数）
const formatRateLimitTime = (minutes) => {
  if (!minutes || minutes <= 0) return ''

  // 转换为整数，避免小数
  minutes = Math.floor(minutes)

  // 计算天数、小时和分钟
  const days = Math.floor(minutes / 1440) // 1天 = 1440分钟
  const remainingAfterDays = minutes % 1440
  const hours = Math.floor(remainingAfterDays / 60)
  const mins = remainingAfterDays % 60

  // 根据时间长度返回不同格式
  if (days > 0) {
    // 超过1天，显示天数和小时
    if (hours > 0) {
      return `${days}天${hours}小时`
    }
    return `${days}天`
  } else if (hours > 0) {
    // 超过1小时但不到1天，显示小时和分钟
    if (mins > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${hours}小时`
  } else {
    // 不到1小时，只显示分钟
    return `${mins}分钟`
  }
}

// 打开创建账户模态框
const openCreateAccountModal = () => {
  newAccountPlatform.value = null // 重置选择的平台
  showCreateAccountModal.value = true
}

// 关闭创建账户模态框
const closeCreateAccountModal = () => {
  showCreateAccountModal.value = false
  newAccountPlatform.value = null
}

// 编辑账户
const editAccount = (account) => {
  editingAccount.value = account
  showEditAccountModal.value = true
}

const getBoundApiKeysForAccount = (account) => {
  if (!account || !account.id) return []
  return apiKeys.value.filter((key) => {
    const accountId = account.id
    return (
      key.claudeAccountId === accountId ||
      key.claudeConsoleAccountId === accountId ||
      key.geminiAccountId === accountId ||
      key.openaiAccountId === accountId ||
      key.azureOpenaiAccountId === accountId ||
      key.openaiAccountId === `responses:${accountId}`
    )
  })
}

const resolveAccountDeleteEndpoint = (account) => {
  switch (account.platform) {
    case 'claude':
      return `/admin/claude-accounts/${account.id}`
    case 'claude-console':
      return `/admin/claude-console-accounts/${account.id}`
    case 'bedrock':
      return `/admin/bedrock-accounts/${account.id}`
    case 'openai':
      return `/admin/openai-accounts/${account.id}`
    case 'azure_openai':
      return `/admin/azure-openai-accounts/${account.id}`
    case 'openai-responses':
      return `/admin/openai-responses-accounts/${account.id}`
    case 'ccr':
      return `/admin/ccr-accounts/${account.id}`
    case 'gemini':
      return `/admin/gemini-accounts/${account.id}`
    case 'droid':
      return `/admin/droid-accounts/${account.id}`
    default:
      return null
  }
}

const performAccountDeletion = async (account) => {
  const endpoint = resolveAccountDeleteEndpoint(account)
  if (!endpoint) {
    return { success: false, message: '不支持的账户类型' }
  }

  try {
    const data = await apiClient.delete(endpoint)
    if (data.success) {
      return { success: true, data }
    }
    return { success: false, message: data.message || '删除失败' }
  } catch (error) {
    const message = error.response?.data?.message || error.message || '删除失败'
    return { success: false, message }
  }
}

// 删除账户
const deleteAccount = async (account) => {
  const boundKeys = getBoundApiKeysForAccount(account)
  const boundKeysCount = boundKeys.length

  let confirmMessage = `确定要删除账户 "${account.name}" 吗？`
  if (boundKeysCount > 0) {
    confirmMessage += `\n\n⚠️ 注意：此账号有 ${boundKeysCount} 个 API Key 绑定。`
    confirmMessage += `\n删除后，这些 API Key 将自动切换为共享池模式。`
  }
  confirmMessage += '\n\n此操作不可恢复。'

  const confirmed = await showConfirm('删除账户', confirmMessage, '删除', '取消')

  if (!confirmed) return

  const result = await performAccountDeletion(account)

  if (result.success) {
    const data = result.data
    let toastMessage = '账户已成功删除'
    if (data?.unboundKeys > 0) {
      toastMessage += `，${data.unboundKeys} 个 API Key 已切换为共享池模式`
    }
    showToast(toastMessage, 'success')

    selectedAccounts.value = selectedAccounts.value.filter((id) => id !== account.id)
    updateSelectAllState()

    groupMembersLoaded.value = false
    apiKeysLoaded.value = false
    loadAccounts()
    loadApiKeys(true)
  } else {
    showToast(result.message || '删除失败', 'error')
  }
}

// 批量删除账户
const batchDeleteAccounts = async () => {
  if (selectedAccounts.value.length === 0) {
    showToast('请先选择要删除的账户', 'warning')
    return
  }

  const accountsMap = new Map(accounts.value.map((item) => [item.id, item]))
  const targets = selectedAccounts.value
    .map((id) => accountsMap.get(id))
    .filter((account) => !!account)

  if (targets.length === 0) {
    showToast('选中的账户已不存在', 'warning')
    selectedAccounts.value = []
    updateSelectAllState()
    return
  }

  let confirmMessage = `确定要删除选中的 ${targets.length} 个账户吗？此操作不可恢复。`
  const boundInfo = targets
    .map((account) => ({ account, boundKeys: getBoundApiKeysForAccount(account) }))
    .filter((item) => item.boundKeys.length > 0)

  if (boundInfo.length > 0) {
    confirmMessage += '\n\n⚠️ 以下账户存在绑定的 API Key，将自动解绑：'
    boundInfo.forEach(({ account, boundKeys }) => {
      const displayName = account.name || account.email || account.accountName || account.id
      confirmMessage += `\n- ${displayName}: ${boundKeys.length} 个`
    })
    confirmMessage += '\n删除后，这些 API Key 将切换为共享池模式。'
  }

  confirmMessage += '\n\n请再次确认是否继续。'

  const confirmed = await showConfirm('批量删除账户', confirmMessage, '删除', '取消')
  if (!confirmed) return

  let successCount = 0
  let failedCount = 0
  let totalUnboundKeys = 0
  const failedDetails = []

  for (const account of targets) {
    const result = await performAccountDeletion(account)
    if (result.success) {
      successCount += 1
      totalUnboundKeys += result.data?.unboundKeys || 0
    } else {
      failedCount += 1
      failedDetails.push({
        name: account.name || account.email || account.accountName || account.id,
        message: result.message || '删除失败'
      })
    }
  }

  if (successCount > 0) {
    let toastMessage = `成功删除 ${successCount} 个账户`
    if (totalUnboundKeys > 0) {
      toastMessage += `，${totalUnboundKeys} 个 API Key 已切换为共享池模式`
    }
    showToast(toastMessage, failedCount > 0 ? 'warning' : 'success')

    selectedAccounts.value = []
    selectAllChecked.value = false
    isIndeterminate.value = false

    groupMembersLoaded.value = false
    apiKeysLoaded.value = false
    await loadAccounts(true)
  }

  if (failedCount > 0) {
    const detailMessage = failedDetails.map((item) => `${item.name}: ${item.message}`).join('\n')
    showToast(
      `有 ${failedCount} 个账户删除失败:\n${detailMessage}`,
      successCount > 0 ? 'warning' : 'error'
    )
  }

  updateSelectAllState()
}

// 重置账户状态
const resetAccountStatus = async (account) => {
  if (account.isResetting) return

  let confirmed = false
  if (window.showConfirm) {
    confirmed = await window.showConfirm(
      '重置账户状态',
      '确定要重置此账户的所有异常状态吗？这将清除限流状态、401错误计数等所有异常标记。',
      '确定重置',
      '取消'
    )
  } else {
    confirmed = confirm('确定要重置此账户的所有异常状态吗？')
  }

  if (!confirmed) return

  try {
    account.isResetting = true

    // 根据账户平台选择不同的 API 端点
    let endpoint = ''
    if (account.platform === 'openai') {
      endpoint = `/admin/openai-accounts/${account.id}/reset-status`
    } else if (account.platform === 'openai-responses') {
      endpoint = `/admin/openai-responses-accounts/${account.id}/reset-status`
    } else if (account.platform === 'claude') {
      endpoint = `/admin/claude-accounts/${account.id}/reset-status`
    } else if (account.platform === 'claude-console') {
      endpoint = `/admin/claude-console-accounts/${account.id}/reset-status`
    } else if (account.platform === 'ccr') {
      endpoint = `/admin/ccr-accounts/${account.id}/reset-status`
    } else if (account.platform === 'droid') {
      endpoint = `/admin/droid-accounts/${account.id}/reset-status`
    } else {
      showToast('不支持的账户类型', 'error')
      account.isResetting = false
      return
    }

    const data = await apiClient.post(endpoint)

    if (data.success) {
      showToast('账户状态已重置', 'success')
      // 强制刷新，绕过前端缓存，确保最终一致性
      loadAccounts(true)
    } else {
      showToast(data.message || '状态重置失败', 'error')
    }
  } catch (error) {
    showToast('状态重置失败', 'error')
  } finally {
    account.isResetting = false
  }
}

// 切换调度状态
const toggleSchedulable = async (account) => {
  if (account.isTogglingSchedulable) return

  try {
    account.isTogglingSchedulable = true

    let endpoint
    if (account.platform === 'claude') {
      endpoint = `/admin/claude-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'claude-console') {
      endpoint = `/admin/claude-console-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'bedrock') {
      endpoint = `/admin/bedrock-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'gemini') {
      endpoint = `/admin/gemini-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'openai') {
      endpoint = `/admin/openai-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'azure_openai') {
      endpoint = `/admin/azure-openai-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'openai-responses') {
      endpoint = `/admin/openai-responses-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'ccr') {
      endpoint = `/admin/ccr-accounts/${account.id}/toggle-schedulable`
    } else if (account.platform === 'droid') {
      endpoint = `/admin/droid-accounts/${account.id}/toggle-schedulable`
    } else {
      showToast('该账户类型暂不支持调度控制', 'warning')
      return
    }

    const data = await apiClient.put(endpoint)

    if (data.success) {
      account.schedulable = data.schedulable
      showToast(data.schedulable ? '已启用调度' : '已禁用调度', 'success')
    } else {
      showToast(data.message || '操作失败', 'error')
    }
  } catch (error) {
    showToast('切换调度状态失败', 'error')
  } finally {
    account.isTogglingSchedulable = false
  }
}

// 处理创建成功
const handleCreateSuccess = () => {
  showCreateAccountModal.value = false
  showToast('账户创建成功', 'success')
  // 清空缓存，因为可能涉及分组关系变化
  clearCache()
  loadAccounts()
}

// 处理编辑成功
const handleEditSuccess = () => {
  showEditAccountModal.value = false
  showToast('账户更新成功', 'success')
  // 清空分组成员缓存，因为账户类型和分组可能发生变化
  groupMembersLoaded.value = false
  loadAccounts()
}

// 获取 Claude 账号的添加方式
const getClaudeAuthType = (account) => {
  // 基于 lastRefreshAt 判断：如果为空说明是 Setup Token（不能刷新），否则是 OAuth
  if (!account.lastRefreshAt || account.lastRefreshAt === '') {
    return 'Setup' // 缩短显示文本
  }
  return 'OAuth'
}

// 获取 Gemini 账号的添加方式
const getGeminiAuthType = () => {
  // Gemini 统一显示 OAuth
  return 'OAuth'
}

// 获取 OpenAI 账号的添加方式
const getOpenAIAuthType = () => {
  // OpenAI 统一显示 OAuth
  return 'OAuth'
}

// 获取 Droid 账号的认证方式
const getDroidAuthType = (account) => {
  if (!account || typeof account !== 'object') {
    return 'OAuth'
  }

  const apiKeyModeFlag =
    account.isApiKeyMode ?? account.is_api_key_mode ?? account.apiKeyMode ?? account.api_key_mode

  if (
    apiKeyModeFlag === true ||
    apiKeyModeFlag === 'true' ||
    apiKeyModeFlag === 1 ||
    apiKeyModeFlag === '1'
  ) {
    return 'API Key'
  }

  const methodCandidate =
    account.authenticationMethod ||
    account.authMethod ||
    account.authentication_mode ||
    account.authenticationMode ||
    account.authentication_method ||
    account.auth_type ||
    account.authType ||
    account.authentication_type ||
    account.authenticationType ||
    account.droidAuthType ||
    account.droidAuthenticationMethod ||
    account.method ||
    account.auth ||
    ''

  if (typeof methodCandidate === 'string') {
    const normalized = methodCandidate.trim().toLowerCase()
    const compacted = normalized.replace(/[\s_-]/g, '')

    if (compacted === 'apikey') {
      return 'API Key'
    }
  }

  return 'OAuth'
}

// 判断是否为 API Key 模式的 Droid 账号
const isDroidApiKeyMode = (account) => getDroidAuthType(account) === 'API Key'

// 获取 Droid 账号的 API Key 数量
const getDroidApiKeyCount = (account) => {
  if (!account || typeof account !== 'object') {
    return 0
  }

  // 优先使用 apiKeys 数组来计算正常状态的 API Keys
  if (Array.isArray(account.apiKeys)) {
    // 只计算状态不是 'error' 的 API Keys
    return account.apiKeys.filter((apiKey) => apiKey.status !== 'error').length
  }

  // 如果是字符串格式的 apiKeys，尝试解析
  if (typeof account.apiKeys === 'string' && account.apiKeys.trim()) {
    try {
      const parsed = JSON.parse(account.apiKeys)
      if (Array.isArray(parsed)) {
        // 只计算状态不是 'error' 的 API Keys
        return parsed.filter((apiKey) => apiKey.status !== 'error').length
      }
    } catch (error) {
      // 忽略解析错误，继续使用其他字段
    }
  }

  const candidates = [
    account.apiKeyCount,
    account.api_key_count,
    account.apiKeysCount,
    account.api_keys_count
  ]

  for (const candidate of candidates) {
    const value = Number(candidate)
    if (Number.isFinite(value) && value >= 0) {
      return value
    }
  }

  return 0
}

// 获取 Claude 账号类型显示
const getClaudeAccountType = (account) => {
  // 如果有订阅信息
  if (account.subscriptionInfo) {
    try {
      // 如果 subscriptionInfo 是字符串，尝试解析
      const info =
        typeof account.subscriptionInfo === 'string'
          ? JSON.parse(account.subscriptionInfo)
          : account.subscriptionInfo

      // 订阅信息已解析

      // 根据 has_claude_max 和 has_claude_pro 判断
      if (info.hasClaudeMax === true) {
        return 'Claude Max'
      } else if (info.hasClaudePro === true) {
        return 'Claude Pro'
      } else {
        return 'Claude Free'
      }
    } catch (e) {
      // 解析失败，返回默认值
      return 'Claude'
    }
  }

  // 没有订阅信息，保持原有显示
  return 'Claude'
}

// 获取停止调度的原因
const getSchedulableReason = (account) => {
  if (account.schedulable !== false) return null

  // Claude Console 账户的错误状态
  if (account.platform === 'claude-console') {
    if (account.status === 'unauthorized') {
      return 'API Key无效或已过期（401错误）'
    }
    if (account.overloadStatus === 'overloaded') {
      return '服务过载（529错误）'
    }
    if (account.rateLimitStatus === 'limited') {
      return '触发限流（429错误）'
    }
    if (account.status === 'blocked' && account.errorMessage) {
      return account.errorMessage
    }
  }

  // Claude 官方账户的错误状态
  if (account.platform === 'claude') {
    if (account.status === 'unauthorized') {
      return '认证失败（401错误）'
    }
    if (account.status === 'temp_error' && account.errorMessage) {
      return account.errorMessage
    }
    if (account.status === 'error' && account.errorMessage) {
      return account.errorMessage
    }
    if (account.isRateLimited) {
      return '触发限流（429错误）'
    }
    // 自动停止调度的原因
    if (account.stoppedReason) {
      return account.stoppedReason
    }
    // 检查5小时限制自动停止标志（备用方案）
    if (account.fiveHourAutoStopped === 'true' || account.fiveHourAutoStopped === true) {
      return '5小时使用量接近限制，已自动停止调度'
    }
  }

  // OpenAI 账户的错误状态
  if (account.platform === 'openai') {
    if (account.status === 'unauthorized') {
      return '认证失败（401错误）'
    }
    // 检查限流状态 - 兼容嵌套的 rateLimitStatus 对象
    if (
      (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
      account.isRateLimited
    ) {
      return '触发限流（429错误）'
    }
    if (account.status === 'error' && account.errorMessage) {
      return account.errorMessage
    }
  }

  // OpenAI-Responses 账户的错误状态
  if (account.platform === 'openai-responses') {
    if (account.status === 'unauthorized') {
      return '认证失败（401错误）'
    }
    // 检查限流状态 - 兼容嵌套的 rateLimitStatus 对象
    if (
      (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
      account.isRateLimited
    ) {
      return '触发限流（429错误）'
    }
    if (account.status === 'error' && account.errorMessage) {
      return account.errorMessage
    }
    if (account.status === 'rateLimited') {
      return '触发限流（429错误）'
    }
  }

  // 通用原因
  if (account.stoppedReason) {
    return account.stoppedReason
  }
  if (account.errorMessage) {
    return account.errorMessage
  }

  // 默认为手动停止
  return '手动停止调度'
}

// 获取账户状态文本
const getAccountStatusText = (account) => {
  // 检查是否被封锁
  if (account.status === 'blocked') return '已封锁'
  // 检查是否未授权（401错误）
  if (account.status === 'unauthorized') return '异常'
  // 检查是否限流
  if (
    account.isRateLimited ||
    account.status === 'rate_limited' ||
    (account.rateLimitStatus && account.rateLimitStatus.isRateLimited) ||
    account.rateLimitStatus === 'limited'
  )
    return '限流中'
  // 检查是否临时错误
  if (account.status === 'temp_error') return '临时异常'
  // 检查是否错误
  if (account.status === 'error' || !account.isActive) return '错误'
  // 检查是否可调度
  if (account.schedulable === false) return '已暂停'
  // 否则正常
  return '正常'
}

// 获取会话窗口百分比
// const getSessionWindowPercentage = (account) => {
// if (!account.sessionWindow) return 100
// const { remaining, total } = account.sessionWindow
// if (!total || total === 0) return 100
// return Math.round((remaining / total) * 100)
// }

// 格式化相对时间
const formatRelativeTime = (dateString) => {
  return formatLastUsed(dateString)
}

// ====== Claude OAuth Usage 相关函数 ======

// 判断 Claude 账户是否为 OAuth 授权
const isClaudeOAuth = (account) => {
  return account.authType === 'oauth'
}

// 格式化 Claude 使用率百分比
const formatClaudeUsagePercent = (window) => {
  if (!window || window.utilization === null || window.utilization === undefined) {
    return '-'
  }
  return `${window.utilization}%`
}

// 格式化 Claude 剩余时间
const formatClaudeRemaining = (window) => {
  if (!window || !window.remainingSeconds) {
    return '-'
  }

  const seconds = window.remainingSeconds
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    if (hours > 0) {
      return `${days}天${hours}小时`
    }
    return `${days}天`
  }
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${hours}小时`
  }
  if (minutes > 0) {
    return `${minutes}分钟`
  }
  return `${Math.floor(seconds % 60)}秒`
}

// 归一化 OpenAI 会话窗口使用率
const normalizeCodexUsagePercent = (usageItem) => {
  if (!usageItem) {
    return null
  }

  const basePercent =
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

  if (resetElapsed) {
    return 0
  }

  if (basePercent === null) {
    return null
  }

  return Math.max(0, Math.min(100, basePercent))
}

// 百分比显示
const formatCodexUsagePercent = (usageItem) => {
  const percent = normalizeCodexUsagePercent(usageItem)
  if (percent === null) {
    return '--'
  }
  return `${percent.toFixed(1)}%`
}

// 时间窗口标签
const getCodexWindowLabel = (type) => {
  if (type === 'secondary') {
    return '周限'
  }
  return '5h'
}

// 格式化剩余时间
const formatCodexRemaining = (usageItem) => {
  if (!usageItem) {
    return '--'
  }

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

  if (days > 0) {
    if (hours > 0) {
      return `${days}天${hours}小时`
    }
    return `${days}天`
  }
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${hours}小时`
  }
  if (minutes > 0) {
    return `${minutes}分钟`
  }
  return `${secs}秒`
}

// 格式化费用显示
const formatCost = (cost) => {
  if (!cost || cost === 0) return '0.0000'
  if (cost < 0.0001) return cost.toExponential(2)
  if (cost < 0.01) return cost.toFixed(6)
  if (cost < 1) return cost.toFixed(4)
  return cost.toFixed(2)
}

// 额度使用百分比（Claude Console）
const getQuotaUsagePercent = (account) => {
  const used = Number(account?.usage?.daily?.cost || 0)
  const quota = Number(account?.dailyQuota || 0)
  if (!quota || quota <= 0) return 0
  return (used / quota) * 100
}

// 并发使用百分比（Claude Console）
const getConsoleConcurrencyPercent = (account) => {
  const max = Number(account?.maxConcurrentTasks || 0)
  if (!max || max <= 0) return 0
  const active = Number(account?.activeTaskCount || 0)
  return Math.min(100, (active / max) * 100)
}

// 剩余额度（Claude Console）
const formatRemainingQuota = (account) => {
  const used = Number(account?.usage?.daily?.cost || 0)
  const quota = Number(account?.dailyQuota || 0)
  if (!quota || quota <= 0) return '0.00'
  return Math.max(0, quota - used).toFixed(2)
}

// 计算每日费用（使用后端返回的精确费用数据）
const calculateDailyCost = (account) => {
  if (!account.usage || !account.usage.daily) return '0.0000'

  // 如果后端已经返回了计算好的费用，直接使用
  if (account.usage.daily.cost !== undefined) {
    return formatCost(account.usage.daily.cost)
  }

  // 如果后端没有返回费用（旧版本），返回0
  return '0.0000'
}

// 切换调度状态
// const toggleDispatch = async (account) => {
// await toggleSchedulable(account)
// }

watch(searchKeyword, () => {
  currentPage.value = 1
  updateSelectAllState()
})

watch(pageSize, (newSize) => {
  localStorage.setItem(PAGE_SIZE_STORAGE_KEY, newSize.toString())
  updateSelectAllState()
})

watch(
  () => sortedAccounts.value.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1
    }
    updateSelectAllState()
  }
)

// 监听排序选择变化
watch(accountSortBy, (newVal) => {
  const fieldMap = {
    name: 'name',
    dailyTokens: 'dailyTokens',
    dailyRequests: 'dailyRequests',
    totalTokens: 'totalTokens',
    lastUsed: 'lastUsed'
  }

  if (fieldMap[newVal]) {
    sortAccounts(fieldMap[newVal])
  }
})

watch(currentPage, () => {
  updateSelectAllState()
})

watch(paginatedAccounts, () => {
  updateSelectAllState()
})

watch(accounts, () => {
  cleanupSelectedAccounts()
})
// 到期时间相关方法
const formatExpireDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const isExpired = (expiresAt) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const isExpiringSoon = (expiresAt) => {
  if (!expiresAt) return false
  const now = new Date()
  const expireDate = new Date(expiresAt)
  const daysUntilExpire = (expireDate - now) / (1000 * 60 * 60 * 24)
  return daysUntilExpire > 0 && daysUntilExpire <= 7
}

// 开始编辑账户过期时间
const startEditAccountExpiry = (account) => {
  editingExpiryAccount.value = account
}

// 关闭账户过期时间编辑
const closeAccountExpiryEdit = () => {
  editingExpiryAccount.value = null
}

// 保存账户过期时间
const handleSaveAccountExpiry = async ({ accountId, expiresAt }) => {
  try {
    // 根据账号平台选择正确的 API 端点
    const account = accounts.value.find((acc) => acc.id === accountId)

    if (!account) {
      showToast('未找到账户', 'error')
      return
    }

    // 定义每个平台的端点和参数名
    // 注意：部分平台使用 :accountId，部分使用 :id
    let endpoint = ''
    switch (account.platform) {
      case 'claude':
      case 'claude-oauth':
        endpoint = `/admin/claude-accounts/${accountId}`
        break
      case 'gemini':
        endpoint = `/admin/gemini-accounts/${accountId}`
        break
      case 'claude-console':
        endpoint = `/admin/claude-console-accounts/${accountId}`
        break
      case 'bedrock':
        endpoint = `/admin/bedrock-accounts/${accountId}`
        break
      case 'ccr':
        endpoint = `/admin/ccr-accounts/${accountId}`
        break
      case 'openai':
        endpoint = `/admin/openai-accounts/${accountId}` // 使用 :id
        break
      case 'droid':
        endpoint = `/admin/droid-accounts/${accountId}` // 使用 :id
        break
      case 'azure_openai':
        endpoint = `/admin/azure-openai-accounts/${accountId}` // 使用 :id
        break
      case 'openai-responses':
        endpoint = `/admin/openai-responses-accounts/${accountId}` // 使用 :id
        break
      default:
        showToast(`不支持的平台类型: ${account.platform}`, 'error')
        return
    }

    const data = await apiClient.put(endpoint, {
      expiresAt: expiresAt || null
    })

    if (data.success) {
      showToast('账户到期时间已更新', 'success')
      // 更新本地数据
      account.expiresAt = expiresAt || null
      closeAccountExpiryEdit()
    } else {
      showToast(data.message || '更新失败', 'error')
      // 重置保存状态
      if (expiryEditModalRef.value) {
        expiryEditModalRef.value.resetSaving()
      }
    }
  } catch (error) {
    console.error('更新账户过期时间失败:', error)
    showToast('更新失败', 'error')
    // 重置保存状态
    if (expiryEditModalRef.value) {
      expiryEditModalRef.value.resetSaving()
    }
  }
}

onMounted(() => {
  // 首次加载时强制刷新所有数据
  loadAccounts(true)
})
</script>
