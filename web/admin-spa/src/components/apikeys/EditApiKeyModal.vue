<template>
  <BaseModal icon="Edit" :show="true" size="md" title="编辑 API Key" @close="$emit('close')">
    <template #default>
      <div class="space-y-4">
        <!-- 名称字段 -->
        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >名称</label
          >
          <div>
            <input
              v-model="form.name"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              maxlength="100"
              placeholder="请输入API Key名称"
              required
              type="text"
            />
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">用于识别此 API Key 的用途</p>
        </div>

        <!-- 所有者选择 -->
        <div class="mb-4">
          <Select
            v-model="form.ownerId"
            :options="userOptions"
            label="所有者"
            placeholder="请选择所有者"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            分配此 API Key 给指定用户或管理员，管理员分配时不受用户 API Key 数量限制
          </p>
        </div>

        <!-- 标签 -->
        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >标签</label
          >
          <div class="space-y-3">
            <!-- 已选择的标签 -->
            <div v-if="form.tags.length > 0">
              <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">已选择的标签:</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(tag, index) in form.tags"
                  :key="'selected-' + index"
                  class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                >
                  {{ tag }}
                  <button
                    class="ml-1 text-primary-500 hover:text-primary-700 dark:hover:text-primary-300"
                    type="button"
                    @click="removeTag(index)"
                  >
                    <Icon class="h-3 w-3" name="X" />
                  </button>
                </span>
              </div>
            </div>

            <!-- 可选择的已有标签 -->
            <div v-if="unselectedTags.length > 0">
              <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">点击选择已有标签:</div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in unselectedTags"
                  :key="'available-' + tag"
                  class="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  type="button"
                  @click="selectTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- 创建新标签 -->
            <div>
              <div class="mb-1 text-xs text-gray-500 dark:text-gray-400">创建新标签:</div>
              <div class="flex gap-2">
                <input
                  v-model="newTag"
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="输入新标签名称"
                  type="text"
                  @keypress.enter.prevent="addTag"
                />
                <button
                  class="rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-700"
                  type="button"
                  @click="addTag"
                >
                  <Icon class="h-4 w-4" name="Plus" />
                </button>
              </div>
            </div>

            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              用于标记不同团队或用途，方便筛选管理
            </p>
          </div>
        </div>

        <!-- 速率限制设置 -->
        <div class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="mb-3 flex items-center gap-2">
            <Icon class="h-4 w-4 text-amber-500" name="Gauge" />
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">速率限制设置 (可选)</h4>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >时间窗口 (分钟)</label
                >
                <input
                  v-model="form.rateLimitWindow"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  min="1"
                  placeholder="无限制"
                  type="number"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">时间段单位</p>
              </div>

              <div>
                <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >请求次数限制</label
                >
                <input
                  v-model="form.rateLimitRequests"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  min="1"
                  placeholder="无限制"
                  type="number"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">窗口内最大请求</p>
              </div>

              <div>
                <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >费用限制 (美元)</label
                >
                <input
                  v-model="form.rateLimitCost"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  min="0"
                  placeholder="无限制"
                  step="0.01"
                  type="number"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">窗口内最大费用</p>
              </div>
            </div>

            <!-- 示例说明 -->
            <div class="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <h5
                class="mb-2 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400"
              >
                <Icon class="h-3.5 w-3.5" name="Lightbulb" />
                使用示例
              </h5>
              <div class="space-y-1 text-xs text-amber-600 dark:text-amber-300">
                <div>
                  <strong>示例1:</strong> 时间窗口=60，请求次数=1000 → 每60分钟最多1000次请求
                </div>
                <div><strong>示例2:</strong> 时间窗口=1，费用=0.1 → 每分钟最多$0.1费用</div>
                <div>
                  <strong>示例3:</strong> 窗口=30，请求=50，费用=5 → 每30分钟50次请求且不超$5费用
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >每日费用限制 (美元)</label
          >
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.dailyCostLimit = '50'"
              >
                $50
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.dailyCostLimit = '100'"
              >
                $100
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.dailyCostLimit = '200'"
              >
                $200
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.dailyCostLimit = ''"
              >
                自定义
              </button>
            </div>
            <input
              v-model="form.dailyCostLimit"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              min="0"
              placeholder="0 表示无限制"
              step="0.01"
              type="number"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              设置此 API Key 每日的费用限制，超过限制将拒绝请求，0 或留空表示无限制
            </p>
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >总费用限制 (美元)</label
          >
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.totalCostLimit = '100'"
              >
                $100
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.totalCostLimit = '500'"
              >
                $500
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.totalCostLimit = '1000'"
              >
                $1000
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.totalCostLimit = ''"
              >
                自定义
              </button>
            </div>
            <input
              v-model="form.totalCostLimit"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              min="0"
              placeholder="0 表示无限制"
              step="0.01"
              type="number"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              设置此 API Key 的累计总费用限制，达到限制后将拒绝所有后续请求，0 或留空表示无限制
            </p>
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Opus 模型周费用限制 (美元)</label
          >
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.weeklyOpusCostLimit = '100'"
              >
                $100
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.weeklyOpusCostLimit = '500'"
              >
                $500
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.weeklyOpusCostLimit = '1000'"
              >
                $1000
              </button>
              <button
                class="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                type="button"
                @click="form.weeklyOpusCostLimit = ''"
              >
                自定义
              </button>
            </div>
            <input
              v-model="form.weeklyOpusCostLimit"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              min="0"
              placeholder="0 表示无限制"
              step="0.01"
              type="number"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              设置 Opus 模型的周费用限制（周一到周日），仅限 Claude 官方账户，0 或留空表示无限制
            </p>
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >并发限制</label
          >
          <input
            v-model="form.concurrencyLimit"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            min="0"
            placeholder="0 表示无限制"
            type="number"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            设置此 API Key 可同时处理的最大请求数
          </p>
        </div>

        <!-- 激活账号 -->
        <div class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <input
              id="editIsActive"
              v-model="form.isActive"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              type="checkbox"
            />
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="editIsActive">
              激活账号
            </label>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            取消勾选将禁用此 API Key，暂停所有请求，客户端返回 401 错误
          </p>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >服务权限</label
          >
          <div class="flex flex-wrap gap-3">
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <input
                v-model="form.permissions"
                class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                type="radio"
                value="all"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">全部服务</span>
            </label>
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <input
                v-model="form.permissions"
                class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                type="radio"
                value="claude"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">仅 Claude</span>
            </label>
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <input
                v-model="form.permissions"
                class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                type="radio"
                value="gemini"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">仅 Gemini</span>
            </label>
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <input
                v-model="form.permissions"
                class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                type="radio"
                value="openai"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">仅 OpenAI</span>
            </label>
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <input
                v-model="form.permissions"
                class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                type="radio"
                value="droid"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">仅 Droid</span>
            </label>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            控制此 API Key 可以访问哪些服务
          </p>
        </div>

        <div class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="mb-3 flex items-center justify-between">
            <label
              class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"
            >
              <Icon class="h-4 w-4 text-blue-500" name="Link" />
              专属账号绑定
            </label>
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              :disabled="accountsLoading"
              title="刷新账号列表"
              type="button"
              @click="refreshAccounts"
            >
              <Icon
                class="h-3.5 w-3.5"
                :class="{ 'animate-spin': accountsLoading }"
                name="RefreshCw"
              />
              <span>{{ accountsLoading ? '刷新中...' : '刷新账号' }}</span>
            </button>
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >Claude 专属账号</label
              >
              <AccountSelector
                v-model="form.claudeAccountId"
                :accounts="localAccounts.claude"
                default-option-text="使用共享账号池"
                :disabled="form.permissions !== 'all' && form.permissions !== 'claude'"
                :groups="localAccounts.claudeGroups"
                placeholder="请选择Claude账号"
                platform="claude"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >Gemini 专属账号</label
              >
              <AccountSelector
                v-model="form.geminiAccountId"
                :accounts="localAccounts.gemini"
                default-option-text="使用共享账号池"
                :disabled="form.permissions !== 'all' && form.permissions !== 'gemini'"
                :groups="localAccounts.geminiGroups"
                placeholder="请选择Gemini账号"
                platform="gemini"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >OpenAI 专属账号</label
              >
              <AccountSelector
                v-model="form.openaiAccountId"
                :accounts="localAccounts.openai"
                default-option-text="使用共享账号池"
                :disabled="form.permissions !== 'all' && form.permissions !== 'openai'"
                :groups="localAccounts.openaiGroups"
                placeholder="请选择OpenAI账号"
                platform="openai"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >Bedrock 专属账号</label
              >
              <AccountSelector
                v-model="form.bedrockAccountId"
                :accounts="localAccounts.bedrock"
                default-option-text="使用共享账号池"
                :disabled="form.permissions !== 'all' && form.permissions !== 'openai'"
                :groups="[]"
                placeholder="请选择Bedrock账号"
                platform="bedrock"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >Droid 专属账号</label
              >
              <AccountSelector
                v-model="form.droidAccountId"
                :accounts="localAccounts.droid"
                default-option-text="使用共享账号池"
                :disabled="form.permissions !== 'all' && form.permissions !== 'droid'"
                :groups="localAccounts.droidGroups"
                placeholder="请选择Droid账号"
                platform="droid"
              />
            </div>
          </div>
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            修改绑定账号将影响此API Key的请求路由
          </p>
        </div>

        <div class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <input
              id="editEnableModelRestriction"
              v-model="form.enableModelRestriction"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              type="checkbox"
            />
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
              for="editEnableModelRestriction"
            >
              启用模型限制
            </label>
          </div>

          <div v-if="form.enableModelRestriction" class="mt-4 space-y-4">
            <div>
              <label class="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >限制的模型列表</label
              >
              <div class="mb-3 flex flex-wrap gap-2">
                <span
                  v-for="(model, index) in form.restrictedModels"
                  :key="index"
                  class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
                >
                  {{ model }}
                  <button
                    class="ml-1 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                    type="button"
                    @click="removeRestrictedModel(index)"
                  >
                    <Icon class="h-3 w-3" name="X" />
                  </button>
                </span>
                <span
                  v-if="form.restrictedModels.length === 0"
                  class="text-xs text-gray-500 dark:text-gray-400"
                >
                  暂无限制的模型
                </span>
              </div>
              <div class="space-y-3">
                <!-- 快速添加按钮 -->
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="model in availableQuickModels"
                    :key="model"
                    class="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    type="button"
                    @click="quickAddRestrictedModel(model)"
                  >
                    + {{ model }}
                  </button>
                  <span
                    v-if="availableQuickModels.length === 0"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    所有常用模型已在限制列表中
                  </span>
                </div>

                <!-- 手动输入 -->
                <div class="flex gap-2">
                  <input
                    v-model="form.modelInput"
                    class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="输入模型名称，按回车添加"
                    type="text"
                    @keydown.enter.prevent="addRestrictedModel"
                  />
                  <button
                    class="rounded-lg bg-primary-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-700"
                    type="button"
                    @click="addRestrictedModel"
                  >
                    <Icon class="h-4 w-4" name="Plus" />
                  </button>
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                设置此API Key无法访问的模型，例如：claude-opus-4-20250514
              </p>
            </div>
          </div>
        </div>

        <!-- 客户端限制 -->
        <div class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <input
              id="editEnableClientRestriction"
              v-model="form.enableClientRestriction"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              type="checkbox"
            />
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
              for="editEnableClientRestriction"
            >
              启用客户端限制
            </label>
          </div>

          <div v-if="form.enableClientRestriction" class="mt-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >允许的客户端</label
              >
              <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
                勾选允许使用此API Key的客户端
              </p>
              <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div
                  v-for="client in supportedClients"
                  :key="client.id"
                  class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-600"
                >
                  <input
                    :id="`edit_client_${client.id}`"
                    v-model="form.allowedClients"
                    class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                    type="checkbox"
                    :value="client.id"
                  />
                  <label class="flex-1 cursor-pointer" :for="`edit_client_${client.id}`">
                    <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{
                      client.name
                    }}</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-400">{{
                      client.description
                    }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SessionId 收集配置 (伪装白名单) -->
        <div class="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <input
              id="editEnableSessionCollection"
              v-model="form.sessionCollection.enabled"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              type="checkbox"
            />
            <label
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              for="editEnableSessionCollection"
            >
              <Icon class="h-4 w-4 text-purple-500" name="Fingerprint" />
              启用 SessionId 收集 (伪装白名单)
            </label>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            启用后，此 API Key 的请求会被纳入伪装中间件的 SessionId
            收集白名单，收集的会话ID将用于请求伪装
          </p>

          <div v-if="form.sessionCollection.enabled" class="mt-4 space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >优先级 (1-10)</label
                >
                <input
                  v-model.number="form.sessionCollection.priority"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  max="10"
                  min="1"
                  type="number"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  数字越大优先级越高，收集的 SessionId 越优先被使用
                </p>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >收集配额</label
                >
                <input
                  v-model.number="form.sessionCollection.quota"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  min="-1"
                  placeholder="-1 表示无限制"
                  type="number"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  此 Key 最多收集的 SessionId 数量，-1 表示无限制
                </p>
              </div>
            </div>

            <!-- 收集统计信息 -->
            <div
              v-if="form.sessionCollection.collectedCount > 0"
              class="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20"
            >
              <div class="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
                <Icon class="h-4 w-4" name="BarChart3" />
                <span>
                  已收集
                  <strong>{{ form.sessionCollection.collectedCount }}</strong> 个 SessionId
                  <span v-if="form.sessionCollection.lastCollectedAt">
                    ，最后收集于
                    {{ formatDate(form.sessionCollection.lastCollectedAt) }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        type="button"
        @click="$emit('close')"
      >
        取消
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        :disabled="loading"
        type="button"
        @click="updateApiKey"
      >
        <div
          v-if="loading"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        {{ loading ? '保存中...' : '保存修改' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast } from '@/utils/toast'
import { useClientsStore } from '@/stores/clients'
import { useApiKeysStore } from '@/stores/apiKeys'
import { apiClient } from '@/config/api'
import BaseModal from '@/components/common/BaseModal.vue'
import AccountSelector from '@/components/common/AccountSelector.vue'
import Icon from '@/components/common/Icon.vue'
import Select from '@/ui/Select.vue'

const props = defineProps({
  apiKey: {
    type: Object,
    required: true
  },
  accounts: {
    type: Object,
    default: () => ({
      claude: [],
      gemini: [],
      openai: [],
      bedrock: [],
      droid: [],
      claudeGroups: [],
      geminiGroups: [],
      openaiGroups: [],
      droidGroups: [],
      openaiResponses: []
    })
  }
})

const emit = defineEmits(['close', 'success'])

// const authStore = useAuthStore()
const clientsStore = useClientsStore()
const apiKeysStore = useApiKeysStore()
const loading = ref(false)
const accountsLoading = ref(false)
const localAccounts = ref({
  claude: [],
  gemini: [],
  openai: [],
  bedrock: [],
  droid: [],
  claudeGroups: [],
  geminiGroups: [],
  openaiGroups: [],
  droidGroups: []
})

// 支持的客户端列表
const supportedClients = ref([])

// 可用用户列表
const availableUsers = ref([])

// 转换用户列表为 Select 组件格式
const userOptions = computed(() => {
  return availableUsers.value.map((user) => ({
    value: user.id,
    label: `${user.displayName} (${user.username})${user.role === 'admin' ? ' - 管理员' : ''}`
  }))
})

// 标签相关
const newTag = ref('')
const availableTags = ref([])

// 计算未选择的标签
const unselectedTags = computed(() => {
  return availableTags.value.filter((tag) => !form.tags.includes(tag))
})

// 表单数据
const form = reactive({
  name: '',
  tokenLimit: '', // 保留用于检测历史数据
  rateLimitWindow: '',
  rateLimitRequests: '',
  rateLimitCost: '', // 新增：费用限制
  concurrencyLimit: '',
  dailyCostLimit: '',
  totalCostLimit: '',
  weeklyOpusCostLimit: '',
  permissions: 'all',
  claudeAccountId: '',
  geminiAccountId: '',
  openaiAccountId: '',
  bedrockAccountId: '',
  droidAccountId: '',
  enableModelRestriction: false,
  restrictedModels: [],
  modelInput: '',
  enableClientRestriction: false,
  allowedClients: [],
  tags: [],
  isActive: true,
  ownerId: '', // 新增：所有者ID
  sessionCollection: {
    enabled: false,
    priority: 1,
    quota: -1,
    collectedCount: 0,
    lastCollectedAt: null
  }
})

// 添加限制的模型
const addRestrictedModel = () => {
  if (form.modelInput && !form.restrictedModels.includes(form.modelInput)) {
    form.restrictedModels.push(form.modelInput)
    form.modelInput = ''
  }
}

// 移除限制的模型
const removeRestrictedModel = (index) => {
  form.restrictedModels.splice(index, 1)
}

// 常用模型列表
const commonModels = ref(['claude-opus-4-20250514', 'claude-opus-4-1-20250805'])

// 可用的快捷模型（过滤掉已在限制列表中的）
const availableQuickModels = computed(() => {
  return commonModels.value.filter((model) => !form.restrictedModels.includes(model))
})

// 快速添加限制的模型
const quickAddRestrictedModel = (model) => {
  if (!form.restrictedModels.includes(model)) {
    form.restrictedModels.push(model)
  }
}

// 标签管理方法
const addTag = () => {
  if (newTag.value && newTag.value.trim()) {
    const tag = newTag.value.trim()
    if (!form.tags.includes(tag)) {
      form.tags.push(tag)
    }
    newTag.value = ''
  }
}

const selectTag = (tag) => {
  if (!form.tags.includes(tag)) {
    form.tags.push(tag)
  }
}

const removeTag = (index) => {
  form.tags.splice(index, 1)
}

// 更新 API Key
const updateApiKey = async () => {
  // 检查是否设置了时间窗口但费用限制为0
  if (form.rateLimitWindow && (!form.rateLimitCost || parseFloat(form.rateLimitCost) === 0)) {
    let confirmed = false
    if (window.showConfirm) {
      confirmed = await window.showConfirm(
        '费用限制提醒',
        '您设置了时间窗口但费用限制为0，这意味着不会有费用限制。\n\n是否继续？',
        '继续保存',
        '返回修改'
      )
    } else {
      // 降级方案
      confirmed = confirm('您设置了时间窗口但费用限制为0，这意味着不会有费用限制。\n是否继续？')
    }
    if (!confirmed) {
      return
    }
  }

  loading.value = true

  try {
    // 准备提交的数据
    const data = {
      name: form.name, // 添加名称字段
      tokenLimit: 0, // 清除历史token限制
      rateLimitWindow:
        form.rateLimitWindow !== '' && form.rateLimitWindow !== null
          ? parseInt(form.rateLimitWindow)
          : 0,
      rateLimitRequests:
        form.rateLimitRequests !== '' && form.rateLimitRequests !== null
          ? parseInt(form.rateLimitRequests)
          : 0,
      rateLimitCost:
        form.rateLimitCost !== '' && form.rateLimitCost !== null
          ? parseFloat(form.rateLimitCost)
          : 0,
      concurrencyLimit:
        form.concurrencyLimit !== '' && form.concurrencyLimit !== null
          ? parseInt(form.concurrencyLimit)
          : 0,
      dailyCostLimit:
        form.dailyCostLimit !== '' && form.dailyCostLimit !== null
          ? parseFloat(form.dailyCostLimit)
          : 0,
      totalCostLimit:
        form.totalCostLimit !== '' && form.totalCostLimit !== null
          ? parseFloat(form.totalCostLimit)
          : 0,
      weeklyOpusCostLimit:
        form.weeklyOpusCostLimit !== '' && form.weeklyOpusCostLimit !== null
          ? parseFloat(form.weeklyOpusCostLimit)
          : 0,
      permissions: form.permissions,
      tags: form.tags
    }

    // 处理Claude账户绑定（区分OAuth和Console）
    if (form.claudeAccountId) {
      if (form.claudeAccountId.startsWith('console:')) {
        // Claude Console账户
        data.claudeConsoleAccountId = form.claudeAccountId.substring(8)
        data.claudeAccountId = null // 清空OAuth账号
      } else if (!form.claudeAccountId.startsWith('group:')) {
        // Claude OAuth账户（非分组）
        data.claudeAccountId = form.claudeAccountId
        data.claudeConsoleAccountId = null // 清空Console账号
      } else {
        // 分组
        data.claudeAccountId = form.claudeAccountId
        data.claudeConsoleAccountId = null // 清空Console账号
      }
    } else {
      // 使用共享池，清空所有绑定
      data.claudeAccountId = null
      data.claudeConsoleAccountId = null
    }

    // Gemini账户绑定
    if (form.geminiAccountId) {
      data.geminiAccountId = form.geminiAccountId
    } else {
      data.geminiAccountId = null
    }

    // OpenAI账户绑定
    if (form.openaiAccountId) {
      data.openaiAccountId = form.openaiAccountId
    } else {
      data.openaiAccountId = null
    }

    // Bedrock账户绑定
    if (form.bedrockAccountId) {
      data.bedrockAccountId = form.bedrockAccountId
    } else {
      data.bedrockAccountId = null
    }

    if (form.droidAccountId) {
      data.droidAccountId = form.droidAccountId
    } else {
      data.droidAccountId = null
    }

    // 模型限制 - 始终提交这些字段
    data.enableModelRestriction = form.enableModelRestriction
    data.restrictedModels = form.restrictedModels

    // 客户端限制 - 始终提交这些字段
    data.enableClientRestriction = form.enableClientRestriction
    data.allowedClients = form.allowedClients

    // 活跃状态
    data.isActive = form.isActive

    // 所有者
    if (form.ownerId !== undefined) {
      data.ownerId = form.ownerId
    }

    // SessionId 收集配置
    data.sessionCollection = {
      enabled: form.sessionCollection.enabled,
      priority: form.sessionCollection.priority,
      quota: form.sessionCollection.quota
    }

    const result = await apiClient.put(`/admin/api-keys/${props.apiKey.id}`, data)

    if (result.success) {
      emit('success')
      emit('close')
    } else {
      showToast(result.message || '更新失败', 'error')
    }
  } catch (error) {
    showToast('更新失败', 'error')
  } finally {
    loading.value = false
  }
}

// 刷新账号列表
const refreshAccounts = async () => {
  accountsLoading.value = true
  try {
    const [
      claudeData,
      claudeConsoleData,
      geminiData,
      geminiApiData,
      openaiData,
      openaiResponsesData,
      bedrockData,
      droidData,
      groupsData
    ] = await Promise.all([
      apiClient.get('/admin/claude-accounts'),
      apiClient.get('/admin/claude-console-accounts'),
      apiClient.get('/admin/gemini-accounts'),
      apiClient.get('/admin/gemini-api-accounts'),
      apiClient.get('/admin/openai-accounts'),
      apiClient.get('/admin/openai-responses-accounts'),
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
          isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
        })
      })
    }

    if (claudeConsoleData.success) {
      claudeConsoleData.data?.forEach((account) => {
        claudeAccounts.push({
          ...account,
          platform: 'claude-console',
          isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
        })
      })
    }

    localAccounts.value.claude = claudeAccounts

    // 合并 Gemini OAuth 和 Gemini API 账号
    const geminiAccounts = []

    if (geminiData.success) {
      ;(geminiData.data || []).forEach((account) => {
        geminiAccounts.push({
          ...account,
          platform: 'gemini',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    if (geminiApiData.success) {
      ;(geminiApiData.data || []).forEach((account) => {
        geminiAccounts.push({
          ...account,
          platform: 'gemini-api',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    localAccounts.value.gemini = geminiAccounts

    // 合并 OpenAI 和 OpenAI-Responses 账号
    const openaiAccounts = []

    if (openaiData.success) {
      ;(openaiData.data || []).forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    if (openaiResponsesData.success) {
      ;(openaiResponsesData.data || []).forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai-responses',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    localAccounts.value.openai = openaiAccounts

    if (bedrockData.success) {
      localAccounts.value.bedrock = (bedrockData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    if (droidData.success) {
      localAccounts.value.droid = (droidData.data || []).map((account) => ({
        ...account,
        platform: 'droid',
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    // 处理分组数据
    if (groupsData.success) {
      const allGroups = groupsData.data || []
      localAccounts.value.claudeGroups = allGroups.filter((g) => g.platform === 'claude')
      localAccounts.value.geminiGroups = allGroups.filter((g) => g.platform === 'gemini')
      localAccounts.value.openaiGroups = allGroups.filter((g) => g.platform === 'openai')
      localAccounts.value.droidGroups = allGroups.filter((g) => g.platform === 'droid')
    }

    showToast('账号列表已刷新', 'success')
  } catch (error) {
    showToast('刷新账号列表失败', 'error')
  } finally {
    accountsLoading.value = false
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users')
    if (response.success) {
      availableUsers.value = response.data || []
    }
  } catch (error) {
    // console.error('Failed to load users:', error)
    availableUsers.value = [
      {
        id: 'admin',
        username: 'admin',
        displayName: 'Admin',
        email: '',
        role: 'admin'
      }
    ]
  }
}

// 初始化表单数据
onMounted(async () => {
  try {
    // 并行加载所有需要的数据
    const [clients, tags] = await Promise.all([
      clientsStore.loadSupportedClients(),
      apiKeysStore.fetchTags(),
      loadUsers()
    ])

    supportedClients.value = clients || []
    availableTags.value = tags || []
  } catch (error) {
    // console.error('Error loading initial data:', error)
    // Fallback to empty arrays if loading fails
    supportedClients.value = []
    availableTags.value = []
  }

  // 初始化账号数据
  if (props.accounts) {
    // props.accounts.gemini 已经包含了 OAuth 和 API 两种类型的账号（父组件已合并）
    // 保留原有的 platform 属性，不要覆盖
    const geminiAccounts = (props.accounts.gemini || []).map((account) => ({
      ...account,
      platform: account.platform || 'gemini' // 保留原有 platform，只在没有时设默认值
    }))

    // props.accounts.openai 只包含 openai 类型，openaiResponses 需要单独处理
    const openaiAccounts = []
    if (props.accounts.openai) {
      props.accounts.openai.forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: account.platform || 'openai'
        })
      })
    }
    if (props.accounts.openaiResponses) {
      props.accounts.openaiResponses.forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: account.platform || 'openai-responses'
        })
      })
    }

    localAccounts.value = {
      claude: props.accounts.claude || [],
      gemini: geminiAccounts,
      openai: openaiAccounts,
      bedrock: props.accounts.bedrock || [],
      droid: (props.accounts.droid || []).map((account) => ({
        ...account,
        platform: account.platform || 'droid'
      })),
      claudeGroups: props.accounts.claudeGroups || [],
      geminiGroups: props.accounts.geminiGroups || [],
      openaiGroups: props.accounts.openaiGroups || [],
      droidGroups: props.accounts.droidGroups || []
    }
  }

  // 使用缓存的账号数据，不自动刷新（用户可点击"刷新账号"按钮手动刷新）

  form.name = props.apiKey.name

  // 处理速率限制迁移：如果有tokenLimit且没有rateLimitCost，提示用户
  form.tokenLimit = props.apiKey.tokenLimit || ''
  form.rateLimitCost = props.apiKey.rateLimitCost || ''

  // 如果有历史tokenLimit但没有rateLimitCost，提示用户需要重新设置
  if (props.apiKey.tokenLimit > 0 && !props.apiKey.rateLimitCost) {
    // 可以根据需要添加提示，或者自动迁移（这里选择让用户手动设置）
    // console.log('检测到历史Token限制，请考虑设置费用限制')
  }

  form.rateLimitWindow = props.apiKey.rateLimitWindow || ''
  form.rateLimitRequests = props.apiKey.rateLimitRequests || ''
  form.concurrencyLimit = props.apiKey.concurrencyLimit || ''
  form.dailyCostLimit = props.apiKey.dailyCostLimit || ''
  form.totalCostLimit = props.apiKey.totalCostLimit || ''
  form.weeklyOpusCostLimit = props.apiKey.weeklyOpusCostLimit || ''
  form.permissions = props.apiKey.permissions || 'all'
  // 处理 Claude 账号（区分 OAuth 和 Console）
  if (props.apiKey.claudeConsoleAccountId) {
    form.claudeAccountId = `console:${props.apiKey.claudeConsoleAccountId}`
  } else {
    form.claudeAccountId = props.apiKey.claudeAccountId || ''
  }
  form.geminiAccountId = props.apiKey.geminiAccountId || ''

  // 处理 OpenAI 账号 - 直接使用后端传来的值（已包含 responses: 前缀）
  form.openaiAccountId = props.apiKey.openaiAccountId || ''

  form.bedrockAccountId = props.apiKey.bedrockAccountId || ''
  form.droidAccountId = props.apiKey.droidAccountId || ''
  form.restrictedModels = props.apiKey.restrictedModels || []
  form.allowedClients = props.apiKey.allowedClients || []
  form.tags = props.apiKey.tags || []
  // 从后端数据中获取实际的启用状态，强制转换为布尔值（Redis返回的是字符串）
  form.enableModelRestriction =
    props.apiKey.enableModelRestriction === true || props.apiKey.enableModelRestriction === 'true'
  form.enableClientRestriction =
    props.apiKey.enableClientRestriction === true || props.apiKey.enableClientRestriction === 'true'
  // 初始化活跃状态，默认为 true（强制转换为布尔值，因为Redis返回字符串）
  form.isActive =
    props.apiKey.isActive === undefined ||
    props.apiKey.isActive === true ||
    props.apiKey.isActive === 'true'

  // 初始化所有者
  form.ownerId = props.apiKey.userId || 'admin'

  // 初始化 sessionCollection
  const sc = props.apiKey.sessionCollection || {}
  form.sessionCollection = {
    enabled: sc.enabled === true || sc.enabled === 'true',
    priority: parseInt(sc.priority) || 1,
    quota: sc.quota !== undefined ? parseInt(sc.quota) : -1,
    collectedCount: parseInt(sc.collectedCount) || 0,
    lastCollectedAt: sc.lastCollectedAt || null
  }
})

// 格式化日期
const formatDate = (dateString) => {
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
</script>
