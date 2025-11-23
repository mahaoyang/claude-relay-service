<template>
  <PageContainer max-width="7xl">
    <template #header>
      <div>
        <h1 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          API Keys 管理
        </h1>
        <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">管理和监控您的 API 密钥</p>
      </div>
    </template>

    <Card>
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav aria-label="Tabs" class="flex gap-8 px-6">
          <button
            class="relative border-b-2 px-1 pb-4 pt-4 text-sm font-medium transition-colors"
            :class="
              activeTab === 'active'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
            "
            @click="activeTab = 'active'"
          >
            活跃 API Keys
            <span
              v-if="apiKeys.length > 0"
              class="ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="
                activeTab === 'active'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              "
            >
              {{ apiKeys.length }}
            </span>
          </button>
          <button
            class="relative border-b-2 px-1 pb-4 pt-4 text-sm font-medium transition-colors"
            :class="
              activeTab === 'deleted'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
            "
            @click="loadDeletedApiKeys"
          >
            已删除 API Keys
            <span
              v-if="deletedApiKeys.length > 0"
              class="ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="
                activeTab === 'deleted'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              "
            >
              {{ deletedApiKeys.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <!-- 活跃 API Keys Tab Panel -->
      <div v-if="activeTab === 'active'" class="p-6">
        <!-- 工具栏区域 -->
        <div class="mb-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <!-- 左侧：查询筛选器组 -->
          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <!-- 时间范围筛选 -->
            <div class="flex items-center gap-1.5">
              <div class="text-[10px] font-medium text-gray-500 dark:text-gray-400">时间范围</div>
              <CustomDropdown
                v-model="globalDateFilter.preset"
                icon="Calendar"
                icon-color="text-primary-500"
                :options="timeRangeDropdownOptions"
                placeholder="选择时间范围"
                size="small"
                @change="handleTimeRangeChange"
              />
            </div>

            <!-- 自定义日期范围选择器 - 在选择自定义时显示 -->
            <div v-if="globalDateFilter.type === 'custom'" class="w-full sm:w-auto">
              <el-date-picker
                :clearable="true"
                :default-time="defaultTime"
                :disabled-date="disabledDate"
                end-placeholder="结束日期"
                format="YYYY-MM-DD HH:mm:ss"
                :model-value="globalDateFilter.customRange"
                range-separator="至"
                size="small"
                start-placeholder="开始日期"
                type="datetimerange"
                :unlink-panels="false"
                value-format="YYYY-MM-DD HH:mm:ss"
                @update:model-value="onGlobalCustomDateRangeChange"
              />
            </div>

            <!-- 标签筛选器 -->
            <div class="flex items-center gap-1.5">
              <div class="text-[10px] font-medium text-gray-500 dark:text-gray-400">标签</div>
              <div class="flex items-center gap-1.5">
                <CustomDropdown
                  v-model="selectedTagFilter"
                  icon="Tags"
                  icon-color="text-purple-500"
                  :options="tagOptions"
                  placeholder="所有标签"
                  size="small"
                  @change="currentPage = 1"
                />
                <span
                  v-if="selectedTagFilter"
                  class="rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                >
                  {{ selectedTagCount }}
                </span>
              </div>
            </div>

            <!-- 搜索模式与搜索框 -->
            <div class="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <div>
                <CustomDropdown
                  v-model="searchMode"
                  icon="Filter"
                  icon-color="text-cyan-500"
                  :options="searchModeOptions"
                  placeholder="选择搜索类型"
                  size="small"
                  @change="currentPage = 1"
                />
              </div>
              <div class="relative w-full sm:w-56">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <Icon class="h-3.5 w-3.5 text-gray-400" name="Search" />
                </div>
                <input
                  v-model="searchKeyword"
                  class="block w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-8 text-xs text-gray-900 placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400 dark:focus:ring-primary-400"
                  :placeholder="
                    searchMode === 'bindingAccount'
                      ? '搜索所属账号...'
                      : isLdapEnabled
                        ? '搜索名称或所有者...'
                        : '搜索名称...'
                  "
                  type="text"
                  @input="currentPage = 1"
                />
                <button
                  v-if="searchKeyword"
                  class="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  @click="clearSearch"
                >
                  <Icon class="h-3.5 w-3.5" name="X" />
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：操作按钮组 -->
          <div class="flex flex-wrap gap-1.5">
            <!-- 刷新按钮 -->
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              :disabled="apiKeysLoading"
              @click="loadApiKeys()"
            >
              <Icon
                class="h-3.5 w-3.5"
                :class="{ 'animate-spin': apiKeysLoading }"
                name="RefreshCw"
              />
              <span>刷新</span>
            </button>

            <!-- 选择/取消选择按钮 -->
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              @click="toggleSelectionMode"
            >
              <Icon class="h-3.5 w-3.5" :name="showCheckboxes ? 'X' : 'CheckSquare'" />
              <span>{{ showCheckboxes ? '取消选择' : '选择' }}</span>
            </button>

            <!-- 导出数据按钮 -->
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              @click="exportToExcel"
            >
              <Icon class="h-3.5 w-3.5" name="FileSpreadsheet" />
              <span>导出数据</span>
            </button>

            <!-- 批量编辑按钮 -->
            <button
              v-if="selectedApiKeys.length > 0"
              class="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              @click="openBatchEditModal()"
            >
              <Icon class="h-3.5 w-3.5" name="Edit" />
              <span>编辑选中 ({{ selectedApiKeys.length }})</span>
            </button>

            <!-- 批量删除按钮 -->
            <button
              v-if="selectedApiKeys.length > 0"
              class="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              @click="batchDeleteApiKeys()"
            >
              <Icon class="h-3.5 w-3.5" name="Trash" />
              <span>删除选中 ({{ selectedApiKeys.length }})</span>
            </button>

            <!-- 创建按钮 -->
            <button
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
              @click.stop="openCreateApiKeyModal"
            >
              <Icon class="h-3.5 w-3.5" name="Plus" />
              <span>创建新 Key</span>
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="apiKeysLoading" class="flex flex-col items-center justify-center py-16">
          <div
            class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400">正在加载 API Keys...</p>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="apiKeys.length === 0"
          class="flex flex-col items-center justify-center py-16"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <Icon class="h-8 w-8 text-gray-400 dark:text-gray-500" name="Key" />
          </div>
          <p class="mb-2 text-base font-medium text-gray-900 dark:text-white">暂无 API Keys</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">点击上方按钮创建您的第一个 API Key</p>
        </div>

        <!-- 桌面端表格视图 -->
        <div
          v-else
          class="hidden overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 lg:block"
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
                    @click="sortApiKeys('name')"
                  >
                    <div class="flex items-center gap-1">
                      名称
                      <Icon
                        v-if="apiKeysSortBy === 'name'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    所属账号
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    标签
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortApiKeys('status')"
                  >
                    <div class="flex items-center gap-1">
                      状态
                      <Icon
                        v-if="apiKeysSortBy === 'status'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortApiKeys('periodCost')"
                  >
                    <div class="flex items-center gap-1">
                      费用
                      <Icon
                        v-if="apiKeysSortBy === 'periodCost'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    限制
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortApiKeys('periodTokens')"
                  >
                    <div class="flex items-center gap-1">
                      Token
                      <Icon
                        v-if="apiKeysSortBy === 'periodTokens'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortApiKeys('periodRequests')"
                  >
                    <div class="flex items-center gap-1">
                      请求数
                      <Icon
                        v-if="apiKeysSortBy === 'periodRequests'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortApiKeys('lastUsedAt')"
                  >
                    <div class="flex items-center gap-1">
                      最后使用
                      <Icon
                        v-if="apiKeysSortBy === 'lastUsedAt'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortApiKeys('createdAt')"
                  >
                    <div class="flex items-center gap-1">
                      创建时间
                      <Icon
                        v-if="apiKeysSortBy === 'createdAt'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
                  </th>
                  <th
                    class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="sortApiKeys('expiresAt')"
                  >
                    <div class="flex items-center gap-1">
                      过期时间
                      <Icon
                        v-if="apiKeysSortBy === 'expiresAt'"
                        class="h-3 w-3"
                        :name="apiKeysSortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'"
                      />
                      <Icon v-else class="h-3 w-3" name="ArrowUpDown" />
                    </div>
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
                <template v-for="key in paginatedApiKeys" :key="key.id">
                  <!-- API Key 主行 -->
                  <tr class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td v-if="shouldShowCheckboxes" class="whitespace-nowrap px-4 py-3">
                      <div class="flex items-center">
                        <input
                          v-model="selectedApiKeys"
                          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                          type="checkbox"
                          :value="key.id"
                          @change="updateSelectAllState"
                        />
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-4 py-3">
                      <div class="flex flex-col gap-1">
                        <!-- 名称 -->
                        <div class="font-medium text-gray-900 dark:text-white" :title="key.name">
                          {{ key.name }}
                        </div>
                        <!-- 显示所有者信息 -->
                        <div
                          v-if="isLdapEnabled && key.ownerDisplayName"
                          class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                        >
                          <Icon class="h-3 w-3" name="User" />
                          {{ key.ownerDisplayName }}
                        </div>
                      </div>
                    </td>
                    <!-- 所属账号列 -->
                    <td class="whitespace-nowrap px-4 py-3">
                      <div class="flex flex-col gap-1 text-sm">
                        <!-- Claude 绑定 -->
                        <div
                          v-if="key.claudeAccountId || key.claudeConsoleAccountId"
                          class="flex items-center gap-1"
                        >
                          <span
                            class="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400"
                          >
                            <Icon class="h-3.5 w-3.5" name="Brain" />
                            Claude
                          </span>
                          <span class="text-gray-600 dark:text-gray-400">
                            {{ getClaudeBindingInfo(key) }}
                          </span>
                        </div>
                        <!-- Gemini 绑定 -->
                        <div v-if="key.geminiAccountId" class="flex items-center gap-1">
                          <span
                            class="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400"
                          >
                            <Icon class="h-3.5 w-3.5" name="Bot" />
                            Gemini
                          </span>
                          <span class="text-gray-600 dark:text-gray-400">
                            {{ getGeminiBindingInfo(key) }}
                          </span>
                        </div>
                        <!-- OpenAI 绑定 -->
                        <div v-if="key.openaiAccountId" class="flex items-center gap-1">
                          <span
                            class="flex items-center gap-1 font-medium text-green-600 dark:text-green-400"
                          >
                            <Icon class="h-3 w-3" name="Bot" />
                            OpenAI
                          </span>
                          <span class="text-gray-600 dark:text-gray-400">
                            {{ getOpenAIBindingInfo(key) }}
                          </span>
                        </div>
                        <!-- Bedrock 绑定 -->
                        <div v-if="key.bedrockAccountId" class="flex items-center gap-1">
                          <span
                            class="flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400"
                          >
                            <Icon class="h-3.5 w-3.5" name="Cloud" />
                            Bedrock
                          </span>
                          <span class="text-gray-600 dark:text-gray-400">
                            {{ getBedrockBindingInfo(key) }}
                          </span>
                        </div>
                        <!-- Droid 绑定 -->
                        <div v-if="key.droidAccountId" class="flex items-center gap-1">
                          <span
                            class="flex items-center gap-1 font-medium text-cyan-600 dark:text-cyan-400"
                          >
                            <Icon class="h-3.5 w-3.5" name="Bot" />
                            Droid
                          </span>
                          <span class="text-gray-600 dark:text-gray-400">
                            {{ getDroidBindingInfo(key) }}
                          </span>
                        </div>
                        <!-- 共享池 -->
                        <div
                          v-if="
                            !key.claudeAccountId &&
                            !key.claudeConsoleAccountId &&
                            !key.geminiAccountId &&
                            !key.openaiAccountId &&
                            !key.bedrockAccountId &&
                            !key.droidAccountId
                          "
                          class="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                        >
                          <Icon class="h-3.5 w-3.5" name="Share2" />
                          共享池
                        </div>
                      </div>
                    </td>
                    <!-- 标签列 -->
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="tag in key.tags || []"
                          :key="tag"
                          class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {{ tag }}
                        </span>
                        <span
                          v-if="!key.tags || key.tags.length === 0"
                          class="text-sm text-gray-400 dark:text-gray-500"
                        >
                          无标签
                        </span>
                      </div>
                    </td>
                    <!-- 状态 -->
                    <td class="whitespace-nowrap px-4 py-3">
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        :class="
                          key.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        "
                      >
                        <div
                          class="h-1.5 w-1.5 rounded-full"
                          :class="key.isActive ? 'bg-green-500' : 'bg-gray-400'"
                        />
                        {{ key.isActive ? '活跃' : '禁用' }}
                      </span>
                    </td>
                    <!-- 费用 -->
                    <td class="whitespace-nowrap px-4 py-3">
                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                        ${{ getPeriodCost(key).toFixed(2) }}
                      </span>
                    </td>
                    <!-- 限制 -->
                    <td class="px-4 py-3">
                      <div class="min-w-[180px] space-y-2">
                        <!-- 每日费用限制进度条 -->
                        <LimitProgressBar
                          v-if="key.dailyCostLimit > 0"
                          :current="key.dailyCost || 0"
                          label="每日限制"
                          :limit="key.dailyCostLimit"
                          type="daily"
                          variant="compact"
                        />

                        <!-- 总费用限制进度条（无每日限制时展示） -->
                        <LimitProgressBar
                          v-else-if="key.totalCostLimit > 0"
                          :current="key.usage?.total?.cost || 0"
                          label="总费用限制"
                          :limit="key.totalCostLimit"
                          type="total"
                          variant="compact"
                        />

                        <!-- 时间窗口费用限制（无每日和总费用限制时展示） -->
                        <div
                          v-else-if="
                            key.rateLimitWindow > 0 &&
                            key.rateLimitCost > 0 &&
                            (!key.dailyCostLimit || key.dailyCostLimit === 0) &&
                            (!key.totalCostLimit || key.totalCostLimit === 0)
                          "
                          class="space-y-1"
                        >
                          <!-- 费用进度条 -->
                          <LimitProgressBar
                            :current="key.currentWindowCost || 0"
                            label="窗口费用"
                            :limit="key.rateLimitCost"
                            type="window"
                            variant="compact"
                          />
                          <!-- 重置倒计时 -->
                          <div
                            class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
                          >
                            <div class="flex items-center gap-1">
                              <Icon class="h-3 w-3" name="Clock" />
                              <span>{{ key.rateLimitWindow }}分钟窗口</span>
                            </div>
                            <span class="font-medium">
                              {{
                                key.windowRemainingSeconds > 0
                                  ? formatWindowTime(key.windowRemainingSeconds)
                                  : '未激活'
                              }}
                            </span>
                          </div>
                        </div>

                        <!-- 如果没有任何限制 -->
                        <div
                          v-else
                          class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
                        >
                          <Icon class="h-4 w-4" name="Infinity" />
                          <span>无限制</span>
                        </div>
                      </div>
                    </td>
                    <!-- Token数量 -->
                    <td class="whitespace-nowrap px-4 py-3">
                      <div class="text-sm">
                        <span class="font-medium text-gray-900 dark:text-white">
                          {{ formatTokenCount(getPeriodTokens(key)) }}
                        </span>
                      </div>
                    </td>
                    <!-- 请求数 -->
                    <td class="whitespace-nowrap px-4 py-3">
                      <div class="text-sm">
                        <span class="font-medium text-gray-900 dark:text-white">
                          {{ formatNumber(getPeriodRequests(key)) }}
                        </span>
                        <span class="text-gray-500 dark:text-gray-400">次</span>
                      </div>
                    </td>
                    <!-- 最后使用 -->
                    <td class="px-4 py-3">
                      <div class="flex flex-col gap-0.5 text-sm">
                        <span
                          v-if="key.lastUsedAt"
                          class="font-medium text-gray-900 dark:text-white"
                          :title="new Date(key.lastUsedAt).toLocaleString('zh-CN')"
                        >
                          {{ formatLastUsed(key.lastUsedAt) }}
                        </span>
                        <span v-else class="text-gray-500 dark:text-gray-400">从未使用</span>
                        <span
                          v-if="hasLastUsageAccount(key)"
                          class="text-xs text-gray-600 dark:text-gray-400"
                          :title="getLastUsageFullName(key)"
                        >
                          {{ getLastUsageDisplayName(key) }}
                          <span v-if="!isLastUsageDeleted(key)">
                            ({{ getLastUsageTypeLabel(key) }})
                          </span>
                        </span>
                        <span v-else class="text-xs text-gray-500 dark:text-gray-400">
                          暂无使用账号
                        </span>
                      </div>
                    </td>
                    <!-- 创建时间 -->
                    <td
                      class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {{ new Date(key.createdAt).toLocaleDateString() }}
                    </td>
                    <!-- 过期时间 -->
                    <td class="whitespace-nowrap px-4 py-3">
                      <div class="text-sm">
                        <!-- 未激活状态 -->
                        <span
                          v-if="key.expirationMode === 'activation' && !key.isActivated"
                          class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400"
                        >
                          <Icon class="h-4 w-4" name="PauseCircle" />
                          未激活 (
                          {{ key.activationDays || (key.activationUnit === 'hours' ? 24 : 30)
                          }}{{ key.activationUnit === 'hours' ? '小时' : '天' }})
                        </span>
                        <!-- 已设置过期时间 -->
                        <span v-else-if="key.expiresAt">
                          <span
                            v-if="isApiKeyExpired(key.expiresAt)"
                            class="inline-flex cursor-pointer items-center gap-1 text-red-600 dark:text-red-400"
                            @click.stop="startEditExpiry(key)"
                          >
                            <Icon class="h-4 w-4" name="AlertCircle" />
                            已过期
                          </span>
                          <span
                            v-else-if="isApiKeyExpiringSoon(key.expiresAt)"
                            class="inline-flex cursor-pointer items-center gap-1 text-orange-600 dark:text-orange-400"
                            @click.stop="startEditExpiry(key)"
                          >
                            <Icon class="h-4 w-4" name="Clock" />
                            {{ formatExpireDate(key.expiresAt) }}
                          </span>
                          <span
                            v-else
                            class="cursor-pointer text-gray-600 dark:text-gray-400"
                            @click.stop="startEditExpiry(key)"
                          >
                            {{ formatExpireDate(key.expiresAt) }}
                          </span>
                        </span>
                        <!-- 永不过期 -->
                        <span
                          v-else
                          class="inline-flex cursor-pointer items-center gap-1 text-gray-600 dark:text-gray-400"
                          @click.stop="startEditExpiry(key)"
                        >
                          <Icon class="h-4 w-4" name="Infinity" />
                          永不过期
                        </span>
                      </div>
                    </td>
                    <!-- 操作列 -->
                    <td class="whitespace-nowrap px-4 py-3">
                      <div class="flex flex-wrap gap-0.5">
                        <button
                          class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                          title="查看详细统计"
                          @click="showUsageDetails(key)"
                        >
                          <Icon class="h-3 w-3" name="LineChart" />
                          <span>详情</span>
                        </button>
                        <button
                          v-if="key && key.id"
                          class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30"
                          title="模型使用分布"
                          @click="toggleApiKeyModelStats(key.id)"
                        >
                          <Icon class="h-3 w-3" name="PieChart" />
                          <span>模型</span>
                        </button>
                        <button
                          class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                          title="编辑"
                          @click="openEditApiKeyModal(key)"
                        >
                          <Icon class="h-3 w-3" name="Edit" />
                          <span>编辑</span>
                        </button>
                        <button
                          v-if="
                            key.expiresAt &&
                            (isApiKeyExpired(key.expiresAt) || isApiKeyExpiringSoon(key.expiresAt))
                          "
                          class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30"
                          title="续期"
                          @click="openRenewApiKeyModal(key)"
                        >
                          <Icon class="h-3 w-3" name="Clock" />
                          <span>续期</span>
                        </button>
                        <button
                          class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors"
                          :class="
                            key.isActive
                              ? 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                              : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30'
                          "
                          :title="key.isActive ? '禁用' : '激活'"
                          @click="toggleApiKeyStatus(key)"
                        >
                          <Icon class="h-3 w-3" :name="key.isActive ? 'Ban' : 'CheckCircle'" />
                          <span>{{ key.isActive ? '禁用' : '激活' }}</span>
                        </button>
                        <button
                          class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                          title="删除"
                          @click="deleteApiKey(key.id)"
                        >
                          <Icon class="h-3 w-3" name="Trash" />
                          <span>删除</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- 模型统计展开区域 -->
                  <tr
                    v-if="key && key.id && expandedApiKeys[key.id]"
                    class="bg-gray-50 dark:bg-gray-800/50"
                  >
                    <td class="px-4 py-4" :colspan="shouldShowCheckboxes ? 13 : 12">
                      <!-- 加载中状态 -->
                      <div
                        v-if="!apiKeyModelStats[key.id]"
                        class="flex flex-col items-center justify-center py-8"
                      >
                        <div
                          class="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400"
                        />
                        <p class="text-sm text-gray-600 dark:text-gray-400">加载模型统计...</p>
                      </div>

                      <!-- 内容区域 -->
                      <div class="space-y-3">
                        <!-- 标题和筛选器 -->
                        <div
                          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <h5
                            class="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white"
                          >
                            <Icon
                              class="h-3.5 w-3.5 text-purple-600 dark:text-purple-400"
                              name="PieChart"
                            />
                            模型使用分布
                          </h5>
                          <div class="flex flex-wrap items-center gap-1.5">
                            <span
                              v-if="apiKeyModelStats[key.id] && apiKeyModelStats[key.id].length > 0"
                              class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                              {{ apiKeyModelStats[key.id].length }} 个模型
                            </span>

                            <!-- 日期筛选器 -->
                            <div class="flex items-center gap-1.5">
                              <!-- 快捷选择 -->
                              <div
                                class="flex gap-0.5 rounded-lg bg-white p-0.5 shadow-sm dark:bg-gray-900"
                              >
                                <button
                                  v-for="option in getApiKeyDateFilter(key.id).presetOptions"
                                  :key="option.value"
                                  class="rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors"
                                  :class="
                                    getApiKeyDateFilter(key.id).preset === option.value &&
                                    getApiKeyDateFilter(key.id).type === 'preset'
                                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                  "
                                  @click="setApiKeyDateFilterPreset(option.value, key.id)"
                                >
                                  {{ option.label }}
                                </button>
                              </div>

                              <!-- 自定义日期范围 -->
                              <el-date-picker
                                class="api-key-date-picker"
                                :clearable="true"
                                :default-time="defaultTime"
                                :disabled-date="disabledDate"
                                end-placeholder="结束日期"
                                format="YYYY-MM-DD HH:mm:ss"
                                :model-value="getApiKeyDateFilter(key.id).customRange"
                                range-separator="至"
                                size="small"
                                start-placeholder="开始日期"
                                type="datetimerange"
                                :unlink-panels="false"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                @update:model-value="
                                  (value) => onApiKeyCustomDateRangeChange(key.id, value)
                                "
                              />
                            </div>
                          </div>
                        </div>

                        <!-- 空数据状态 -->
                        <div
                          v-if="apiKeyModelStats[key.id] && apiKeyModelStats[key.id].length === 0"
                          class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 dark:border-gray-600"
                        >
                          <div
                            class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
                          >
                            <Icon
                              class="h-5 w-5 text-gray-400 dark:text-gray-500"
                              name="LineChart"
                            />
                          </div>
                          <p class="mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                            暂无模型使用数据
                          </p>
                          <p class="mb-3 text-xs text-gray-600 dark:text-gray-400">
                            尝试调整时间范围或点击刷新重新加载数据
                          </p>
                          <button
                            class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            title="重置筛选条件并刷新"
                            @click="resetApiKeyDateFilter(key.id)"
                          >
                            <Icon class="h-3.5 w-3.5" name="RefreshCcw" />
                            <span>刷新</span>
                          </button>
                        </div>
                        <!-- 模型统计卡片 -->
                        <div
                          v-else-if="
                            apiKeyModelStats[key.id] && apiKeyModelStats[key.id].length > 0
                          "
                          class="grid gap-3 sm:grid-cols-2"
                        >
                          <div
                            v-for="stat in apiKeyModelStats[key.id]"
                            :key="stat.model"
                            class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                          >
                            <!-- 卡片头部 -->
                            <div class="mb-2 flex items-start justify-between">
                              <div class="flex-1">
                                <span class="text-xs font-semibold text-gray-900 dark:text-white">
                                  {{ stat.model }}
                                </span>
                                <div class="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                  {{ stat.requests }} 次请求
                                </div>
                              </div>
                            </div>

                            <!-- 统计指标网格 -->
                            <div class="space-y-2">
                              <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="flex items-center gap-1">
                                  <Icon
                                    class="h-3 w-3 text-yellow-600 dark:text-yellow-400"
                                    name="Coins"
                                  />
                                  <span class="text-gray-600 dark:text-gray-400">总Token:</span>
                                  <span class="font-medium text-gray-900 dark:text-white">
                                    {{ formatTokenCount(stat.allTokens) }}
                                  </span>
                                </div>
                                <div class="flex items-center gap-1">
                                  <Icon
                                    class="h-3 w-3 text-green-600 dark:text-green-400"
                                    name="DollarSign"
                                  />
                                  <span class="text-gray-600 dark:text-gray-400">费用:</span>
                                  <span class="font-medium text-gray-900 dark:text-white">
                                    {{ calculateModelCost(stat) }}
                                  </span>
                                </div>
                              </div>

                              <!-- Token明细 -->
                              <div class="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div class="flex items-center gap-0.5">
                                  <Icon
                                    class="h-2.5 w-2.5 text-blue-600 dark:text-blue-400"
                                    name="ArrowDown"
                                  />
                                  <span class="text-gray-600 dark:text-gray-400">输入:</span>
                                  <span class="text-gray-900 dark:text-white">
                                    {{ formatTokenCount(stat.inputTokens) }}
                                  </span>
                                </div>
                                <div class="flex items-center gap-0.5">
                                  <Icon
                                    class="h-2.5 w-2.5 text-purple-600 dark:text-purple-400"
                                    name="ArrowUp"
                                  />
                                  <span class="text-gray-600 dark:text-gray-400">输出:</span>
                                  <span class="text-gray-900 dark:text-white">
                                    {{ formatTokenCount(stat.outputTokens) }}
                                  </span>
                                </div>
                                <div
                                  v-if="stat.cacheCreateTokens > 0"
                                  class="flex items-center gap-0.5"
                                >
                                  <Icon
                                    class="h-2.5 w-2.5 text-orange-600 dark:text-orange-400"
                                    name="Save"
                                  />
                                  <span class="text-gray-600 dark:text-gray-400">缓存创建:</span>
                                  <span class="text-gray-900 dark:text-white">
                                    {{ formatTokenCount(stat.cacheCreateTokens) }}
                                  </span>
                                </div>
                                <div
                                  v-if="stat.cacheReadTokens > 0"
                                  class="flex items-center gap-0.5"
                                >
                                  <Icon
                                    class="h-2.5 w-2.5 text-cyan-600 dark:text-cyan-400"
                                    name="Download"
                                  />
                                  <span class="text-gray-600 dark:text-gray-400">缓存读取:</span>
                                  <span class="text-gray-900 dark:text-white">
                                    {{ formatTokenCount(stat.cacheReadTokens) }}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <!-- 使用百分比进度条 -->
                            <div class="mt-3">
                              <div
                                class="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                              >
                                <div
                                  class="h-full rounded-full bg-primary-600 transition-all dark:bg-primary-400"
                                  :style="{
                                    width: `${calculateApiKeyModelPercentage(stat.allTokens, apiKeyModelStats[key.id])}%`
                                  }"
                                />
                              </div>
                              <div class="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                                {{
                                  calculateApiKeyModelPercentage(
                                    stat.allTokens,
                                    apiKeyModelStats[key.id]
                                  )
                                }}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- 总计统计 -->
                        <div
                          v-if="apiKeyModelStats[key.id] && apiKeyModelStats[key.id].length > 0"
                          class="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20"
                        >
                          <div
                            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span
                              class="flex items-center gap-2 text-sm font-semibold text-primary-900 dark:text-primary-100"
                            >
                              <Icon class="h-4 w-4" name="Calculator" />
                              总计统计
                            </span>
                            <div class="flex flex-wrap gap-4 text-sm">
                              <span class="flex items-center gap-1">
                                <span class="text-primary-700 dark:text-primary-300">总请求:</span>
                                <span class="font-semibold text-primary-900 dark:text-primary-100">
                                  {{
                                    apiKeyModelStats[key.id].reduce(
                                      (sum, stat) => sum + stat.requests,
                                      0
                                    )
                                  }}
                                </span>
                              </span>
                              <span class="flex items-center gap-1">
                                <span class="text-primary-700 dark:text-primary-300">总Token:</span>
                                <span class="font-semibold text-primary-900 dark:text-primary-100">
                                  {{
                                    formatTokenCount(
                                      apiKeyModelStats[key.id].reduce(
                                        (sum, stat) => sum + stat.allTokens,
                                        0
                                      )
                                    )
                                  }}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 移动端卡片视图 -->
        <div v-if="!apiKeysLoading && sortedApiKeys.length > 0" class="space-y-4 lg:hidden">
          <div
            v-for="key in paginatedApiKeys"
            :key="key.id"
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <!-- 卡片头部 -->
            <div
              class="mb-3 flex items-start justify-between border-b border-gray-200 pb-3 dark:border-gray-700"
            >
              <div class="flex items-start gap-3">
                <input
                  v-if="shouldShowCheckboxes"
                  v-model="selectedApiKeys"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  type="checkbox"
                  :value="key.id"
                  @change="updateSelectAllState"
                />
                <div>
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ key.name }}
                  </h4>
                  <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {{ key.id }}
                  </p>
                </div>
              </div>
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="
                  key.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                "
              >
                <div
                  class="h-1.5 w-1.5 rounded-full"
                  :class="key.isActive ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400'"
                />
                {{ key.isActive ? '活跃' : '已停用' }}
              </span>
            </div>

            <!-- 账户绑定信息 -->
            <div class="mb-3 flex flex-wrap gap-2 text-xs">
              <!-- Claude 绑定 -->
              <div
                v-if="key.claudeAccountId || key.claudeConsoleAccountId"
                class="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              >
                <Icon class="h-3 w-3" name="Brain" />
                <span>Claude: {{ getClaudeBindingInfo(key) }}</span>
              </div>
              <!-- Gemini 绑定 -->
              <div
                v-if="key.geminiAccountId"
                class="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                <Icon class="h-3 w-3" name="Bot" />
                <span>Gemini: {{ getGeminiBindingInfo(key) }}</span>
              </div>
              <!-- OpenAI 绑定 -->
              <div
                v-if="key.openaiAccountId"
                class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                <Icon class="h-3 w-3" name="Sparkles" />
                <span>OpenAI: {{ getOpenAIBindingInfo(key) }}</span>
              </div>
              <!-- Bedrock 绑定 -->
              <div
                v-if="key.bedrockAccountId"
                class="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              >
                <Icon class="h-3 w-3" name="Cloud" />
                <span>Bedrock: {{ getBedrockBindingInfo(key) }}</span>
              </div>
              <!-- Droid 绑定 -->
              <div
                v-if="key.droidAccountId"
                class="flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-1 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
              >
                <Icon class="h-3 w-3" name="Bot" />
                <span>Droid: {{ getDroidBindingInfo(key) }}</span>
              </div>
              <!-- 无绑定时显示共享池 -->
              <div
                v-if="
                  !key.claudeAccountId &&
                  !key.claudeConsoleAccountId &&
                  !key.geminiAccountId &&
                  !key.openaiAccountId &&
                  !key.bedrockAccountId &&
                  !key.droidAccountId
                "
                class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                <Icon class="h-3 w-3" name="Share2" />
                <span>使用共享池</span>
              </div>
              <!-- 显示所有者信息 -->
              <div
                v-if="isLdapEnabled && key.ownerDisplayName"
                class="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              >
                <Icon class="h-3 w-3" name="User" />
                <span>{{ key.ownerDisplayName }}</span>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="mb-3 space-y-3">
              <!-- 今日使用 -->
              <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {{ globalDateFilter.type === 'custom' ? '累计统计' : '今日使用' }}
                  </span>
                  <button
                    class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30"
                    @click="showUsageDetails(key)"
                  >
                    <Icon class="h-3 w-3" name="LineChart" />
                    详情
                  </button>
                </div>
                <div class="mb-2 grid grid-cols-2 gap-3">
                  <div class="text-center">
                    <p class="text-lg font-bold text-gray-900 dark:text-white">
                      {{ formatNumber(key.usage?.daily?.requests || 0) }} 次
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">请求</p>
                  </div>
                  <div class="text-center">
                    <p class="text-lg font-bold text-green-600 dark:text-green-400">
                      ${{ (key.dailyCost || 0).toFixed(2) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">费用</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-500 dark:text-gray-400">最后使用</span>
                    <span class="font-medium text-gray-700 dark:text-gray-300">
                      {{ key.lastUsedAt ? formatLastUsed(key.lastUsedAt) : '从未使用' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500 dark:text-gray-400">账号</span>
                    <span
                      v-if="hasLastUsageAccount(key)"
                      class="font-medium text-gray-700 dark:text-gray-300"
                      :title="getLastUsageFullName(key)"
                    >
                      {{ getLastUsageDisplayName(key) }}
                      <span v-if="!isLastUsageDeleted(key)" class="text-gray-500">
                        ({{ getLastUsageTypeLabel(key) }})
                      </span>
                    </span>
                    <span v-else class="text-gray-500">暂无使用账号</span>
                  </div>
                </div>
              </div>

              <!-- 限制进度条 -->
              <div class="space-y-2">
                <!-- 每日费用限制 -->
                <LimitProgressBar
                  v-if="key.dailyCostLimit > 0"
                  :current="key.dailyCost || 0"
                  label="每日限制"
                  :limit="key.dailyCostLimit"
                  type="daily"
                  variant="compact"
                />

                <!-- 总费用限制（无每日限制时展示） -->
                <LimitProgressBar
                  v-else-if="key.totalCostLimit > 0"
                  :current="key.usage?.total?.cost || 0"
                  label="总费用限制"
                  :limit="key.totalCostLimit"
                  type="total"
                  variant="compact"
                />

                <!-- 时间窗口费用限制（无每日和总费用限制时展示） -->
                <div
                  v-else-if="
                    key.rateLimitWindow > 0 &&
                    key.rateLimitCost > 0 &&
                    (!key.dailyCostLimit || key.dailyCostLimit === 0) &&
                    (!key.totalCostLimit || key.totalCostLimit === 0)
                  "
                  class="space-y-2"
                >
                  <!-- 费用进度条 -->
                  <LimitProgressBar
                    :current="key.currentWindowCost || 0"
                    label="窗口费用"
                    :limit="key.rateLimitCost"
                    type="window"
                    variant="compact"
                  />
                  <!-- 重置倒计时 -->
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Icon class="h-3 w-3" name="Clock" />
                      <span>{{ key.rateLimitWindow }}分钟窗口</span>
                    </div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">
                      {{
                        key.windowRemainingSeconds > 0
                          ? formatWindowTime(key.windowRemainingSeconds)
                          : '未激活'
                      }}
                    </span>
                  </div>
                </div>

                <!-- 无限制显示 -->
                <div
                  v-else
                  class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                >
                  <Icon class="h-3 w-3" name="Infinity" />
                  <span>无限制</span>
                </div>
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="mb-3 grid grid-cols-2 gap-3 text-xs">
              <div class="flex flex-col gap-1">
                <span class="text-gray-500 dark:text-gray-400">创建时间</span>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{
                  formatDate(key.createdAt)
                }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-gray-500 dark:text-gray-400">过期时间</span>
                <div class="flex items-center gap-1.5">
                  <span
                    class="font-medium"
                    :class="
                      key.expiresAt && isApiKeyExpired(key.expiresAt)
                        ? 'text-red-600 dark:text-red-400'
                        : key.expiresAt && isApiKeyExpiringSoon(key.expiresAt)
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-700 dark:text-gray-300'
                    "
                  >
                    {{ key.expiresAt ? formatDate(key.expiresAt) : '永不过期' }}
                  </span>
                  <button
                    class="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="编辑过期时间"
                    @click.stop="startEditExpiry(key)"
                  >
                    <Icon class="h-3 w-3" name="Pencil" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="key.tags && key.tags.length > 0" class="mb-3 flex flex-wrap gap-1.5">
              <span
                v-for="tag in key.tags"
                :key="tag"
                class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-wrap gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
              <button
                class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="showUsageDetails(key)"
              >
                <Icon class="h-3.5 w-3.5" name="LineChart" />
                详情
              </button>
              <button
                class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="openEditApiKeyModal(key)"
              >
                <Icon class="h-3.5 w-3.5" name="Edit" />
                编辑
              </button>
              <button
                v-if="
                  key.expiresAt &&
                  (isApiKeyExpired(key.expiresAt) || isApiKeyExpiringSoon(key.expiresAt))
                "
                class="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                @click="openRenewApiKeyModal(key)"
              >
                <Icon class="h-3.5 w-3.5" name="Clock" />
                续期
              </button>
              <button
                class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                :class="
                  key.isActive
                    ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    : 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                "
                @click="toggleApiKeyStatus(key)"
              >
                <Icon class="h-3.5 w-3.5" :name="key.isActive ? 'Pause' : 'Play'" />
                {{ key.isActive ? '停用' : '激活' }}
              </button>
              <button
                class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                @click="deleteApiKey(key.id)"
              >
                <Icon class="h-3.5 w-3.5" name="Trash" />
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 分页组件 -->
        <div
          v-if="sortedApiKeys.length > 0"
          class="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>共 {{ sortedApiKeys.length }} 条记录</span>
            <div class="flex items-center gap-2">
              <span>每页显示</span>
              <select
                v-model="pageSize"
                class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400"
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
            <!-- 上一页 -->
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <Icon class="h-4 w-4" name="ChevronLeft" />
            </button>

            <!-- 页码 -->
            <div class="flex items-center gap-1">
              <!-- 第一页 -->
              <button
                v-if="shouldShowFirstPage"
                class="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                :class="
                  currentPage === 1
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-400'
                    : ''
                "
                @click="currentPage = 1"
              >
                1
              </button>
              <span v-if="showLeadingEllipsis" class="px-1 text-gray-500 dark:text-gray-400">
                ...
              </span>

              <!-- 中间页码 -->
              <button
                v-for="page in pageNumbers"
                :key="page"
                class="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors"
                :class="
                  currentPage === page
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                "
                @click="currentPage = page"
              >
                {{ page }}
              </button>

              <!-- 最后一页 -->
              <span v-if="showTrailingEllipsis" class="px-1 text-gray-500 dark:text-gray-400">
                ...
              </span>
              <button
                v-if="shouldShowLastPage"
                class="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                :class="
                  currentPage === totalPages
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-400'
                    : ''
                "
                @click="currentPage = totalPages"
              >
                {{ totalPages }}
              </button>
            </div>

            <!-- 下一页 -->
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              :disabled="currentPage === totalPages || totalPages === 0"
              @click="currentPage++"
            >
              <Icon class="h-4 w-4" name="ChevronRight" />
            </button>
          </div>
        </div>
      </div>

      <!-- 已删除 API Keys Tab Panel -->
      <div v-else-if="activeTab === 'deleted'" class="p-6">
        <!-- 加载状态 -->
        <div v-if="deletedApiKeysLoading" class="flex flex-col items-center justify-center py-16">
          <div
            class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400">正在加载已删除的 API Keys...</p>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="deletedApiKeys.length === 0"
          class="flex flex-col items-center justify-center py-16"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <Icon class="h-8 w-8 text-gray-400 dark:text-gray-500" name="Trash" />
          </div>
          <p class="mb-2 text-base font-medium text-gray-900 dark:text-white">
            暂无已删除的 API Keys
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">已删除的 API Keys 会出现在这里</p>
        </div>

        <!-- 已删除的 API Keys 表格 -->
        <div v-else class="space-y-4">
          <!-- 工具栏 -->
          <div class="flex justify-end">
            <button
              v-if="deletedApiKeys.length > 0"
              class="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              @click="clearAllDeletedApiKeys"
            >
              <Icon class="h-4 w-4" name="Trash2" />
              清空所有已删除 ({{ deletedApiKeys.length }})
            </button>
          </div>

          <div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>所属账号</th>
                    <th v-if="isLdapEnabled">创建者</th>
                    <th>创建时间</th>
                    <th>删除者</th>
                    <th>删除时间</th>
                    <th>费用</th>
                    <th>Token</th>
                    <th>请求数</th>
                    <th>最后使用</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="key in deletedApiKeys" :key="key.id">
                    <td>
                      <div>
                        <div>
                          <Icon name="Trash" />
                        </div>
                        <div>
                          <div :title="key.name">
                            {{ key.name }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <!-- 所属账号 -->
                    <td>
                      <div>
                        <!-- Claude OAuth 绑定 -->
                        <div v-if="key.claudeAccountId">
                          <span>
                            <Icon name="Bot" />
                            Claude OAuth
                          </span>
                        </div>
                        <!-- Claude Console 绑定 -->
                        <div v-else-if="key.claudeConsoleAccountId">
                          <span>
                            <Icon name="Terminal" />
                            Claude Console
                          </span>
                        </div>
                        <!-- Gemini 绑定 -->
                        <div v-else-if="key.geminiAccountId">
                          <span>
                            <i />
                            Gemini
                          </span>
                        </div>
                        <!-- 共享池 -->
                        <div v-else>
                          <Icon name="Share2" />
                          共享池
                        </div>
                      </div>
                    </td>
                    <!-- 创建者 -->
                    <td v-if="isLdapEnabled">
                      <div>
                        <span v-if="key.createdBy === 'admin'">
                          <Icon name="ShieldCheck" />
                          管理员
                        </span>
                        <span v-else-if="key.userUsername">
                          <Icon name="User" />
                          {{ key.userUsername }}
                        </span>
                        <span v-else>
                          <Icon name="HelpCircle" />
                          未知
                        </span>
                      </div>
                    </td>
                    <!-- 创建时间 -->
                    <td>
                      {{ formatDate(key.createdAt) }}
                    </td>
                    <!-- 删除者 -->
                    <td>
                      <div>
                        <span v-if="key.deletedByType === 'admin'">
                          <Icon name="ShieldCheck" />
                          {{ key.deletedBy }}
                        </span>
                        <span v-else-if="key.deletedByType === 'user'">
                          <Icon name="User" />
                          {{ key.deletedBy }}
                        </span>
                        <span v-else>
                          <Icon name="Settings" />
                          {{ key.deletedBy }}
                        </span>
                      </div>
                    </td>
                    <!-- 删除时间 -->
                    <td>
                      {{ formatDate(key.deletedAt) }}
                    </td>
                    <!-- 费用 -->
                    <td>
                      <span> ${{ (key.usage?.total?.cost || 0).toFixed(2) }} </span>
                    </td>
                    <!-- Token -->
                    <td>
                      <span>
                        {{ formatTokenCount(key.usage?.total?.tokens || 0) }}
                      </span>
                    </td>
                    <!-- 请求数 -->
                    <td>
                      <div>
                        <span>
                          {{ formatNumber(key.usage?.total?.requests || 0) }}
                        </span>
                        <span>次</span>
                      </div>
                    </td>
                    <!-- 最后使用 -->
                    <td>
                      <div>
                        <span
                          v-if="key.lastUsedAt"
                          :title="new Date(key.lastUsedAt).toLocaleString('zh-CN')"
                        >
                          {{ formatLastUsed(key.lastUsedAt) }}
                        </span>
                        <span v-else>从未使用</span>
                        <span v-if="hasLastUsageAccount(key)" :title="getLastUsageFullName(key)">
                          {{ getLastUsageDisplayName(key) }}
                          <span v-if="!isLastUsageDeleted(key)">
                            ({{ getLastUsageTypeLabel(key) }})
                          </span>
                        </span>
                        <span v-else> 暂无使用账号 </span>
                      </div>
                    </td>
                    <td>
                      <div class="flex flex-wrap gap-1">
                        <button
                          v-if="key.canRestore"
                          class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                          title="恢复 API Key"
                          @click="restoreApiKey(key.id)"
                        >
                          <Icon class="h-3.5 w-3.5" name="RotateCcw" />
                          恢复
                        </button>
                        <button
                          class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                          title="彻底删除 API Key"
                          @click="permanentDeleteApiKey(key.id)"
                        >
                          <Icon class="h-3.5 w-3.5" name="X" />
                          彻底删除
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 模态框组件 -->
    <CreateApiKeyModal
      v-if="showCreateApiKeyModal"
      :accounts="accounts"
      @batch-success="handleBatchCreateSuccess"
      @close="showCreateApiKeyModal = false"
      @success="handleCreateSuccess"
    />

    <EditApiKeyModal
      v-if="showEditApiKeyModal"
      :accounts="accounts"
      :api-key="editingApiKey"
      @close="showEditApiKeyModal = false"
      @success="handleEditSuccess"
    />

    <RenewApiKeyModal
      v-if="showRenewApiKeyModal"
      :api-key="renewingApiKey"
      @close="showRenewApiKeyModal = false"
      @success="handleRenewSuccess"
    />

    <NewApiKeyModal
      v-if="showNewApiKeyModal"
      :api-key="newApiKeyData"
      @close="showNewApiKeyModal = false"
    />

    <BatchApiKeyModal
      v-if="showBatchApiKeyModal"
      :api-keys="batchApiKeyData"
      @close="showBatchApiKeyModal = false"
    />

    <BatchEditApiKeyModal
      v-if="showBatchEditModal"
      :accounts="accounts"
      :selected-keys="selectedApiKeys"
      @close="showBatchEditModal = false"
      @success="handleBatchEditSuccess"
    />

    <!-- 过期时间编辑弹窗 -->
    <ExpiryEditModal
      ref="expiryEditModalRef"
      :api-key="editingExpiryKey || { id: null, expiresAt: null, name: '' }"
      :show="!!editingExpiryKey"
      @close="closeExpiryEdit"
      @save="handleSaveExpiry"
    />

    <!-- 使用详情弹窗 -->
    <UsageDetailModal
      :api-key="selectedApiKeyForDetail || {}"
      :show="showUsageDetailModal"
      @close="showUsageDetailModal = false"
    />
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'
import { useClientsStore } from '@/stores/clients'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx-js-style'
import CreateApiKeyModal from '@/components/apikeys/CreateApiKeyModal.vue'
import EditApiKeyModal from '@/components/apikeys/EditApiKeyModal.vue'
import RenewApiKeyModal from '@/components/apikeys/RenewApiKeyModal.vue'
import NewApiKeyModal from '@/components/apikeys/NewApiKeyModal.vue'
import BatchApiKeyModal from '@/components/apikeys/BatchApiKeyModal.vue'
import BatchEditApiKeyModal from '@/components/apikeys/BatchEditApiKeyModal.vue'
import ExpiryEditModal from '@/components/apikeys/ExpiryEditModal.vue'
import UsageDetailModal from '@/components/apikeys/UsageDetailModal.vue'
import LimitProgressBar from '@/components/apikeys/LimitProgressBar.vue'
import CustomDropdown from '@/components/common/CustomDropdown.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import Icon from '@/components/common/Icon.vue'
import { Card } from '@/ui'

// 响应式数据
const clientsStore = useClientsStore()
const authStore = useAuthStore()
const apiKeys = ref([])

// 获取 LDAP 启用状态
const isLdapEnabled = computed(() => authStore.oemSettings?.ldapEnabled || false)

// 多选相关状态
const selectedApiKeys = ref([])
const selectAllChecked = ref(false)
const isIndeterminate = ref(false)
const showCheckboxes = ref(false)
const apiKeysLoading = ref(false)
const apiKeyStatsTimeRange = ref('today')

// 全局日期筛选器
const globalDateFilter = reactive({
  type: 'preset',
  preset: 'today',
  customStart: '',
  customEnd: '',
  customRange: null
})

// 是否应该显示多选框
const shouldShowCheckboxes = computed(() => {
  return showCheckboxes.value
})

// 切换选择模式
const toggleSelectionMode = () => {
  showCheckboxes.value = !showCheckboxes.value
  // 关闭选择模式时清空已选项
  if (!showCheckboxes.value) {
    selectedApiKeys.value = []
    selectAllChecked.value = false
    isIndeterminate.value = false
  }
}

// 时间范围下拉选项
const timeRangeDropdownOptions = computed(() => [
  { value: 'today', label: '今日', icon: 'CalendarDays' },
  { value: '7days', label: '最近7天', icon: 'CalendarRange' },
  { value: '30days', label: '最近30天', icon: 'Calendar' },
  { value: 'all', label: '全部时间', icon: 'Infinity' },
  { value: 'custom', label: '自定义范围', icon: 'CalendarCheck' }
])

// Tab management
const activeTab = ref('active')
const deletedApiKeys = ref([])
const deletedApiKeysLoading = ref(false)
const apiKeysSortBy = ref('periodCost')
const apiKeysSortOrder = ref('desc')
const expandedApiKeys = ref({})
const apiKeyModelStats = ref({})
const apiKeyDateFilters = ref({})
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])
const accounts = ref({
  claude: [],
  gemini: [],
  openai: [],
  openaiResponses: [], // 添加 OpenAI-Responses 账号列表
  bedrock: [],
  droid: [],
  claudeGroups: [],
  geminiGroups: [],
  openaiGroups: [],
  droidGroups: []
})
const editingExpiryKey = ref(null)
const expiryEditModalRef = ref(null)
const showUsageDetailModal = ref(false)
const selectedApiKeyForDetail = ref(null)

// 标签相关
const selectedTagFilter = ref('')
const availableTags = ref([])

// 搜索相关
const searchKeyword = ref('')
const searchMode = ref('apiKey')
const searchModeOptions = computed(() => [
  { value: 'apiKey', label: '按Key名称', icon: 'Key' },
  { value: 'bindingAccount', label: '按所属账号', icon: 'IdCard' }
])

const tagOptions = computed(() => {
  const options = [{ value: '', label: '所有标签', icon: 'Asterisk' }]
  availableTags.value.forEach((tag) => {
    options.push({ value: tag, label: tag, icon: 'Tag' })
  })
  return options
})

const selectedTagCount = computed(() => {
  if (!selectedTagFilter.value) return 0
  return apiKeys.value.filter((key) => key.tags && key.tags.includes(selectedTagFilter.value))
    .length
})

// 分页相关
const currentPage = ref(1)
// 从 localStorage 读取保存的每页显示条数，默认为 10
const getInitialPageSize = () => {
  const saved = localStorage.getItem('apiKeysPageSize')
  if (saved) {
    const parsedSize = parseInt(saved, 10)
    // 验证保存的值是否在允许的选项中
    if ([10, 20, 50, 100].includes(parsedSize)) {
      return parsedSize
    }
  }
  return 10
}
const pageSize = ref(getInitialPageSize())
const pageSizeOptions = [10, 20, 50, 100]

// 模态框状态
const showCreateApiKeyModal = ref(false)
const showEditApiKeyModal = ref(false)
const showRenewApiKeyModal = ref(false)
const showNewApiKeyModal = ref(false)
const showBatchApiKeyModal = ref(false)
const showBatchEditModal = ref(false)
const editingApiKey = ref(null)
const renewingApiKey = ref(null)
const newApiKeyData = ref(null)
const batchApiKeyData = ref([])

// 提取“所属账号”列直接展示的文本
const getBindingDisplayStrings = (key) => {
  const values = new Set()

  const collect = (...items) => {
    items.forEach((item) => {
      if (typeof item !== 'string') return
      const trimmed = item.trim()
      if (trimmed) {
        values.add(trimmed)
      }
    })
  }

  const sanitize = (text) => {
    if (typeof text !== 'string') return ''
    return text
      .replace(/^⚠️\s*/, '')
      .replace(/^🔒\s*/, '')
      .trim()
  }

  const appendBindingRow = (label, info) => {
    const infoSanitized = sanitize(info)
    collect(label, info, infoSanitized)
    if (infoSanitized) {
      collect(`${label} ${infoSanitized}`)
    }
  }

  if (key.claudeAccountId || key.claudeConsoleAccountId) {
    appendBindingRow('Claude', getClaudeBindingInfo(key))
  }

  if (key.geminiAccountId) {
    appendBindingRow('Gemini', getGeminiBindingInfo(key))
  }

  if (key.openaiAccountId) {
    appendBindingRow('OpenAI', getOpenAIBindingInfo(key))
  }

  if (key.bedrockAccountId) {
    appendBindingRow('Bedrock', getBedrockBindingInfo(key))
  }

  if (key.droidAccountId) {
    appendBindingRow('Droid', getDroidBindingInfo(key))
  }

  if (
    !key.claudeAccountId &&
    !key.claudeConsoleAccountId &&
    !key.geminiAccountId &&
    !key.openaiAccountId &&
    !key.bedrockAccountId &&
    !key.droidAccountId
  ) {
    collect('共享池')
  }

  return Array.from(values)
}

// 计算排序后的API Keys
const sortedApiKeys = computed(() => {
  // 先进行标签筛选
  let filteredKeys = apiKeys.value
  if (selectedTagFilter.value) {
    filteredKeys = apiKeys.value.filter(
      (key) => key.tags && key.tags.includes(selectedTagFilter.value)
    )
  }

  // 然后进行搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    filteredKeys = filteredKeys.filter((key) => {
      if (searchMode.value === 'bindingAccount') {
        const bindings = getBindingDisplayStrings(key)
        if (bindings.length === 0) return false
        return bindings.some((text) => text.toLowerCase().includes(keyword))
      }

      const nameMatch = key.name && key.name.toLowerCase().includes(keyword)
      if (isLdapEnabled.value) {
        const ownerMatch =
          key.ownerDisplayName && key.ownerDisplayName.toLowerCase().includes(keyword)
        return nameMatch || ownerMatch
      }
      return nameMatch
    })
  }

  // 如果没有排序字段，返回筛选后的结果
  if (!apiKeysSortBy.value) return filteredKeys

  // 排序
  const sorted = [...filteredKeys].sort((a, b) => {
    let aVal = a[apiKeysSortBy.value]
    let bVal = b[apiKeysSortBy.value]

    // 处理特殊排序字段
    if (apiKeysSortBy.value === 'status') {
      aVal = a.isActive ? 1 : 0
      bVal = b.isActive ? 1 : 0
    } else if (apiKeysSortBy.value === 'periodRequests') {
      aVal = getPeriodRequests(a)
      bVal = getPeriodRequests(b)
    } else if (apiKeysSortBy.value === 'periodCost') {
      aVal = calculatePeriodCost(a)
      bVal = calculatePeriodCost(b)
    } else if (apiKeysSortBy.value === 'periodTokens') {
      aVal = getPeriodTokens(a)
      bVal = getPeriodTokens(b)
    } else if (apiKeysSortBy.value === 'dailyCost') {
      aVal = a.dailyCost || 0
      bVal = b.dailyCost || 0
    } else if (apiKeysSortBy.value === 'totalCost') {
      aVal = a.totalCost || 0
      bVal = b.totalCost || 0
    } else if (
      apiKeysSortBy.value === 'createdAt' ||
      apiKeysSortBy.value === 'expiresAt' ||
      apiKeysSortBy.value === 'lastUsedAt'
    ) {
      aVal = aVal ? new Date(aVal).getTime() : 0
      bVal = bVal ? new Date(bVal).getTime() : 0
    }

    if (aVal < bVal) return apiKeysSortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return apiKeysSortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return sorted
})

// 计算总页数
const totalPages = computed(() => {
  const total = sortedApiKeys.value.length
  return Math.ceil(total / pageSize.value) || 0
})

// 计算显示的页码数组
const pageNumbers = computed(() => {
  const pages = []
  const current = currentPage.value
  const total = totalPages.value

  if (total <= 7) {
    // 如果总页数小于等于7，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 如果总页数大于7，显示部分页码
    let start = Math.max(1, current - 2)
    let end = Math.min(total, current + 2)

    // 调整起始和结束页码
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

// 获取分页后的数据
const paginatedApiKeys = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedApiKeys.value.slice(start, end)
})

// 加载账户列表
const loadAccounts = async () => {
  try {
    const [
      claudeData,
      claudeConsoleData,
      geminiData,
      openaiData,
      openaiResponsesData,
      bedrockData,
      droidData,
      groupsData
    ] = await Promise.all([
      apiClient.get('/admin/claude-accounts'),
      apiClient.get('/admin/claude-console-accounts'),
      apiClient.get('/admin/gemini-accounts'),
      apiClient.get('/admin/openai-accounts'),
      apiClient.get('/admin/openai-responses-accounts'), // 加载 OpenAI-Responses 账号
      apiClient.get('/admin/bedrock-accounts'),
      apiClient.get('/admin/droid-accounts'),
      apiClient.get('/admin/account-groups')
    ])

    // 合并Claude OAuth账户和Claude Console账户
    const claudeAccounts = []

    if (claudeData.success) {
      claudeData.data?.forEach((account) => {
        claudeAccounts.push({
          ...account,
          platform: 'claude-oauth',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    if (claudeConsoleData.success) {
      claudeConsoleData.data?.forEach((account) => {
        claudeAccounts.push({
          ...account,
          platform: 'claude-console',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    accounts.value.claude = claudeAccounts

    if (geminiData.success) {
      accounts.value.gemini = (geminiData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    if (openaiData.success) {
      accounts.value.openai = (openaiData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    if (openaiResponsesData.success) {
      accounts.value.openaiResponses = (openaiResponsesData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    if (bedrockData.success) {
      accounts.value.bedrock = (bedrockData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    if (droidData.success) {
      accounts.value.droid = (droidData.data || []).map((account) => ({
        ...account,
        platform: 'droid',
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    if (groupsData.success) {
      // 处理分组数据
      const allGroups = groupsData.data || []
      accounts.value.claudeGroups = allGroups.filter((g) => g.platform === 'claude')
      accounts.value.geminiGroups = allGroups.filter((g) => g.platform === 'gemini')
      accounts.value.openaiGroups = allGroups.filter((g) => g.platform === 'openai')
      accounts.value.droidGroups = allGroups.filter((g) => g.platform === 'droid')
    }
  } catch (error) {
    // console.error('加载账户列表失败:', error)
  }
}

// 加载API Keys
const loadApiKeys = async () => {
  apiKeysLoading.value = true
  try {
    // 构建请求参数
    let params = {}
    if (
      globalDateFilter.type === 'custom' &&
      globalDateFilter.customStart &&
      globalDateFilter.customEnd
    ) {
      params.startDate = globalDateFilter.customStart
      params.endDate = globalDateFilter.customEnd
      params.timeRange = 'custom'
    } else if (globalDateFilter.preset === 'all') {
      params.timeRange = 'all'
    } else {
      params.timeRange = globalDateFilter.preset
    }

    const queryString = new URLSearchParams(params).toString()
    const data = await apiClient.get(`/admin/api-keys?${queryString}`)
    if (data.success) {
      apiKeys.value = data.data || []
      // 更新可用标签列表
      const tagsSet = new Set()
      apiKeys.value.forEach((key) => {
        if (key.tags && Array.isArray(key.tags)) {
          key.tags.forEach((tag) => tagsSet.add(tag))
        }
      })
      availableTags.value = Array.from(tagsSet).sort()
    }
  } catch (error) {
    showToast('加载 API Keys 失败', 'error')
  } finally {
    apiKeysLoading.value = false
  }
}

// 加载已删除的API Keys
const loadDeletedApiKeys = async () => {
  activeTab.value = 'deleted'
  deletedApiKeysLoading.value = true
  try {
    const data = await apiClient.get('/admin/api-keys/deleted')
    if (data.success) {
      deletedApiKeys.value = data.apiKeys || []
    }
  } catch (error) {
    showToast('加载已删除的 API Keys 失败', 'error')
  } finally {
    deletedApiKeysLoading.value = false
  }
}

// 排序API Keys
const sortApiKeys = (field) => {
  if (apiKeysSortBy.value === field) {
    apiKeysSortOrder.value = apiKeysSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    apiKeysSortBy.value = field
    apiKeysSortOrder.value = 'asc'
  }
}

// 格式化数字
const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return num.toLocaleString('zh-CN')
}

// 格式化Token数量
const formatTokenCount = (count) => {
  if (!count && count !== 0) return '0'
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

// 获取绑定账户名称
const getBoundAccountName = (accountId) => {
  if (!accountId) return '未知账户'

  // 检查是否是分组
  if (accountId.startsWith('group:')) {
    const groupId = accountId.substring(6) // 移除 'group:' 前缀

    // 从Claude分组中查找
    const claudeGroup = accounts.value.claudeGroups.find((g) => g.id === groupId)
    if (claudeGroup) {
      return `分组-${claudeGroup.name}`
    }

    // 从Gemini分组中查找
    const geminiGroup = accounts.value.geminiGroups.find((g) => g.id === groupId)
    if (geminiGroup) {
      return `分组-${geminiGroup.name}`
    }

    // 从OpenAI分组中查找
    const openaiGroup = accounts.value.openaiGroups.find((g) => g.id === groupId)
    if (openaiGroup) {
      return `分组-${openaiGroup.name}`
    }

    const droidGroup = accounts.value.droidGroups.find((g) => g.id === groupId)
    if (droidGroup) {
      return `分组-${droidGroup.name}`
    }

    // 如果找不到分组，返回分组ID的前8位
    return `分组-${groupId.substring(0, 8)}`
  }

  // 从Claude账户列表中查找
  const claudeAccount = accounts.value.claude.find((acc) => acc.id === accountId)
  if (claudeAccount) {
    return `${claudeAccount.name}`
  }

  // 从Gemini账户列表中查找
  const geminiAccount = accounts.value.gemini.find((acc) => acc.id === accountId)
  if (geminiAccount) {
    return `${geminiAccount.name}`
  }

  // 处理 responses: 前缀的 OpenAI-Responses 账户
  if (accountId.startsWith('responses:')) {
    const realAccountId = accountId.replace('responses:', '')
    const openaiResponsesAccount = accounts.value.openaiResponses.find(
      (acc) => acc.id === realAccountId
    )
    if (openaiResponsesAccount) {
      return `${openaiResponsesAccount.name}`
    }
    // 如果找不到，返回ID的前8位
    return `${realAccountId.substring(0, 8)}`
  }

  // 从OpenAI账户列表中查找
  const openaiAccount = accounts.value.openai.find((acc) => acc.id === accountId)
  if (openaiAccount) {
    return `${openaiAccount.name}`
  }

  // 从 OpenAI-Responses 账户列表中查找（兼容没有前缀的情况）
  const openaiResponsesAccount = accounts.value.openaiResponses.find((acc) => acc.id === accountId)
  if (openaiResponsesAccount) {
    return `${openaiResponsesAccount.name}`
  }

  // 从Bedrock账户列表中查找
  const bedrockAccount = accounts.value.bedrock.find((acc) => acc.id === accountId)
  if (bedrockAccount) {
    return `${bedrockAccount.name}`
  }

  const droidAccount = accounts.value.droid.find((acc) => acc.id === accountId)
  if (droidAccount) {
    return `${droidAccount.name}`
  }

  // 如果找不到，返回账户ID的前8位
  return `${accountId.substring(0, 8)}`
}

// 获取Claude绑定信息
const getClaudeBindingInfo = (key) => {
  if (key.claudeAccountId) {
    const info = getBoundAccountName(key.claudeAccountId)
    if (key.claudeAccountId.startsWith('group:')) {
      return info
    }
    // 检查账户是否存在
    const account = accounts.value.claude.find((acc) => acc.id === key.claudeAccountId)
    if (!account) {
      return `⚠️ ${info} (账户不存在)`
    }
    if (account.accountType === 'dedicated') {
      return `🔒 专属-${info}`
    }
    return info
  }
  if (key.claudeConsoleAccountId) {
    const account = accounts.value.claude.find(
      (acc) => acc.id === key.claudeConsoleAccountId && acc.platform === 'claude-console'
    )
    if (!account) {
      return `⚠️ Console账户不存在`
    }
    return `Console-${account.name}`
  }
  return ''
}

// 获取Gemini绑定信息
const getGeminiBindingInfo = (key) => {
  if (key.geminiAccountId) {
    const info = getBoundAccountName(key.geminiAccountId)
    if (key.geminiAccountId.startsWith('group:')) {
      return info
    }
    // 检查账户是否存在
    const account = accounts.value.gemini.find((acc) => acc.id === key.geminiAccountId)
    if (!account) {
      return `⚠️ ${info} (账户不存在)`
    }
    if (account.accountType === 'dedicated') {
      return `🔒 专属-${info}`
    }
    return info
  }
  return ''
}

// 获取OpenAI绑定信息
const getOpenAIBindingInfo = (key) => {
  if (key.openaiAccountId) {
    const info = getBoundAccountName(key.openaiAccountId)
    if (key.openaiAccountId.startsWith('group:')) {
      return info
    }

    // 处理 responses: 前缀的 OpenAI-Responses 账户
    let account = null
    if (key.openaiAccountId.startsWith('responses:')) {
      const realAccountId = key.openaiAccountId.replace('responses:', '')
      account = accounts.value.openaiResponses.find((acc) => acc.id === realAccountId)
    } else {
      // 查找普通 OpenAI 账户
      account = accounts.value.openai.find((acc) => acc.id === key.openaiAccountId)
    }

    if (!account) {
      return `⚠️ ${info} (账户不存在)`
    }
    if (account.accountType === 'dedicated') {
      return `🔒 专属-${info}`
    }
    return info
  }
  return ''
}

// 获取Bedrock绑定信息
const getBedrockBindingInfo = (key) => {
  if (key.bedrockAccountId) {
    const info = getBoundAccountName(key.bedrockAccountId)
    if (key.bedrockAccountId.startsWith('group:')) {
      return info
    }
    // 检查账户是否存在
    const account = accounts.value.bedrock.find((acc) => acc.id === key.bedrockAccountId)
    if (!account) {
      return `⚠️ ${info} (账户不存在)`
    }
    if (account.accountType === 'dedicated') {
      return `🔒 专属-${info}`
    }
    return info
  }
  return ''
}

const getDroidBindingInfo = (key) => {
  if (key.droidAccountId) {
    const info = getBoundAccountName(key.droidAccountId)
    if (key.droidAccountId.startsWith('group:')) {
      return info
    }
    const account = accounts.value.droid.find((acc) => acc.id === key.droidAccountId)
    if (!account) {
      return `⚠️ ${info} (账户不存在)`
    }
    if (account.accountType === 'dedicated') {
      return `🔒 专属-${info}`
    }
    return info
  }
  return ''
}

// 检查API Key是否过期
const isApiKeyExpired = (expiresAt) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

// 检查API Key是否即将过期
const isApiKeyExpiringSoon = (expiresAt) => {
  if (!expiresAt || isApiKeyExpired(expiresAt)) return false
  const daysUntilExpiry = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  return daysUntilExpiry <= 7
}

// 格式化过期日期
const formatExpireDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 切换模型统计展开状态
const toggleApiKeyModelStats = async (keyId) => {
  if (!expandedApiKeys.value[keyId]) {
    expandedApiKeys.value[keyId] = true
    // 初始化日期筛选器
    if (!apiKeyDateFilters.value[keyId]) {
      initApiKeyDateFilter(keyId)
    }
    // 加载模型统计数据
    await loadApiKeyModelStats(keyId, true)
  } else {
    expandedApiKeys.value[keyId] = false
  }
}

// 加载 API Key 的模型统计
const loadApiKeyModelStats = async (keyId, forceReload = false) => {
  if (!forceReload && apiKeyModelStats.value[keyId] && apiKeyModelStats.value[keyId].length > 0) {
    return
  }

  const filter = getApiKeyDateFilter(keyId)

  try {
    let url = `/admin/api-keys/${keyId}/model-stats`
    const params = new URLSearchParams()

    if (filter.customStart && filter.customEnd) {
      params.append('startDate', filter.customStart)
      params.append('endDate', filter.customEnd)
      params.append('period', 'custom')
    } else {
      const period =
        filter.preset === 'today' ? 'daily' : filter.preset === '7days' ? 'daily' : 'monthly'
      params.append('period', period)
    }

    url += '?' + params.toString()

    const data = await apiClient.get(url)
    if (data.success) {
      apiKeyModelStats.value[keyId] = data.data || []
    }
  } catch (error) {
    showToast('加载模型统计失败', 'error')
    apiKeyModelStats.value[keyId] = []
  }
}

// 计算API Key模型使用百分比
const calculateApiKeyModelPercentage = (value, stats) => {
  const total = stats.reduce((sum, stat) => sum + (stat.allTokens || 0), 0)
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// 计算单个模型费用
const calculateModelCost = (stat) => {
  // 优先使用后端返回的费用数据
  if (stat.formatted && stat.formatted.total) {
    return stat.formatted.total
  }

  // 如果没有 formatted 数据，尝试使用 cost 字段
  if (stat.cost !== undefined) {
    return `$${stat.cost.toFixed(6)}`
  }

  // 默认返回
  return '$0.000000'
}

// 获取日期范围内的请求数
const getPeriodRequests = (key) => {
  // 根据全局日期筛选器返回对应的请求数
  if (globalDateFilter.type === 'custom') {
    // 自定义日期范围
    if (key.usage) {
      if (key.usage['custom'] && key.usage['custom'].requests !== undefined) {
        return key.usage['custom'].requests
      }
      if (key.usage.total && key.usage.total.requests !== undefined) {
        return key.usage.total.requests
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'today') {
    return key.usage?.daily?.requests || 0
  } else if (globalDateFilter.preset === '7days') {
    // 使用 usage['7days'].requests
    if (key.usage && key.usage['7days'] && key.usage['7days'].requests !== undefined) {
      return key.usage['7days'].requests
    }
    return 0
  } else if (globalDateFilter.preset === '30days') {
    // 使用 usage['30days'].requests
    if (key.usage) {
      if (key.usage['30days'] && key.usage['30days'].requests !== undefined) {
        return key.usage['30days'].requests
      }
      if (key.usage.monthly && key.usage.monthly.requests !== undefined) {
        return key.usage.monthly.requests
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'all') {
    // 全部时间
    if (key.usage && key.usage['all'] && key.usage['all'].requests !== undefined) {
      return key.usage['all'].requests
    }
    return key.usage?.total?.requests || 0
  } else {
    // 默认返回
    return key.usage?.total?.requests || 0
  }
}

// 获取日期范围内的费用
const getPeriodCost = (key) => {
  // 根据全局日期筛选器返回对应的费用
  if (globalDateFilter.type === 'custom') {
    // 自定义日期范围，使用服务器返回的 usage['custom'].cost
    if (key.usage) {
      if (key.usage['custom'] && key.usage['custom'].cost !== undefined) {
        return key.usage['custom'].cost
      }
      if (key.usage.total && key.usage.total.cost !== undefined) {
        return key.usage.total.cost
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'today') {
    return key.dailyCost || 0
  } else if (globalDateFilter.preset === '7days') {
    // 使用 usage['7days'].cost
    if (key.usage && key.usage['7days'] && key.usage['7days'].cost !== undefined) {
      return key.usage['7days'].cost
    }
    return key.weeklyCost || key.periodCost || 0
  } else if (globalDateFilter.preset === '30days') {
    // 使用 usage['30days'].cost 或 usage.monthly.cost
    if (key.usage) {
      if (key.usage['30days'] && key.usage['30days'].cost !== undefined) {
        return key.usage['30days'].cost
      }
      if (key.usage.monthly && key.usage.monthly.cost !== undefined) {
        return key.usage.monthly.cost
      }
      if (key.usage.total && key.usage.total.cost !== undefined) {
        return key.usage.total.cost
      }
    }
    return key.monthlyCost || key.periodCost || 0
  } else if (globalDateFilter.preset === 'all') {
    // 全部时间，返回 usage['all'].cost 或 totalCost
    if (key.usage && key.usage['all'] && key.usage['all'].cost !== undefined) {
      return key.usage['all'].cost
    }
    return key.totalCost || 0
  } else {
    // 默认返回 usage.total.cost
    return key.periodCost || key.totalCost || 0
  }
}

// 获取日期范围内的token数量
const getPeriodTokens = (key) => {
  // 根据全局日期筛选器返回对应的token数量
  if (globalDateFilter.type === 'custom') {
    // 自定义日期范围
    if (key.usage) {
      if (key.usage['custom'] && key.usage['custom'].tokens !== undefined) {
        return key.usage['custom'].tokens
      }
      if (key.usage.total && key.usage.total.tokens !== undefined) {
        return key.usage.total.tokens
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'today') {
    return key.usage?.daily?.tokens || 0
  } else if (globalDateFilter.preset === '7days') {
    // 使用 usage['7days'].tokens
    if (key.usage && key.usage['7days'] && key.usage['7days'].tokens !== undefined) {
      return key.usage['7days'].tokens
    }
    return 0
  } else if (globalDateFilter.preset === '30days') {
    // 使用 usage['30days'].tokens 或 usage.monthly.tokens
    if (key.usage) {
      if (key.usage['30days'] && key.usage['30days'].tokens !== undefined) {
        return key.usage['30days'].tokens
      }
      if (key.usage.monthly && key.usage.monthly.tokens !== undefined) {
        return key.usage.monthly.tokens
      }
      if (key.usage.total && key.usage.total.tokens !== undefined) {
        return key.usage.total.tokens
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'all') {
    // 全部时间
    if (key.usage && key.usage['all'] && key.usage['all'].tokens !== undefined) {
      return key.usage['all'].tokens
    }
    return key.usage?.total?.tokens || 0
  } else {
    // 默认返回
    return key.usage?.total?.tokens || 0
  }
}

// 获取日期范围内的输入token数量
const getPeriodInputTokens = (key) => {
  // 根据全局日期筛选器返回对应的输入token数量
  if (globalDateFilter.type === 'custom') {
    // 自定义日期范围
    if (key.usage) {
      if (key.usage['custom'] && key.usage['custom'].inputTokens !== undefined) {
        return key.usage['custom'].inputTokens
      }
      if (key.usage.total && key.usage.total.inputTokens !== undefined) {
        return key.usage.total.inputTokens
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'today') {
    return key.usage?.daily?.inputTokens || 0
  } else if (globalDateFilter.preset === '7days') {
    // 使用 usage['7days'].inputTokens
    if (key.usage && key.usage['7days'] && key.usage['7days'].inputTokens !== undefined) {
      return key.usage['7days'].inputTokens
    }
    return 0
  } else if (globalDateFilter.preset === '30days') {
    // 使用 usage['30days'].inputTokens 或 usage.monthly.inputTokens
    if (key.usage) {
      if (key.usage['30days'] && key.usage['30days'].inputTokens !== undefined) {
        return key.usage['30days'].inputTokens
      }
      if (key.usage.monthly && key.usage.monthly.inputTokens !== undefined) {
        return key.usage.monthly.inputTokens
      }
      if (key.usage.total && key.usage.total.inputTokens !== undefined) {
        return key.usage.total.inputTokens
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'all') {
    // 全部时间
    if (key.usage && key.usage['all'] && key.usage['all'].inputTokens !== undefined) {
      return key.usage['all'].inputTokens
    }
    return key.usage?.total?.inputTokens || 0
  } else {
    // 默认返回
    return key.usage?.total?.inputTokens || 0
  }
}

// 获取日期范围内的输出token数量
const getPeriodOutputTokens = (key) => {
  // 根据全局日期筛选器返回对应的输出token数量
  if (globalDateFilter.type === 'custom') {
    // 自定义日期范围
    if (key.usage) {
      if (key.usage['custom'] && key.usage['custom'].outputTokens !== undefined) {
        return key.usage['custom'].outputTokens
      }
      if (key.usage.total && key.usage.total.outputTokens !== undefined) {
        return key.usage.total.outputTokens
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'today') {
    return key.usage?.daily?.outputTokens || 0
  } else if (globalDateFilter.preset === '7days') {
    // 使用 usage['7days'].outputTokens
    if (key.usage && key.usage['7days'] && key.usage['7days'].outputTokens !== undefined) {
      return key.usage['7days'].outputTokens
    }
    return 0
  } else if (globalDateFilter.preset === '30days') {
    // 使用 usage['30days'].outputTokens 或 usage.monthly.outputTokens
    if (key.usage) {
      if (key.usage['30days'] && key.usage['30days'].outputTokens !== undefined) {
        return key.usage['30days'].outputTokens
      }
      if (key.usage.monthly && key.usage.monthly.outputTokens !== undefined) {
        return key.usage.monthly.outputTokens
      }
      if (key.usage.total && key.usage.total.outputTokens !== undefined) {
        return key.usage.total.outputTokens
      }
    }
    return 0
  } else if (globalDateFilter.preset === 'all') {
    // 全部时间
    if (key.usage && key.usage['all'] && key.usage['all'].outputTokens !== undefined) {
      return key.usage['all'].outputTokens
    }
    return key.usage?.total?.outputTokens || 0
  } else {
    // 默认返回
    return key.usage?.total?.outputTokens || 0
  }
}

// 计算日期范围内的总费用（用于展开的详细统计）
const calculatePeriodCost = (key) => {
  // 如果没有展开，使用缓存的费用数据
  if (!apiKeyModelStats.value[key.id]) {
    return getPeriodCost(key)
  }

  // 计算所有模型的费用总和
  const stats = apiKeyModelStats.value[key.id] || []
  let totalCost = 0

  stats.forEach((stat) => {
    if (stat.cost !== undefined) {
      totalCost += stat.cost
    } else if (stat.formatted && stat.formatted.total) {
      // 尝试从格式化的字符串中提取数字
      const costStr = stat.formatted.total.replace('$', '').replace(',', '')
      const cost = parseFloat(costStr)
      if (!isNaN(cost)) {
        totalCost += cost
      }
    }
  })

  return totalCost
}

// 处理时间范围下拉框变化
const handleTimeRangeChange = (value) => {
  setGlobalDateFilterPreset(value)
}

// 设置全局日期预设
const setGlobalDateFilterPreset = (preset) => {
  globalDateFilter.preset = preset

  if (preset === 'custom') {
    // 自定义选项，不自动设置日期，等待用户选择
    globalDateFilter.type = 'custom'
    // 如果没有自定义范围，设置默认为最近7天
    if (!globalDateFilter.customRange) {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 6)

      const formatDate = (date) => {
        return (
          date.getFullYear() +
          '-' +
          String(date.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(date.getDate()).padStart(2, '0') +
          ' 00:00:00'
        )
      }

      globalDateFilter.customRange = [formatDate(startDate), formatDate(today)]
      globalDateFilter.customStart = startDate.toISOString().split('T')[0]
      globalDateFilter.customEnd = today.toISOString().split('T')[0]
    }
  } else if (preset === 'all') {
    // 全部时间选项
    globalDateFilter.type = 'preset'
    globalDateFilter.customStart = null
    globalDateFilter.customEnd = null
  } else {
    // 预设选项（今日、7天或30天）
    globalDateFilter.type = 'preset'
    const today = new Date()
    const startDate = new Date(today)

    if (preset === 'today') {
      // 今日：从今天开始到今天结束
      startDate.setHours(0, 0, 0, 0)
    } else if (preset === '7days') {
      startDate.setDate(today.getDate() - 6)
    } else if (preset === '30days') {
      startDate.setDate(today.getDate() - 29)
    }

    globalDateFilter.customStart = startDate.toISOString().split('T')[0]
    globalDateFilter.customEnd = today.toISOString().split('T')[0]
  }

  loadApiKeys()
}

// 全局自定义日期范围变化
const onGlobalCustomDateRangeChange = (value) => {
  if (value && value.length === 2) {
    globalDateFilter.type = 'custom'
    globalDateFilter.preset = 'custom'
    globalDateFilter.customRange = value
    globalDateFilter.customStart = value[0].split(' ')[0]
    globalDateFilter.customEnd = value[1].split(' ')[0]
    loadApiKeys()
  } else if (value === null) {
    // 清空时恢复默认今日
    setGlobalDateFilterPreset('today')
  }
}

// 初始化API Key的日期筛选器
const initApiKeyDateFilter = (keyId) => {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setHours(0, 0, 0, 0) // 今日从0点开始

  apiKeyDateFilters.value[keyId] = {
    type: 'preset',
    preset: 'today',
    customStart: today.toISOString().split('T')[0],
    customEnd: today.toISOString().split('T')[0],
    customRange: null,
    presetOptions: [
      { value: 'today', label: '今日', days: 1 },
      { value: '7days', label: '7天', days: 7 },
      { value: '30days', label: '30天', days: 30 },
      { value: 'custom', label: '自定义', days: -1 }
    ]
  }
}

// 获取API Key的日期筛选器状态
const getApiKeyDateFilter = (keyId) => {
  if (!apiKeyDateFilters.value[keyId]) {
    initApiKeyDateFilter(keyId)
  }
  return apiKeyDateFilters.value[keyId]
}

// 设置 API Key 日期预设
const setApiKeyDateFilterPreset = (preset, keyId) => {
  const filter = getApiKeyDateFilter(keyId)
  filter.type = 'preset'
  filter.preset = preset

  const option = filter.presetOptions.find((opt) => opt.value === preset)
  if (option) {
    if (preset === 'custom') {
      // 自定义选项，不自动设置日期，等待用户选择
      filter.type = 'custom'
      // 如果没有自定义范围，设置默认为最近7天
      if (!filter.customRange) {
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 6)

        const formatDate = (date) => {
          return (
            date.getFullYear() +
            '-' +
            String(date.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getDate()).padStart(2, '0') +
            ' 00:00:00'
          )
        }

        filter.customRange = [formatDate(startDate), formatDate(today)]
        filter.customStart = startDate.toISOString().split('T')[0]
        filter.customEnd = today.toISOString().split('T')[0]
      }
    } else {
      // 预设选项
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - (option.days - 1))

      filter.customStart = startDate.toISOString().split('T')[0]
      filter.customEnd = today.toISOString().split('T')[0]

      const formatDate = (date) => {
        return (
          date.getFullYear() +
          '-' +
          String(date.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(date.getDate()).padStart(2, '0') +
          ' 00:00:00'
        )
      }

      filter.customRange = [formatDate(startDate), formatDate(today)]
    }
  }

  loadApiKeyModelStats(keyId, true)
}

// API Key 自定义日期范围变化
const onApiKeyCustomDateRangeChange = (keyId, value) => {
  const filter = getApiKeyDateFilter(keyId)

  if (value && value.length === 2) {
    filter.type = 'custom'
    filter.preset = 'custom'
    filter.customRange = value
    filter.customStart = value[0].split(' ')[0]
    filter.customEnd = value[1].split(' ')[0]

    loadApiKeyModelStats(keyId, true)
  } else if (value === null) {
    // 清空时恢复默认7天
    setApiKeyDateFilterPreset('7days', keyId)
  }
}

// 禁用未来日期
const disabledDate = (date) => {
  return date > new Date()
}

// 重置API Key日期筛选器
const resetApiKeyDateFilter = (keyId) => {
  const filter = getApiKeyDateFilter(keyId)

  // 重置为默认的今日
  filter.type = 'preset'
  filter.preset = 'today'

  const today = new Date()
  const startDate = new Date(today)
  startDate.setHours(0, 0, 0, 0) // 今日从0点开始

  filter.customStart = today.toISOString().split('T')[0]
  filter.customEnd = today.toISOString().split('T')[0]
  filter.customRange = null

  // 重新加载数据
  loadApiKeyModelStats(keyId, true)
  showToast('已重置筛选条件并刷新数据', 'info')
}

// 打开创建模态框
const openCreateApiKeyModal = async () => {
  // 重新加载账号数据，确保显示最新的专属账号
  await loadAccounts()
  showCreateApiKeyModal.value = true
}

// 打开编辑模态框
const openEditApiKeyModal = async (apiKey) => {
  // 重新加载账号数据，确保显示最新的专属账号
  await loadAccounts()
  editingApiKey.value = apiKey
  showEditApiKeyModal.value = true
}

// 打开续期模态框
const openRenewApiKeyModal = (apiKey) => {
  renewingApiKey.value = apiKey
  showRenewApiKeyModal.value = true
}

// 处理创建成功
const handleCreateSuccess = (data) => {
  showCreateApiKeyModal.value = false
  newApiKeyData.value = data
  showNewApiKeyModal.value = true
  loadApiKeys()
}

// 处理批量创建成功
const handleBatchCreateSuccess = (data) => {
  showCreateApiKeyModal.value = false
  batchApiKeyData.value = data
  showBatchApiKeyModal.value = true
  loadApiKeys()
}

// 打开批量编辑模态框
const openBatchEditModal = async () => {
  if (selectedApiKeys.value.length === 0) {
    showToast('请先选择要编辑的 API Keys', 'warning')
    return
  }

  // 重新加载账号数据，确保显示最新的专属账号
  await loadAccounts()
  showBatchEditModal.value = true
}

// 处理批量编辑成功
const handleBatchEditSuccess = () => {
  showBatchEditModal.value = false
  // 清空选中状态
  selectedApiKeys.value = []
  updateSelectAllState()
  loadApiKeys()
}

// 处理编辑成功
const handleEditSuccess = () => {
  showEditApiKeyModal.value = false
  showToast('API Key 更新成功', 'success')
  loadApiKeys()
}

// 处理续期成功
const handleRenewSuccess = () => {
  showRenewApiKeyModal.value = false
  showToast('API Key 续期成功', 'success')
  loadApiKeys()
}

// 切换API Key状态（激活/禁用）
const toggleApiKeyStatus = async (key) => {
  let confirmed = true

  // 禁用时需要二次确认
  if (key.isActive) {
    if (window.showConfirm) {
      confirmed = await window.showConfirm(
        '禁用 API Key',
        `确定要禁用 API Key "${key.name}" 吗？禁用后所有使用此 Key 的请求将返回 401 错误。`,
        '确定禁用',
        '取消'
      )
    } else {
      // 降级方案
      confirmed = confirm(
        `确定要禁用 API Key "${key.name}" 吗？禁用后所有使用此 Key 的请求将返回 401 错误。`
      )
    }
  }

  if (!confirmed) return

  try {
    const data = await apiClient.put(`/admin/api-keys/${key.id}`, {
      isActive: !key.isActive
    })

    if (data.success) {
      showToast(`API Key 已${key.isActive ? '禁用' : '激活'}`, 'success')
      // 更新本地数据
      const localKey = apiKeys.value.find((k) => k.id === key.id)
      if (localKey) {
        localKey.isActive = !key.isActive
      }
    } else {
      showToast(data.message || '操作失败', 'error')
    }
  } catch (error) {
    showToast('操作失败', 'error')
  }
}

// 更新API Key图标
// 删除API Key
const deleteApiKey = async (keyId) => {
  let confirmed = false

  if (window.showConfirm) {
    confirmed = await window.showConfirm(
      '删除 API Key',
      '确定要删除这个 API Key 吗？此操作不可恢复。',
      '确定删除',
      '取消'
    )
  } else {
    // 降级方案
    confirmed = confirm('确定要删除这个 API Key 吗？此操作不可恢复。')
  }

  if (!confirmed) return

  try {
    const data = await apiClient.delete(`/admin/api-keys/${keyId}`)
    if (data.success) {
      showToast('API Key 已删除', 'success')
      // 从选中列表中移除
      const index = selectedApiKeys.value.indexOf(keyId)
      if (index > -1) {
        selectedApiKeys.value.splice(index, 1)
      }
      updateSelectAllState()
      loadApiKeys()
    } else {
      showToast(data.message || '删除失败', 'error')
    }
  } catch (error) {
    showToast('删除失败', 'error')
  }
}

// 恢复API Key
const restoreApiKey = async (keyId) => {
  console.log('[DEBUG] restoreApiKey called with keyId:', keyId)
  let confirmed = false

  if (window.showConfirm) {
    console.log('[DEBUG] Using window.showConfirm')
    confirmed = await window.showConfirm(
      '恢复 API Key',
      '确定要恢复这个 API Key 吗？恢复后可以重新使用。',
      '确定恢复',
      '取消'
    )
  } else {
    console.log('[DEBUG] Using fallback confirm()')
    // 降级方案
    confirmed = confirm('确定要恢复这个 API Key 吗？恢复后可以重新使用。')
  }

  console.log('[DEBUG] User confirmed:', confirmed)
  if (!confirmed) return

  try {
    console.log('[DEBUG] Calling API:', `/admin/api-keys/${keyId}/restore`)
    const data = await apiClient.post(`/admin/api-keys/${keyId}/restore`)
    console.log('[DEBUG] API response:', data)
    if (data.success) {
      showToast('API Key 已成功恢复', 'success')
      // 刷新已删除列表
      await loadDeletedApiKeys()
      // 同时刷新活跃列表
      await loadApiKeys()
    } else {
      showToast(data.error || '恢复失败', 'error')
    }
  } catch (error) {
    console.error('[DEBUG] API error:', error)
    showToast(error.response?.data?.error || '恢复失败', 'error')
  }
}

// 彻底删除API Key
const permanentDeleteApiKey = async (keyId) => {
  let confirmed = false

  if (window.showConfirm) {
    confirmed = await window.showConfirm(
      '彻底删除 API Key',
      '确定要彻底删除这个 API Key 吗？此操作不可恢复，所有相关数据将被永久删除。',
      '确定彻底删除',
      '取消'
    )
  } else {
    // 降级方案
    confirmed = confirm('确定要彻底删除这个 API Key 吗？此操作不可恢复，所有相关数据将被永久删除。')
  }

  if (!confirmed) return

  try {
    const data = await apiClient.delete(`/admin/api-keys/${keyId}/permanent`)
    if (data.success) {
      showToast('API Key 已彻底删除', 'success')
      // 刷新已删除列表
      loadDeletedApiKeys()
    } else {
      showToast(data.error || '彻底删除失败', 'error')
    }
  } catch (error) {
    showToast(error.response?.data?.error || '彻底删除失败', 'error')
  }
}

// 清空所有已删除的API Keys
const clearAllDeletedApiKeys = async () => {
  const count = deletedApiKeys.value.length
  if (count === 0) {
    showToast('没有需要清空的 API Keys', 'info')
    return
  }

  let confirmed = false

  if (window.showConfirm) {
    confirmed = await window.showConfirm(
      '清空所有已删除的 API Keys',
      `确定要彻底删除全部 ${count} 个已删除的 API Keys 吗？此操作不可恢复，所有相关数据将被永久删除。`,
      '确定清空全部',
      '取消'
    )
  } else {
    // 降级方案
    confirmed = confirm(`确定要彻底删除全部 ${count} 个已删除的 API Keys 吗？此操作不可恢复。`)
  }

  if (!confirmed) return

  try {
    const data = await apiClient.delete('/admin/api-keys/deleted/clear-all')
    if (data.success) {
      showToast(data.message || '已清空所有已删除的 API Keys', 'success')

      // 如果有失败的，显示详细信息
      if (data.details && data.details.failedCount > 0) {
        // const errors = data.details.errors
        // console.error('部分API Keys清空失败:', errors)
        showToast(`${data.details.failedCount} 个清空失败`, 'warning')
      }

      // 刷新已删除列表
      loadDeletedApiKeys()
    } else {
      showToast(data.error || '清空失败', 'error')
    }
  } catch (error) {
    showToast(error.response?.data?.error || '清空失败', 'error')
  }
}

// 批量删除API Keys
const batchDeleteApiKeys = async () => {
  const selectedCount = selectedApiKeys.value.length
  if (selectedCount === 0) {
    showToast('请先选择要删除的 API Keys', 'warning')
    return
  }

  let confirmed = false
  const message = `确定要删除选中的 ${selectedCount} 个 API Key 吗？此操作不可恢复。`

  if (window.showConfirm) {
    confirmed = await window.showConfirm('批量删除 API Keys', message, '确定删除', '取消')
  } else {
    confirmed = confirm(message)
  }

  if (!confirmed) return

  const keyIds = [...selectedApiKeys.value]

  try {
    const data = await apiClient.delete('/admin/api-keys/batch', {
      data: { keyIds }
    })

    if (data.success) {
      const { successCount, failedCount, errors } = data.data

      if (successCount > 0) {
        showToast(`成功删除 ${successCount} 个 API Keys`, 'success')

        // 如果有失败的，显示详细信息
        if (failedCount > 0) {
          const errorMessages = errors.map((e) => `${e.keyId}: ${e.error}`).join('\n')
          showToast(`${failedCount} 个删除失败:\n${errorMessages}`, 'warning')
        }
      } else {
        showToast('所有 API Keys 删除失败', 'error')
      }

      // 清空选中状态
      selectedApiKeys.value = []
      updateSelectAllState()
      loadApiKeys()
    } else {
      showToast(data.message || '批量删除失败', 'error')
    }
  } catch (error) {
    showToast('批量删除失败', 'error')
    // console.error('批量删除 API Keys 失败:', error)
  }
}

// 处理全选/取消全选
const handleSelectAll = () => {
  if (selectAllChecked.value) {
    // 全选当前页的所有API Keys
    paginatedApiKeys.value.forEach((key) => {
      if (!selectedApiKeys.value.includes(key.id)) {
        selectedApiKeys.value.push(key.id)
      }
    })
  } else {
    // 取消全选：只移除当前页的选中项，保留其他页面的选中项
    const currentPageIds = new Set(paginatedApiKeys.value.map((key) => key.id))
    selectedApiKeys.value = selectedApiKeys.value.filter((id) => !currentPageIds.has(id))
  }
  updateSelectAllState()
}

// 更新全选状态
const updateSelectAllState = () => {
  const totalInCurrentPage = paginatedApiKeys.value.length
  const selectedInCurrentPage = paginatedApiKeys.value.filter((key) =>
    selectedApiKeys.value.includes(key.id)
  ).length

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

// 开始编辑过期时间
const startEditExpiry = (apiKey) => {
  editingExpiryKey.value = apiKey
}

// 关闭过期时间编辑
const closeExpiryEdit = () => {
  editingExpiryKey.value = null
}

// 保存过期时间
const handleSaveExpiry = async ({ keyId, expiresAt, activateNow }) => {
  try {
    // 使用新的PATCH端点来修改过期时间
    const data = await apiClient.patch(`/admin/api-keys/${keyId}/expiration`, {
      expiresAt: expiresAt || null,
      activateNow: activateNow || false
    })

    if (data.success) {
      showToast(activateNow ? 'API Key已激活' : '过期时间已更新', 'success')
      // 更新本地数据
      const key = apiKeys.value.find((k) => k.id === keyId)
      if (key) {
        if (activateNow && data.updates) {
          key.isActivated = true
          key.activatedAt = data.updates.activatedAt
          key.expiresAt = data.updates.expiresAt
        } else {
          key.expiresAt = expiresAt || null
          if (expiresAt && !key.isActivated) {
            key.isActivated = true
          }
        }
      }
      closeExpiryEdit()
    } else {
      showToast(data.message || '更新失败', 'error')
      // 重置保存状态
      if (expiryEditModalRef.value) {
        expiryEditModalRef.value.resetSaving()
      }
    }
  } catch (error) {
    showToast('更新失败', 'error')
    // 重置保存状态
    if (expiryEditModalRef.value) {
      expiryEditModalRef.value.resetSaving()
    }
  }
}

// 格式化日期时间
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    .replace(/\//g, '-')
}

// 格式化时间窗口倒计时
const formatWindowTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m${secs}s`
  } else {
    return `${secs}s`
  }
}

// 获取每日费用进度 - 已移到 LimitProgressBar 组件中
// const getDailyCostProgress = (key) => {
// if (!key.dailyCostLimit || key.dailyCostLimit === 0) return 0
// const percentage = ((key.dailyCost || 0) / key.dailyCostLimit) * 100
// return Math.min(percentage, 100)
// }

// 获取每日费用进度条颜色 - 已移到 LimitProgressBar 组件中
// const getDailyCostProgressColor = (key) => {
// const progress = getDailyCostProgress(key)
// if (progress >= 100) return ''
// if (progress >= 80) return ''
// return ''
// }

// 获取 Opus 周费用进度 - 已移到 LimitBadge 组件中
// const getWeeklyOpusCostProgress = (key) => {
// if (!key.weeklyOpusCostLimit || key.weeklyOpusCostLimit === 0) return 0
// const percentage = ((key.weeklyOpusCost || 0) / key.weeklyOpusCostLimit) * 100
// return Math.min(percentage, 100)
// }

// 获取 Opus 周费用进度条颜色 - 已移到 LimitBadge 组件中
// const getWeeklyOpusCostProgressColor = (key) => {
// const progress = getWeeklyOpusCostProgress(key)
// if (progress >= 100) return ''
// if (progress >= 80) return ''
// return ''
// }

// 获取总费用进度 - 暂时不用
// const getTotalCostProgress = (key) => {
// if (!key.totalCostLimit || key.totalCostLimit === 0) return 0
// const percentage = ((key.totalCost || 0) / key.totalCostLimit) * 100
// return Math.min(percentage, 100)
// }

// 显示使用详情
const showUsageDetails = (apiKey) => {
  selectedApiKeyForDetail.value = apiKey
  showUsageDetailModal.value = true
}

// 格式化时间（秒转换为可读格式） - 已移到 WindowLimitBar 组件中
// const formatTime = (seconds) => {
// if (seconds === null || seconds === undefined) return '--:--'
//
// const hours = Math.floor(seconds / 3600)
// const minutes = Math.floor((seconds % 3600) / 60)
// const secs = seconds % 60
//
// if (hours > 0) {
// return `${hours}h ${minutes}m`
// } else if (minutes > 0) {
// return `${minutes}m ${secs}s`
// } else {
// return `${secs}s`
// }
// }

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

const ACCOUNT_TYPE_LABELS = {
  claude: 'Claude',
  openai: 'OpenAI',
  gemini: 'Gemini',
  droid: 'Droid',
  deleted: '已删除',
  other: '其他'
}

const MAX_LAST_USAGE_NAME_LENGTH = 16

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const normalizeFrontendAccountCategory = (type) => {
  if (!type) return 'other'
  const lower = String(type).toLowerCase()
  if (lower === 'claude-console' || lower === 'claude_console' || lower === 'claude') {
    return 'claude'
  }
  if (
    lower === 'openai' ||
    lower === 'openai-responses' ||
    lower === 'openai_responses' ||
    lower === 'azure-openai' ||
    lower === 'azure_openai'
  ) {
    return 'openai'
  }
  if (lower === 'gemini') {
    return 'gemini'
  }
  if (lower === 'droid') {
    return 'droid'
  }
  return 'other'
}

const getLastUsageInfo = (apiKey) => apiKey?.lastUsage || null

const hasLastUsageAccount = (apiKey) => {
  const info = getLastUsageInfo(apiKey)
  return !!(info && (info.accountName || info.accountId || info.rawAccountId))
}

const isLikelyDeletedUsage = (info) => {
  if (!info) return false
  if (info.accountCategory === 'deleted') return true

  const rawId = typeof info.rawAccountId === 'string' ? info.rawAccountId.trim() : ''
  const accountName = typeof info.accountName === 'string' ? info.accountName.trim() : ''
  const accountType =
    typeof info.accountType === 'string' ? info.accountType.trim().toLowerCase() : ''

  if (!rawId) return false

  const looksLikeUuid = UUID_PATTERN.test(rawId)
  const nameMissingOrSame = !accountName || accountName === rawId
  const typeUnknown =
    !accountType || accountType === 'unknown' || ACCOUNT_TYPE_LABELS[accountType] === undefined

  return looksLikeUuid && nameMissingOrSame && typeUnknown
}

const getLastUsageBaseName = (info) => {
  if (!info) return '未知账号'
  if (isLikelyDeletedUsage(info)) {
    return '已删除'
  }
  return info.accountName || info.accountId || info.rawAccountId || '未知账号'
}

const getLastUsageFullName = (apiKey) => getLastUsageBaseName(getLastUsageInfo(apiKey))

const getLastUsageDisplayName = (apiKey) => {
  const full = getLastUsageFullName(apiKey)
  return full.length > MAX_LAST_USAGE_NAME_LENGTH
    ? `${full.slice(0, MAX_LAST_USAGE_NAME_LENGTH)}...`
    : full
}

const getLastUsageTypeLabel = (apiKey) => {
  const info = getLastUsageInfo(apiKey)
  if (isLikelyDeletedUsage(info)) {
    return ACCOUNT_TYPE_LABELS.deleted
  }
  const category = info?.accountCategory || normalizeFrontendAccountCategory(info?.accountType)
  return ACCOUNT_TYPE_LABELS[category] || ACCOUNT_TYPE_LABELS.other
}

const isLastUsageDeleted = (apiKey) => {
  const info = getLastUsageInfo(apiKey)
  return isLikelyDeletedUsage(info)
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

// 导出数据到Excel
const exportToExcel = () => {
  try {
    // 准备导出的数据 - 简化版本
    const exportData = sortedApiKeys.value.map((key) => {
      // 获取当前时间段的数据
      const periodRequests = getPeriodRequests(key)
      const periodCost = calculatePeriodCost(key)
      const periodTokens = getPeriodTokens(key)
      const periodInputTokens = getPeriodInputTokens(key)
      const periodOutputTokens = getPeriodOutputTokens(key)

      // 基础数据
      const baseData = {
        ID: key.id || '',
        名称: key.name || '',
        描述: key.description || '',
        状态: key.isActive ? '启用' : '禁用',
        API密钥: key.apiKey || '',

        // 过期配置
        过期模式:
          key.expirationMode === 'activation'
            ? '首次使用后激活'
            : key.expirationMode === 'fixed'
              ? '固定时间'
              : '无',
        激活期限: key.activationDays || '',
        激活单位:
          key.activationUnit === 'hours' ? '小时' : key.activationUnit === 'days' ? '天' : '',
        已激活: key.isActivated ? '是' : '否',
        激活时间: key.activatedAt ? formatDate(key.activatedAt) : '',
        过期时间: key.expiresAt ? formatDate(key.expiresAt) : '',

        // 权限配置
        服务权限:
          key.permissions === 'all'
            ? '全部服务'
            : key.permissions === 'claude'
              ? '仅Claude'
              : key.permissions === 'gemini'
                ? '仅Gemini'
                : key.permissions === 'openai'
                  ? '仅OpenAI'
                  : key.permissions === 'droid'
                    ? '仅Droid'
                    : key.permissions || '',

        // 限制配置
        令牌限制: key.tokenLimit === '0' || key.tokenLimit === 0 ? '无限制' : key.tokenLimit || '',
        并发限制:
          key.concurrencyLimit === '0' || key.concurrencyLimit === 0
            ? '无限制'
            : key.concurrencyLimit || '',
        '速率窗口(分钟)':
          key.rateLimitWindow === '0' || key.rateLimitWindow === 0
            ? '无限制'
            : key.rateLimitWindow || '',
        速率请求限制:
          key.rateLimitRequests === '0' || key.rateLimitRequests === 0
            ? '无限制'
            : key.rateLimitRequests || '',
        '日费用限制($)':
          key.dailyCostLimit === '0' || key.dailyCostLimit === 0
            ? '无限制'
            : `$${key.dailyCostLimit}` || '',
        '总费用限制($)':
          key.totalCostLimit === '0' || key.totalCostLimit === 0
            ? '无限制'
            : `$${key.totalCostLimit}` || '',

        // 账户绑定
        Claude专属账户: key.claudeAccountId || '',
        Claude控制台账户: key.claudeConsoleAccountId || '',
        Gemini专属账户: key.geminiAccountId || '',
        OpenAI专属账户: key.openaiAccountId || '',
        'Azure OpenAI专属账户': key.azureOpenaiAccountId || '',
        Bedrock专属账户: key.bedrockAccountId || '',
        Droid专属账户: key.droidAccountId || '',

        // 模型和客户端限制
        启用模型限制: key.enableModelRestriction ? '是' : '否',
        限制的模型:
          key.restrictedModels && key.restrictedModels.length > 0
            ? key.restrictedModels.join('; ')
            : '',
        启用客户端限制: key.enableClientRestriction ? '是' : '否',
        允许的客户端:
          key.allowedClients && key.allowedClients.length > 0 ? key.allowedClients.join('; ') : '',

        // 创建信息
        创建时间: key.createdAt ? formatDate(key.createdAt) : '',
        创建者: key.createdBy || '',
        用户ID: key.userId || '',
        用户名: key.userUsername || '',

        // 使用统计
        标签: key.tags && key.tags.length > 0 ? key.tags.join(', ') : '无',
        请求总数: periodRequests,
        '总费用($)': periodCost.toFixed(2),
        Token数: formatTokenCount(periodTokens),
        输入Token: formatTokenCount(periodInputTokens),
        输出Token: formatTokenCount(periodOutputTokens),
        最后使用时间: key.lastUsedAt ? formatDate(key.lastUsedAt) : '从未使用',
        最后使用账号: getLastUsageFullName(key),
        最后使用类型: getLastUsageTypeLabel(key)
      }

      // 添加分模型统计
      const modelStats = {}

      // 根据当前时间筛选条件获取对应的模型统计
      let modelsData = null

      if (globalDateFilter.preset === 'today') {
        modelsData = key.usage?.daily?.models
      } else if (globalDateFilter.preset === '7days') {
        modelsData = key.usage?.weekly?.models
      } else if (globalDateFilter.preset === '30days') {
        modelsData = key.usage?.monthly?.models
      } else if (globalDateFilter.preset === 'all') {
        modelsData = key.usage?.total?.models
      }

      // 处理模型统计
      if (modelsData) {
        Object.entries(modelsData).forEach(([model, stats]) => {
          // 简化模型名称，去掉前缀
          let modelName = model
          if (model.includes(':')) {
            modelName = model.split(':').pop() // 取最后一部分
          }
          modelName = modelName.replace(/[:/]/g, '_')

          modelStats[`${modelName}_请求数`] = stats.requests || 0
          modelStats[`${modelName}_费用($)`] = (stats.cost || 0).toFixed(2)
          modelStats[`${modelName}_Token`] = formatTokenCount(stats.totalTokens || 0)
          modelStats[`${modelName}_输入Token`] = formatTokenCount(stats.inputTokens || 0)
          modelStats[`${modelName}_输出Token`] = formatTokenCount(stats.outputTokens || 0)
        })
      }

      return { ...baseData, ...modelStats }
    })

    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 获取工作表范围
    const range = XLSX.utils.decode_range(ws['!ref'])

    // 设置列宽
    const headers = Object.keys(exportData[0] || {})
    const columnWidths = headers.map((header) => {
      // 基本信息字段
      if (header === 'ID') return { wch: 40 }
      if (header === '名称') return { wch: 25 }
      if (header === '描述') return { wch: 30 }
      if (header === 'API密钥') return { wch: 45 }
      if (header === '标签') return { wch: 20 }

      // 时间字段
      if (header.includes('时间')) return { wch: 20 }

      // 限制字段
      if (header.includes('限制')) return { wch: 15 }
      if (header.includes('费用')) return { wch: 15 }
      if (header.includes('Token')) return { wch: 15 }
      if (header.includes('请求')) return { wch: 12 }

      // 账户绑定字段
      if (header.includes('账户')) return { wch: 30 }

      // 权限配置字段
      if (header.includes('权限') || header.includes('模型') || header.includes('客户端'))
        return { wch: 20 }

      // 激活配置字段
      if (header.includes('激活') || header.includes('过期')) return { wch: 18 }

      // 默认宽度
      return { wch: 15 }
    })
    ws['!cols'] = columnWidths

    // 应用样式到标题行
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
      if (!ws[cellAddress]) continue

      const header = headers[C]
      const isModelColumn = header && header.includes('_')

      ws[cellAddress].s = {
        fill: {
          fgColor: { rgb: isModelColumn ? '70AD47' : '4472C4' }
        },
        font: {
          color: { rgb: 'FFFFFF' },
          bold: true,
          sz: 12
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: '2F5597' } },
          bottom: { style: 'thin', color: { rgb: '2F5597' } },
          left: { style: 'thin', color: { rgb: '2F5597' } },
          right: { style: 'thin', color: { rgb: '2F5597' } }
        }
      }
    }

    // 应用样式到数据行
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellAddress]) continue

        const header = headers[C]
        const value = ws[cellAddress].v

        // 基础样式
        const cellStyle = {
          font: { sz: 11 },
          border: {
            top: { style: 'thin', color: { rgb: 'D3D3D3' } },
            bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
            left: { style: 'thin', color: { rgb: 'D3D3D3' } },
            right: { style: 'thin', color: { rgb: 'D3D3D3' } }
          }
        }

        // 偶数行背景色
        if (R % 2 === 0) {
          cellStyle.fill = { fgColor: { rgb: 'F2F2F2' } }
        }

        // 根据列类型设置对齐和特殊样式
        if (header === '名称') {
          cellStyle.alignment = { horizontal: 'left', vertical: 'center' }
        } else if (header === '标签') {
          cellStyle.alignment = { horizontal: 'left', vertical: 'center' }
          if (value === '无') {
            cellStyle.font = { ...cellStyle.font, color: { rgb: '999999' }, italic: true }
          }
        } else if (header === '最后使用时间') {
          cellStyle.alignment = { horizontal: 'right', vertical: 'center' }
          if (value === '从未使用') {
            cellStyle.font = { ...cellStyle.font, color: { rgb: '999999' }, italic: true }
          }
        } else if (header && header.includes('费用')) {
          cellStyle.alignment = { horizontal: 'right', vertical: 'center' }
          cellStyle.font = { ...cellStyle.font, color: { rgb: '0066CC' }, bold: true }
        } else if (header && (header.includes('Token') || header.includes('请求'))) {
          cellStyle.alignment = { horizontal: 'right', vertical: 'center' }
        }

        ws[cellAddress].s = cellStyle
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, '用量统计')

    // 生成文件名（包含时间戳和筛选条件）
    const now = new Date()
    const timestamp =
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')

    let timeRangeLabel = ''
    if (globalDateFilter.type === 'preset') {
      const presetLabels = {
        today: '今日',
        '7days': '最近7天',
        '30days': '最近30天',
        all: '全部时间'
      }
      timeRangeLabel = presetLabels[globalDateFilter.preset] || globalDateFilter.preset
    } else {
      timeRangeLabel = '自定义时间'
    }

    const filename = `API_Keys_用量统计_${timeRangeLabel}_${timestamp}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, filename)

    showToast(`成功导出 ${exportData.length} 条API Key用量数据`, 'success')
  } catch (error) {
    // console.error('导出失败:', error)
    showToast('导出失败，请重试', 'error')
  }
}

// 监听筛选条件变化，重置页码和选中状态
// 监听筛选条件变化（不包括搜索），清空选中状态
watch([selectedTagFilter, apiKeyStatsTimeRange], () => {
  currentPage.value = 1
  // 清空选中状态
  selectedApiKeys.value = []
  updateSelectAllState()
})

// 监听搜索关键词变化，只重置分页，保持选中状态
watch(searchKeyword, () => {
  currentPage.value = 1
  // 不清空选中状态，允许跨搜索保持勾选
  updateSelectAllState()
})

// 监听搜索模式变化，重置分页并更新选中状态
watch(searchMode, () => {
  currentPage.value = 1
  updateSelectAllState()
})

// 监听分页变化，更新全选状态
watch([currentPage, pageSize], () => {
  updateSelectAllState()
})

// 监听每页显示条数变化，保存到 localStorage
watch(pageSize, (newSize) => {
  localStorage.setItem('apiKeysPageSize', newSize.toString())
})

// 监听API Keys数据变化，清理无效的选中状态
watch(apiKeys, () => {
  const validIds = new Set(apiKeys.value.map((key) => key.id))

  // 过滤出仍然有效的选中项
  selectedApiKeys.value = selectedApiKeys.value.filter((id) => validIds.has(id))

  updateSelectAllState()
})

onMounted(async () => {
  // 并行加载所有需要的数据
  await Promise.all([clientsStore.loadSupportedClients(), loadAccounts(), loadApiKeys()])

  // 初始化全选状态
  updateSelectAllState()
})
</script>
