<template>
  <PageContainer max-width="7xl">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">系统设置</h1>
          <p class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">网站定制和通知配置</p>
        </div>
      </div>
    </template>

    <!-- 加载状态 -->
    <Card v-if="loading" class="mb-8">
      <div class="flex items-center justify-center p-12">
        <div
          class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400"
        ></div>
        <p class="ml-3 text-gray-600 dark:text-gray-400">正在加载设置...</p>
      </div>
    </Card>

    <!-- 设置内容 -->
    <div v-else>
      <!-- 品牌设置部分 -->
      <Card v-show="activeSection === 'branding'" class="mb-8">
        <!-- Tab 导航 -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav aria-label="Settings Tabs" class="flex gap-8 px-6">
            <button
              class="relative flex items-center gap-2 border-b-2 px-1 pb-4 pt-4 text-sm font-medium transition-colors"
              :class="
                activeSection === 'branding'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
              "
              @click="activeSection = 'branding'"
            >
              <Icon class="h-4 w-4" name="Palette" />
              品牌设置
            </button>
            <button
              class="relative flex items-center gap-2 border-b-2 px-1 pb-4 pt-4 text-sm font-medium transition-colors"
              :class="
                activeSection === 'webhook'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
              "
              @click="activeSection = 'webhook'"
            >
              <Icon class="h-4 w-4" name="Bell" />
              通知设置
            </button>
          </nav>
        </div>
        <!-- 桌面端表格视图 -->
        <div class="hidden overflow-hidden md:block">
          <table class="w-full">
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <!-- 网站名称 -->
              <tr>
                <td class="w-1/3 p-6">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
                    >
                      <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="Type" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">网站名称</div>
                      <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">品牌标识</div>
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <input
                    v-model="oemSettings.siteName"
                    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                    maxlength="100"
                    placeholder="Claude Relay Service"
                    type="text"
                  />
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    将显示在浏览器标题和页面头部
                  </p>
                </td>
              </tr>

              <!-- 网站图标 -->
              <tr>
                <td class="w-1/3 p-6">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
                    >
                      <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="Image" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">网站图标</div>
                      <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">Favicon</div>
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <div class="space-y-4">
                    <!-- 图标预览 -->
                    <div
                      v-if="oemSettings.siteIconData || oemSettings.siteIcon"
                      class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <img
                        alt="图标预览"
                        class="h-8 w-8 rounded"
                        :src="oemSettings.siteIconData || oemSettings.siteIcon"
                        @error="handleIconError"
                      />
                      <span class="flex-1 text-sm text-gray-600 dark:text-gray-400">当前图标</span>
                      <button
                        class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        @click="removeIcon"
                      >
                        <Icon class="h-4 w-4" name="Trash" />
                        删除
                      </button>
                    </div>

                    <!-- 文件上传 -->
                    <div class="space-y-2">
                      <input
                        ref="iconFileInput"
                        accept=".ico,.png,.jpg,.jpeg,.svg"
                        class="hidden"
                        type="file"
                        @change="handleIconUpload"
                      />
                      <button
                        class="flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                        @click="$refs.iconFileInput.click()"
                      >
                        <Icon class="h-4 w-4" name="Upload" />
                        上传图标
                      </button>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        支持 .ico, .png, .jpg, .svg 格式，最大 350KB
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- 管理后台按钮显示控制 -->
              <tr>
                <td class="w-1/3 p-6">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
                    >
                      <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="EyeOff" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">管理入口</div>
                      <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        管理后台按钮显示
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <div class="space-y-3">
                    <Switch
                      v-model="hideAdminButton"
                      :label="hideAdminButton ? '已隐藏管理后台按钮' : '显示管理后台按钮'"
                    />
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      隐藏后，管理后台入口按钮将不会显示在首页
                    </p>
                  </div>
                </td>
              </tr>

              <!-- 操作按钮 -->
              <tr>
                <td class="bg-gray-50 p-6 dark:bg-gray-800/50" colspan="2">
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex flex-wrap gap-3">
                      <button
                        class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
                        :disabled="saving"
                        @click="saveOemSettings"
                      >
                        <div
                          v-if="saving"
                          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        ></div>
                        <Icon v-else class="h-4 w-4" name="Save" />
                        {{ saving ? '保存中...' : '保存设置' }}
                      </button>

                      <button
                        class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-800"
                        :disabled="saving"
                        @click="resetOemSettings"
                      >
                        <Icon class="h-4 w-4" name="RotateCcw" />
                        重置为默认
                      </button>
                    </div>

                    <div
                      v-if="oemSettings.updatedAt"
                      class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <Icon class="h-4 w-4" name="Clock" />
                      最后更新：{{ formatDateTime(oemSettings.updatedAt) }}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 移动端卡片视图 -->
        <div class="space-y-4 md:hidden">
          <!-- 站点名称卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="mb-3 flex items-start gap-3">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
              >
                <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="Tag" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">站点名称</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">自定义您的站点品牌名称</p>
              </div>
            </div>
            <input
              v-model="oemSettings.siteName"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
              maxlength="100"
              placeholder="Claude Relay Service"
              type="text"
            />
          </div>

          <!-- 站点图标卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="mb-3 flex items-start gap-3">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
              >
                <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="Image" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">站点图标</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  上传自定义图标或输入图标URL
                </p>
              </div>
            </div>
            <div class="space-y-3">
              <!-- 图标预览 -->
              <div
                v-if="oemSettings.siteIconData || oemSettings.siteIcon"
                class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <img
                  alt="图标预览"
                  class="h-8 w-8 rounded"
                  :src="oemSettings.siteIconData || oemSettings.siteIcon"
                  @error="handleIconError"
                />
                <span class="flex-1 text-sm text-gray-600 dark:text-gray-400">当前图标</span>
                <button
                  class="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  @click="removeIcon"
                >
                  删除
                </button>
              </div>

              <!-- 上传按钮 -->
              <div class="space-y-2">
                <input
                  ref="iconFileInputMobile"
                  accept=".ico,.png,.jpg,.jpeg,.svg"
                  class="hidden"
                  type="file"
                  @change="handleIconUpload"
                />
                <button
                  class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                  @click="$refs.iconFileInputMobile.click()"
                >
                  <Icon class="h-4 w-4" name="Upload" />
                  上传图标
                </button>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  支持 .ico, .png, .jpg, .svg 格式，最大 350KB
                </p>
              </div>
            </div>
          </div>

          <!-- 管理后台按钮显示控制卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="mb-3 flex items-start gap-3">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
              >
                <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="EyeOff" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">管理入口</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  控制管理后台按钮在首页的显示
                </p>
              </div>
            </div>
            <div class="space-y-2">
              <Switch
                v-model="hideAdminButton"
                :label="hideAdminButton ? '已隐藏管理后台按钮' : '显示管理后台按钮'"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                隐藏后，管理后台入口按钮将不会显示在首页
              </p>
            </div>
          </div>

          <!-- 操作按钮卡片 -->
          <div
            class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div class="space-y-3">
              <button
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
                :disabled="saving"
                @click="saveOemSettings"
              >
                <div
                  v-if="saving"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <Icon v-else class="h-4 w-4" name="Save" />
                {{ saving ? '保存中...' : '保存设置' }}
              </button>

              <button
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:disabled:bg-gray-800"
                :disabled="saving"
                @click="resetOemSettings"
              >
                <Icon class="h-4 w-4" name="RotateCcw" />
                重置为默认
              </button>

              <div
                v-if="oemSettings.updatedAt"
                class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <Icon class="h-4 w-4" name="Clock" />
                上次更新: {{ formatDateTime(oemSettings.updatedAt) }}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Webhook 设置部分 -->
      <Card v-show="activeSection === 'webhook'" class="mb-8">
        <!-- Tab 导航 -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav aria-label="Settings Tabs" class="flex gap-8 px-6">
            <button
              class="relative flex items-center gap-2 border-b-2 px-1 pb-4 pt-4 text-sm font-medium transition-colors"
              :class="
                activeSection === 'branding'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
              "
              @click="activeSection = 'branding'"
            >
              <Icon class="h-4 w-4" name="Palette" />
              品牌设置
            </button>
            <button
              class="relative flex items-center gap-2 border-b-2 px-1 pb-4 pt-4 text-sm font-medium transition-colors"
              :class="
                activeSection === 'webhook'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200'
              "
              @click="activeSection = 'webhook'"
            >
              <Icon class="h-4 w-4" name="Bell" />
              通知设置
            </button>
          </nav>
        </div>

        <!-- 主开关 -->
        <div class="border-b border-gray-200 p-6 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">启用通知</h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                开启后，系统将按配置发送通知到指定平台
              </p>
            </div>
            <Switch
              v-model="webhookConfig.enabled"
              size="lg"
              @update:model-value="saveWebhookConfig"
            />
          </div>
        </div>

        <!-- 通知类型设置 -->
        <div class="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">通知类型</h2>
          <div class="space-y-3">
            <div
              v-for="(enabled, type) in webhookConfig.notificationTypes"
              :key="type"
              class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div class="flex-1">
                <span class="block text-sm font-medium text-gray-900 dark:text-white">
                  {{ getNotificationTypeName(type) }}
                </span>
                <span class="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  {{ getNotificationTypeDescription(type) }}
                </span>
              </div>
              <Switch
                v-model="webhookConfig.notificationTypes[type]"
                @update:model-value="saveWebhookConfig"
              />
            </div>
          </div>
        </div>

        <!-- 平台列表 -->
        <div class="border-b border-gray-200 p-6 dark:border-gray-700">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">通知平台</h2>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
              @click="showAddPlatformModal = true"
            >
              <Icon class="h-4 w-4" name="Plus" />
              添加平台
            </button>
          </div>

          <!-- 平台卡片列表 -->
          <div
            v-if="webhookConfig.platforms && webhookConfig.platforms.length > 0"
            class="space-y-4"
          >
            <div
              v-for="platform in webhookConfig.platforms"
              :key="platform.id"
              class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div class="flex-1 space-y-3">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20"
                    >
                      <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="Bell" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                        {{ platform.name || getPlatformName(platform.type) }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{ getPlatformName(platform.type) }}
                      </p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-if="platform.type !== 'smtp' && platform.type !== 'telegram'"
                      class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Icon class="h-4 w-4 flex-shrink-0" name="Link" />
                      <span class="truncate">{{ platform.url }}</span>
                    </div>
                    <div
                      v-if="platform.type === 'telegram'"
                      class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Icon class="h-4 w-4 flex-shrink-0" name="MessagesSquare" />
                      <span>Chat ID: {{ platform.chatId || '未配置' }}</span>
                    </div>
                    <div
                      v-if="platform.type === 'telegram' && platform.botToken"
                      class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Icon class="h-4 w-4 flex-shrink-0" name="Key" />
                      <span>Token: {{ formatTelegramToken(platform.botToken) }}</span>
                    </div>
                    <div
                      v-if="platform.type === 'telegram' && platform.apiBaseUrl"
                      class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Icon class="h-4 w-4 flex-shrink-0" name="Globe" />
                      <span class="truncate">API: {{ platform.apiBaseUrl }}</span>
                    </div>
                    <div
                      v-if="platform.type === 'telegram' && platform.proxyUrl"
                      class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Icon class="h-4 w-4 flex-shrink-0" name="Route" />
                      <span class="truncate">代理: {{ platform.proxyUrl }}</span>
                    </div>
                    <div
                      v-if="platform.type === 'smtp' && platform.to"
                      class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Icon class="h-4 w-4 flex-shrink-0" name="Mail" />
                      <span class="truncate">{{
                        Array.isArray(platform.to) ? platform.to.join(', ') : platform.to
                      }}</span>
                    </div>
                    <div
                      v-if="platform.enableSign"
                      class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                    >
                      <Icon class="h-4 w-4 flex-shrink-0" name="Shield" />
                      <span>已启用签名验证</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-row items-center gap-2 md:flex-col md:items-end">
                  <!-- 启用/禁用开关 -->
                  <Switch
                    :model-value="platform.enabled"
                    @update:model-value="togglePlatform(platform.id)"
                  />
                  <div class="flex items-center gap-1">
                    <!-- 测试按钮 -->
                    <button
                      class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      title="测试连接"
                      @click="testPlatform(platform)"
                    >
                      <Icon class="h-4 w-4" name="TestTube" />
                    </button>
                    <!-- 编辑按钮 -->
                    <button
                      class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      title="编辑"
                      @click="editPlatform(platform)"
                    >
                      <Icon class="h-4 w-4" name="Edit" />
                    </button>
                    <!-- 删除按钮 -->
                    <button
                      class="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      title="删除"
                      @click="deletePlatform(platform.id)"
                    >
                      <Icon class="h-4 w-4" name="Trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800/50"
          >
            <p class="text-sm text-gray-600 dark:text-gray-400">
              暂无配置的通知平台，请点击"添加平台"按钮添加
            </p>
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">高级设置</h2>
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                for="maxRetries"
              >
                最大重试次数
              </label>
              <input
                id="maxRetries"
                v-model.number="webhookConfig.retrySettings.maxRetries"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                max="10"
                min="0"
                type="number"
                @change="saveWebhookConfig"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">0-10次</p>
            </div>
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                for="retryDelay"
              >
                重试延迟 (毫秒)
              </label>
              <input
                id="retryDelay"
                v-model.number="webhookConfig.retrySettings.retryDelay"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                max="10000"
                min="100"
                step="100"
                type="number"
                @change="saveWebhookConfig"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">100-10000ms</p>
            </div>
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                for="timeout"
              >
                超时时间 (毫秒)
              </label>
              <input
                id="timeout"
                v-model.number="webhookConfig.retrySettings.timeout"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400"
                max="30000"
                min="1000"
                step="1000"
                type="number"
                @change="saveWebhookConfig"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">1000-30000ms</p>
            </div>
          </div>
        </div>

        <!-- 测试通知按钮 -->
        <div class="border-t border-gray-200 p-6 dark:border-gray-700">
          <button
            class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            @click="sendTestNotification"
          >
            <Icon class="h-4 w-4" name="Send" />
            发送测试通知
          </button>
        </div>
      </Card>
    </div>
  </PageContainer>

  <!-- 添加/编辑平台模态框 -->
  <BaseModal
    icon="Bell"
    :show="showAddPlatformModal"
    size="4xl"
    :title="`${editingPlatform ? '编辑' : '添加'}通知平台`"
    @close="closePlatformModal"
  >
    <!-- 模态框副标题 -->
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30"
        >
          <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="Bell" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingPlatform ? '编辑' : '添加' }}通知平台
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            配置{{ editingPlatform ? '并更新' : '新的' }}Webhook通知渠道
          </p>
        </div>
      </div>
    </template>

    <!-- 内容区域 -->
    <div class="space-y-6">
      <!-- 平台类型选择 -->
      <div>
        <div class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Icon class="h-4 w-4" name="Layers" />
          平台类型
        </div>
        <Select
          v-model="platformForm.type"
          :disabled="editingPlatform"
          :options="[
            { value: 'wechat_work', label: '企业微信' },
            { value: 'dingtalk', label: '钉钉' },
            { value: 'feishu', label: '飞书' },
            { value: 'slack', label: 'Slack' },
            { value: 'discord', label: 'Discord' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'bark', label: 'Bark' },
            { value: 'smtp', label: '邮件通知' },
            { value: 'custom', label: '自定义' }
          ]"
          placeholder="选择平台类型"
        />
        <p
          v-if="editingPlatform"
          class="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400"
        >
          <Icon class="h-3.5 w-3.5" name="Info" />
          编辑模式下不能更改平台类型
        </p>
      </div>

      <!-- 平台名称 -->
      <div>
        <label
          class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Icon class="h-4 w-4" name="Tag" />
          名称
          <span class="text-xs font-normal text-gray-500">(可选)</span>
        </label>
        <input
          v-model="platformForm.name"
          class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          placeholder="例如：运维群通知、开发测试群"
          type="text"
        />
      </div>

      <!-- Webhook URL (非Bark和SMTP平台) -->
      <div
        v-if="
          platformForm.type !== 'bark' &&
          platformForm.type !== 'smtp' &&
          platformForm.type !== 'telegram'
        "
      >
        <label
          class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Icon class="h-4 w-4" name="Link" />
          Webhook URL
          <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model="platformForm.url"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="https://..."
            required
            type="url"
            @input="validateUrl"
          />
          <div
            v-if="urlValid"
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <Icon class="h-5 w-5 text-green-500" name="CheckCircle" />
          </div>
          <div
            v-if="urlError"
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <Icon class="h-5 w-5 text-red-500" name="AlertCircle" />
          </div>
        </div>
        <div
          v-if="getWebhookHint(platformForm.type)"
          class="mt-1.5 flex items-start gap-1.5 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
        >
          <Icon class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" name="Info" />
          <p class="text-xs text-blue-700 dark:text-blue-300">
            {{ getWebhookHint(platformForm.type) }}
          </p>
        </div>
      </div>

      <!-- Telegram 平台特有字段 -->
      <div v-if="platformForm.type === 'telegram'">
        <div>
          <label>
            <Icon name="Bot" />
            Bot Token
            <span>*</span>
          </label>
          <input
            v-model="platformForm.botToken"
            placeholder="例如：123456789:ABCDEFghijk-xyz"
            required
            type="text"
          />
          <p>在 Telegram 的 @BotFather 中创建机器人后获得的 Token</p>
        </div>

        <div>
          <label>
            <Icon name="MessagesSquare" />
            Chat ID
            <span>*</span>
          </label>
          <input
            v-model="platformForm.chatId"
            placeholder="例如：123456789 或 -1001234567890"
            required
            type="text"
          />
          <p>可使用 @userinfobot、@RawDataBot 或 API 获取聊天/频道的 Chat ID</p>
        </div>

        <div>
          <label>
            <Icon name="Globe" />
            API 基础地址
            <span>(可选)</span>
          </label>
          <input
            v-model="platformForm.apiBaseUrl"
            placeholder="默认: https://api.telegram.org"
            type="url"
          />
          <p>使用自建 Bot API 时可覆盖默认域名，需以 http 或 https 开头</p>
        </div>

        <div>
          <label>
            <Icon name="Route" />
            代理地址
            <span>(可选)</span>
          </label>
          <input
            v-model="platformForm.proxyUrl"
            placeholder="例如：socks5://user:pass@127.0.0.1:1080"
            type="text"
          />
          <p>支持 http、https、socks4/4a/5 代理，留空则直接连接 Telegram 官方 API</p>
        </div>

        <div>
          <Icon name="Info" />
          <div>机器人需先加入对应群组或频道并授予发送消息权限，通知会以纯文本方式发送。</div>
        </div>
      </div>

      <!-- Bark 平台特有字段 -->
      <div v-if="platformForm.type === 'bark'">
        <!-- 设备密钥 -->
        <div>
          <label>
            <Icon name="Key" />
            设备密钥 (Device Key)
            <span>*</span>
          </label>
          <input
            v-model="platformForm.deviceKey"
            placeholder="例如：aBcDeFgHiJkLmNoPqRsTuVwX"
            required
            type="text"
          />
          <p>在Bark App中查看您的推送密钥</p>
        </div>

        <!-- 服务器URL（可选） -->
        <div>
          <label>
            <Icon name="Server" />
            服务器地址
            <span>(可选)</span>
          </label>
          <input
            v-model="platformForm.serverUrl"
            placeholder="默认: https://api.day.app/push"
            type="url"
          />
        </div>

        <!-- 通知级别 -->
        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Icon class="h-4 w-4" name="Flag" />
            通知级别
          </div>
          <Select
            v-model="platformForm.level"
            :options="[
              { value: '', label: '自动（根据通知类型）' },
              { value: 'passive', label: '被动' },
              { value: 'active', label: '默认' },
              { value: 'timeSensitive', label: '时效性' },
              { value: 'critical', label: '紧急' }
            ]"
            placeholder="选择通知级别"
          />
        </div>

        <!-- 通知声音 -->
        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Icon class="h-4 w-4" name="Volume2" />
            通知声音
          </div>
          <Select
            v-model="platformForm.sound"
            :options="[
              { value: '', label: '自动（根据通知类型）' },
              { value: 'default', label: '默认' },
              { value: 'alarm', label: '警报' },
              { value: 'bell', label: '铃声' },
              { value: 'birdsong', label: '鸟鸣' },
              { value: 'electronic', label: '电子音' },
              { value: 'glass', label: '玻璃' },
              { value: 'horn', label: '喇叭' },
              { value: 'silence', label: '静音' }
            ]"
            placeholder="选择通知声音"
          />
        </div>

        <!-- 分组 -->
        <div>
          <label>
            <Icon name="Folder" />
            通知分组
            <span>(可选)</span>
          </label>
          <input v-model="platformForm.group" placeholder="默认: claude-relay" type="text" />
        </div>

        <!-- 提示信息 -->
        <div>
          <Icon name="Info" />
          <div>
            <p>1. 在iPhone上安装Bark App</p>
            <p>2. 打开App获取您的设备密钥</p>
            <p>3. 将密钥粘贴到上方输入框</p>
          </div>
        </div>
      </div>

      <!-- SMTP 平台特有字段 -->
      <div v-if="platformForm.type === 'smtp'">
        <!-- SMTP 主机 -->
        <div>
          <label>
            <Icon name="Server" />
            SMTP 服务器
            <span>*</span>
          </label>
          <input
            v-model="platformForm.host"
            placeholder="例如: smtp.gmail.com"
            required
            type="text"
          />
        </div>

        <!-- SMTP 端口和安全设置 -->
        <div>
          <div>
            <label>
              <Icon name="Plug" />
              端口
            </label>
            <input
              v-model.number="platformForm.port"
              max="65535"
              min="1"
              placeholder="587"
              type="number"
            />
            <p>默认: 587 (TLS) 或 465 (SSL)</p>
          </div>

          <div>
            <div class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Icon class="h-4 w-4" name="Shield" />
              加密方式
            </div>
            <Select
              v-model="platformForm.secure"
              :options="[
                { value: false, label: 'STARTTLS (端口587)' },
                { value: true, label: 'SSL/TLS (端口465)' }
              ]"
              placeholder="选择加密方式"
            />
          </div>
        </div>

        <!-- 用户名 -->
        <div>
          <label>
            <Icon name="User" />
            用户名
            <span>*</span>
          </label>
          <input v-model="platformForm.user" placeholder="user@example.com" required type="email" />
        </div>

        <!-- 密码 -->
        <div>
          <label>
            <Icon name="Lock" />
            密码 / 应用密码
            <span>*</span>
          </label>
          <input
            v-model="platformForm.pass"
            placeholder="邮箱密码或应用专用密码"
            required
            type="password"
          />
          <p>建议使用应用专用密码，而非邮箱登录密码</p>
        </div>

        <!-- 发件人邮箱 -->
        <div>
          <label>
            <Icon name="Send" />
            发件人邮箱
            <span>(可选)</span>
          </label>
          <input v-model="platformForm.from" placeholder="默认使用用户名邮箱" type="email" />
        </div>

        <!-- 收件人邮箱 -->
        <div>
          <label>
            <Icon name="Mail" />
            收件人邮箱
            <span>*</span>
          </label>
          <input v-model="platformForm.to" placeholder="admin@example.com" required type="email" />
          <p>接收通知的邮箱地址</p>
        </div>
      </div>

      <!-- 签名设置（钉钉/飞书） -->
      <div v-if="platformForm.type === 'dingtalk' || platformForm.type === 'feishu'">
        <div>
          <div>
            <label for="enableSign">
              <input id="enableSign" v-model="platformForm.enableSign" type="checkbox" />
              <span>
                <Icon name="Shield" />
                启用签名验证
              </span>
            </label>
            <span v-if="platformForm.enableSign"> 已启用 </span>
          </div>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div v-if="platformForm.enableSign">
              <label> 签名密钥 </label>
              <input v-model="platformForm.secret" placeholder="SEC..." type="text" />
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Icon class="h-3.5 w-3.5" name="Asterisk" />
          <span>必填项</span>
        </div>
        <div class="flex gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            type="button"
            @click="closePlatformModal"
          >
            <Icon class="h-4 w-4" name="X" />
            取消
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary-500 dark:bg-gray-800 dark:text-primary-400 dark:hover:bg-primary-900/20"
            :disabled="testingConnection"
            type="button"
            @click="testPlatformForm"
          >
            <Icon class="h-4 w-4" :class="{ 'animate-spin': testingConnection }" name="Loader2" />
            {{ testingConnection ? '测试中...' : '测试连接' }}
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
            :disabled="!isPlatformFormValid || savingPlatform"
            type="button"
            @click="savePlatform"
          >
            <Icon class="h-4 w-4" :class="{ 'animate-spin': savingPlatform }" name="Loader2" />
            {{ savingPlatform ? '保存中...' : editingPlatform ? '保存修改' : '添加平台' }}
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { showToast } from '@/utils/toast'
import { useSettingsStore } from '@/stores/settings'
import { apiClient } from '@/config/api'
import { Card, Select } from '@/ui'
import Switch from '@/ui/Switch.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import BaseModal from '@/components/common/BaseModal.vue'

// 定义组件名称，用于keep-alive排除
defineOptions({
  name: 'SettingsView'
})

// 使用settings store
const settingsStore = useSettingsStore()
const { loading, saving, oemSettings } = storeToRefs(settingsStore)

// 组件refs
const iconFileInput = ref()

// 当前激活的设置部分
const activeSection = ref('branding')

// 组件挂载状态
const isMounted = ref(true)

// API请求取消控制器
const abortController = ref(new AbortController())

// 计算属性：隐藏管理后台按钮（反转 showAdminButton 的值）
const hideAdminButton = computed({
  get() {
    return !oemSettings.value.showAdminButton
  },
  set(value) {
    oemSettings.value.showAdminButton = !value
  }
})

// URL 验证状态
const urlError = ref(false)
const urlValid = ref(false)
const testingConnection = ref(false)
const savingPlatform = ref(false)

// Webhook 配置
const DEFAULT_WEBHOOK_NOTIFICATION_TYPES = {
  accountAnomaly: true,
  quotaWarning: true,
  systemError: true,
  securityAlert: true,
  rateLimitRecovery: true
}

const webhookConfig = ref({
  enabled: false,
  platforms: [],
  notificationTypes: { ...DEFAULT_WEBHOOK_NOTIFICATION_TYPES },
  retrySettings: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000
  }
})

// 平台表单相关
const showAddPlatformModal = ref(false)
const editingPlatform = ref(null)
const platformForm = ref({
  type: 'wechat_work',
  name: '',
  url: '',
  enableSign: false,
  secret: '',
  // Telegram特有字段
  botToken: '',
  chatId: '',
  apiBaseUrl: '',
  proxyUrl: '',
  // Bark特有字段
  deviceKey: '',
  serverUrl: '',
  level: '',
  sound: '',
  group: '',
  // SMTP特有字段
  host: '',
  port: null,
  secure: false,
  user: '',
  pass: '',
  from: '',
  to: '',
  timeout: null,
  ignoreTLS: false
})

// 监听activeSection变化，加载对应配置
const sectionWatcher = watch(activeSection, async (newSection) => {
  if (!isMounted.value) return
  if (newSection === 'webhook') {
    await loadWebhookConfig()
  }
})

// 监听平台类型变化，重置验证状态
const platformTypeWatcher = watch(
  () => platformForm.value.type,
  (newType) => {
    // 切换平台类型时重置验证状态
    urlError.value = false
    urlValid.value = false

    // 如果不是编辑模式，清空相关字段
    if (!editingPlatform.value) {
      if (newType === 'bark') {
        // 切换到Bark时，清空URL和SMTP相关字段
        platformForm.value.url = ''
        platformForm.value.enableSign = false
        platformForm.value.secret = ''
        // 清空Telegram字段
        platformForm.value.botToken = ''
        platformForm.value.chatId = ''
        platformForm.value.apiBaseUrl = ''
        platformForm.value.proxyUrl = ''
        // 清空SMTP字段
        platformForm.value.host = ''
        platformForm.value.port = null
        platformForm.value.secure = false
        platformForm.value.user = ''
        platformForm.value.pass = ''
        platformForm.value.from = ''
        platformForm.value.to = ''
        platformForm.value.timeout = null
        platformForm.value.ignoreTLS = false
      } else if (newType === 'smtp') {
        // 切换到SMTP时，清空URL和Bark相关字段
        platformForm.value.url = ''
        platformForm.value.enableSign = false
        platformForm.value.secret = ''
        // 清空Bark字段
        platformForm.value.deviceKey = ''
        platformForm.value.serverUrl = ''
        platformForm.value.level = ''
        platformForm.value.sound = ''
        platformForm.value.group = ''
        // 清空Telegram字段
        platformForm.value.botToken = ''
        platformForm.value.chatId = ''
        platformForm.value.apiBaseUrl = ''
        platformForm.value.proxyUrl = ''
      } else if (newType === 'telegram') {
        platformForm.value.url = ''
        platformForm.value.enableSign = false
        platformForm.value.secret = ''
        platformForm.value.deviceKey = ''
        platformForm.value.serverUrl = ''
        platformForm.value.level = ''
        platformForm.value.sound = ''
        platformForm.value.group = ''
        platformForm.value.host = ''
        platformForm.value.port = null
        platformForm.value.secure = false
        platformForm.value.user = ''
        platformForm.value.pass = ''
        platformForm.value.from = ''
        platformForm.value.to = ''
        platformForm.value.timeout = null
        platformForm.value.ignoreTLS = false
        platformForm.value.botToken = ''
        platformForm.value.chatId = ''
        platformForm.value.apiBaseUrl = ''
        platformForm.value.proxyUrl = ''
      } else {
        // 切换到其他平台时，清空Bark和SMTP相关字段
        platformForm.value.deviceKey = ''
        platformForm.value.serverUrl = ''
        platformForm.value.level = ''
        platformForm.value.sound = ''
        platformForm.value.group = ''
        // SMTP 字段
        platformForm.value.host = ''
        platformForm.value.port = null
        platformForm.value.secure = false
        platformForm.value.user = ''
        platformForm.value.pass = ''
        platformForm.value.from = ''
        platformForm.value.to = ''
        platformForm.value.timeout = null
        platformForm.value.ignoreTLS = false
        // Telegram 字段
        platformForm.value.botToken = ''
        platformForm.value.chatId = ''
        platformForm.value.apiBaseUrl = ''
        platformForm.value.proxyUrl = ''
      }
    }
  }
)

// 计算属性：判断平台表单是否有效
const isPlatformFormValid = computed(() => {
  if (platformForm.value.type === 'bark') {
    // Bark平台需要deviceKey
    return !!platformForm.value.deviceKey
  } else if (platformForm.value.type === 'telegram') {
    // Telegram需要机器人Token和Chat ID
    return !!(platformForm.value.botToken && platformForm.value.chatId)
  } else if (platformForm.value.type === 'smtp') {
    // SMTP平台需要必要的配置
    return !!(
      platformForm.value.host &&
      platformForm.value.user &&
      platformForm.value.pass &&
      platformForm.value.to
    )
  } else {
    // 其他平台需要URL且URL格式正确
    return !!platformForm.value.url && !urlError.value
  }
})

// 页面加载时获取设置
onMounted(async () => {
  try {
    await settingsStore.loadOemSettings()
    if (activeSection.value === 'webhook') {
      await loadWebhookConfig()
    }
  } catch (error) {
    showToast('加载设置失败', 'error')
  }
})

// 组件卸载前清理
onBeforeUnmount(() => {
  // 设置组件未挂载状态
  isMounted.value = false

  // 取消所有API请求
  if (abortController.value) {
    abortController.value.abort()
  }

  // 停止watch监听器
  if (sectionWatcher) {
    sectionWatcher()
  }
  if (platformTypeWatcher) {
    platformTypeWatcher()
  }

  // 安全关闭模态框
  if (showAddPlatformModal.value) {
    showAddPlatformModal.value = false
    editingPlatform.value = null
  }
})

// Webhook 相关函数

// 获取webhook配置
const loadWebhookConfig = async () => {
  if (!isMounted.value) return
  try {
    const response = await apiClient.get('/admin/webhook/config', {
      signal: abortController.value.signal
    })
    if (response.success && isMounted.value) {
      const config = response.config || {}
      webhookConfig.value = {
        ...config,
        notificationTypes: {
          ...DEFAULT_WEBHOOK_NOTIFICATION_TYPES,
          ...(config.notificationTypes || {})
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    showToast('获取webhook配置失败', 'error')
    console.error(error)
  }
}

// 保存webhook配置
const saveWebhookConfig = async () => {
  if (!isMounted.value) return
  try {
    const payload = {
      ...webhookConfig.value,
      notificationTypes: {
        ...DEFAULT_WEBHOOK_NOTIFICATION_TYPES,
        ...(webhookConfig.value.notificationTypes || {})
      }
    }

    const response = await apiClient.post('/admin/webhook/config', payload, {
      signal: abortController.value.signal
    })
    if (response.success && isMounted.value) {
      webhookConfig.value = payload
      showToast('配置已保存', 'success')
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    showToast('保存配置失败', 'error')
    console.error(error)
  }
}

// 验证 URL
const validateUrl = () => {
  // Bark和SMTP平台不需要验证URL
  if (['bark', 'smtp', 'telegram'].includes(platformForm.value.type)) {
    urlError.value = false
    urlValid.value = false
    return
  }

  const url = platformForm.value.url
  if (!url) {
    urlError.value = false
    urlValid.value = false
    return
  }

  try {
    new URL(url)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urlError.value = false
      urlValid.value = true
    } else {
      urlError.value = true
      urlValid.value = false
    }
  } catch {
    urlError.value = true
    urlValid.value = false
  }
}

// 验证平台配置
const validatePlatformForm = () => {
  if (platformForm.value.type === 'bark') {
    if (!platformForm.value.deviceKey) {
      showToast('请输入Bark设备密钥', 'error')
      return false
    }
  } else if (platformForm.value.type === 'telegram') {
    if (!platformForm.value.botToken) {
      showToast('请输入 Telegram 机器人 Token', 'error')
      return false
    }
    if (!platformForm.value.chatId) {
      showToast('请输入 Telegram Chat ID', 'error')
      return false
    }
    if (platformForm.value.apiBaseUrl) {
      try {
        const parsed = new URL(platformForm.value.apiBaseUrl)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          showToast('Telegram API 基础地址仅支持 http 或 https', 'error')
          return false
        }
      } catch (error) {
        showToast('请输入有效的 Telegram API 基础地址', 'error')
        return false
      }
    }
    if (platformForm.value.proxyUrl) {
      try {
        const parsed = new URL(platformForm.value.proxyUrl)
        const supportedProtocols = ['http:', 'https:', 'socks4:', 'socks4a:', 'socks5:']
        if (!supportedProtocols.includes(parsed.protocol)) {
          showToast('Telegram 代理仅支持 http/https/socks 协议', 'error')
          return false
        }
      } catch (error) {
        showToast('请输入有效的 Telegram 代理地址', 'error')
        return false
      }
    }
  } else if (platformForm.value.type === 'smtp') {
    const requiredFields = [
      { field: 'host', message: 'SMTP服务器' },
      { field: 'user', message: '用户名' },
      { field: 'pass', message: '密码' },
      { field: 'to', message: '收件人邮箱' }
    ]

    for (const { field, message } of requiredFields) {
      if (!platformForm.value[field]) {
        showToast(`请输入${message}`, 'error')
        return false
      }
    }
  } else {
    if (!platformForm.value.url) {
      showToast('请输入Webhook URL', 'error')
      return false
    }
    if (urlError.value) {
      showToast('请输入有效的Webhook URL', 'error')
      return false
    }
  }
  return true
}

// 添加/更新平台
const savePlatform = async () => {
  if (!isMounted.value) return

  // 验证表单
  if (!validatePlatformForm()) return

  savingPlatform.value = true
  try {
    let response
    if (editingPlatform.value) {
      // 更新平台
      response = await apiClient.put(
        `/admin/webhook/platforms/${editingPlatform.value.id}`,
        platformForm.value,
        { signal: abortController.value.signal }
      )
    } else {
      // 添加平台
      response = await apiClient.post('/admin/webhook/platforms', platformForm.value, {
        signal: abortController.value.signal
      })
    }

    if (response.success && isMounted.value) {
      showToast(editingPlatform.value ? '平台已更新' : '平台已添加', 'success')
      await loadWebhookConfig()
      closePlatformModal()
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    showToast(error.message || '操作失败', 'error')
    console.error(error)
  } finally {
    if (isMounted.value) {
      savingPlatform.value = false
    }
  }
}

// 编辑平台
const editPlatform = (platform) => {
  editingPlatform.value = platform
  platformForm.value = {
    type: platform.type || 'wechat_work',
    name: platform.name || '',
    url: platform.url || '',
    enableSign: platform.enableSign || false,
    secret: platform.secret || '',
    // Telegram特有字段
    botToken: platform.botToken || '',
    chatId: platform.chatId || '',
    apiBaseUrl: platform.apiBaseUrl || '',
    proxyUrl: platform.proxyUrl || '',
    // Bark特有字段
    deviceKey: platform.deviceKey || '',
    serverUrl: platform.serverUrl || '',
    level: platform.level || '',
    sound: platform.sound || '',
    group: platform.group || '',
    // SMTP特有字段
    host: platform.host || '',
    port: platform.port ?? null,
    secure: platform.secure || false,
    user: platform.user || '',
    pass: platform.pass || '',
    from: platform.from || '',
    to: Array.isArray(platform.to) ? platform.to.join(', ') : platform.to || '',
    timeout: platform.timeout ?? null,
    ignoreTLS: platform.ignoreTLS || false
  }
  showAddPlatformModal.value = true
}

// 删除平台
const deletePlatform = async (id) => {
  if (!isMounted.value) return

  if (!confirm('确定要删除这个平台吗？')) {
    return
  }

  try {
    const response = await apiClient.delete(`/admin/webhook/platforms/${id}`, {
      signal: abortController.value.signal
    })
    if (response.success && isMounted.value) {
      showToast('平台已删除', 'success')
      await loadWebhookConfig()
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    showToast('删除失败', 'error')
    console.error(error)
  }
}

// 切换平台状态
const togglePlatform = async (id) => {
  if (!isMounted.value) return

  try {
    const response = await apiClient.post(
      `/admin/webhook/platforms/${id}/toggle`,
      {},
      {
        signal: abortController.value.signal
      }
    )
    if (response.success && isMounted.value) {
      showToast(response.message, 'success')
      await loadWebhookConfig()
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    showToast('操作失败', 'error')
    console.error(error)
  }
}

// 测试平台
const testPlatform = async (platform) => {
  if (!isMounted.value) return

  try {
    const testData = {
      type: platform.type,
      secret: platform.secret,
      enableSign: platform.enableSign
    }

    // 根据平台类型添加不同字段
    if (platform.type === 'bark') {
      testData.deviceKey = platform.deviceKey
      testData.serverUrl = platform.serverUrl
      testData.level = platform.level
      testData.sound = platform.sound
      testData.group = platform.group
    } else if (platform.type === 'smtp') {
      testData.host = platform.host
      testData.port = platform.port
      testData.secure = platform.secure
      testData.user = platform.user
      testData.pass = platform.pass
      testData.from = platform.from
      testData.to = platform.to
      testData.ignoreTLS = platform.ignoreTLS
    } else if (platform.type === 'telegram') {
      testData.botToken = platform.botToken
      testData.chatId = platform.chatId
      testData.apiBaseUrl = platform.apiBaseUrl
      testData.proxyUrl = platform.proxyUrl
    } else {
      testData.url = platform.url
    }

    const response = await apiClient.post('/admin/webhook/test', testData, {
      signal: abortController.value.signal
    })
    if (response.success && isMounted.value) {
      showToast('测试成功', 'success')
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    showToast(error.error || error.message || '测试失败', 'error')
    console.error(error)
  }
}

// 测试表单中的平台
const testPlatformForm = async () => {
  if (!isMounted.value) return

  // 验证表单
  if (!validatePlatformForm()) return

  testingConnection.value = true
  try {
    const response = await apiClient.post('/admin/webhook/test', platformForm.value, {
      signal: abortController.value.signal
    })
    if (response.success && isMounted.value) {
      showToast('测试成功', 'success')
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    showToast(error.error || error.message || '测试失败', 'error')
    console.error(error)
  } finally {
    if (isMounted.value) {
      testingConnection.value = false
    }
  }
}

// 发送测试通知
const sendTestNotification = async () => {
  if (!isMounted.value) return

  try {
    const response = await apiClient.post(
      '/admin/webhook/test-notification',
      {},
      {
        signal: abortController.value.signal
      }
    )
    if (response.success && isMounted.value) {
      showToast('测试通知已发送', 'success')
    }
  } catch (error) {
    if (error.name === 'AbortError') return
    if (!isMounted.value) return
    const errorMessage =
      error?.response?.data?.message || error?.response?.data?.error || error?.message || '发送失败'
    showToast(errorMessage, 'error')
    console.error(error)
  }
}

// 关闭模态框
const closePlatformModal = () => {
  if (!isMounted.value) return

  showAddPlatformModal.value = false

  // 使用 setTimeout 确保 DOM 更新完成后再重置状态
  setTimeout(() => {
    if (!isMounted.value) return
    editingPlatform.value = null
    platformForm.value = {
      type: 'wechat_work',
      name: '',
      url: '',
      enableSign: false,
      secret: '',
      // Telegram特有字段
      botToken: '',
      chatId: '',
      apiBaseUrl: '',
      proxyUrl: '',
      // Bark特有字段
      deviceKey: '',
      serverUrl: '',
      level: '',
      sound: '',
      group: '',
      // SMTP特有字段
      host: '',
      port: null,
      secure: false,
      user: '',
      pass: '',
      from: '',
      to: '',
      timeout: null,
      ignoreTLS: false
    }
    urlError.value = false
    urlValid.value = false
    testingConnection.value = false
    savingPlatform.value = false
  }, 0)
}

// 辅助函数
const getPlatformName = (type) => {
  const names = {
    wechat_work: '企业微信',
    dingtalk: '钉钉',
    feishu: '飞书',
    slack: 'Slack',
    discord: 'Discord',
    telegram: 'Telegram',
    bark: 'Bark',
    smtp: '邮件通知',
    custom: '自定义'
  }
  return names[type] || type
}

const getWebhookHint = (type) => {
  const hints = {
    wechat_work: '请在企业微信群机器人设置中获取Webhook地址',
    dingtalk: '请在钉钉群机器人设置中获取Webhook地址',
    feishu: '请在飞书群机器人设置中获取Webhook地址',
    slack: '请在Slack应用的Incoming Webhooks中获取地址',
    discord: '请在Discord服务器的集成设置中创建Webhook',
    telegram: '使用 @BotFather 创建机器人并复制 Token，Chat ID 可通过 @userinfobot 或相关工具获取',
    bark: '请在Bark App中查看您的设备密钥',
    smtp: '请配置SMTP服务器信息，支持Gmail、QQ邮箱等',
    custom: '请输入完整的Webhook接收地址'
  }
  return hints[type] || ''
}

const formatTelegramToken = (token) => {
  if (!token) return ''
  if (token.length <= 12) return token
  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

const getNotificationTypeName = (type) => {
  const names = {
    accountAnomaly: '账号异常',
    quotaWarning: '配额警告',
    systemError: '系统错误',
    securityAlert: '安全警报',
    rateLimitRecovery: '限流恢复',
    test: '测试通知'
  }
  return names[type] || type
}

const getNotificationTypeDescription = (type) => {
  const descriptions = {
    accountAnomaly: '账号状态异常、认证失败等',
    quotaWarning: 'API调用配额不足警告',
    systemError: '系统运行错误和故障',
    securityAlert: '安全相关的警报通知',
    rateLimitRecovery: '限流状态恢复时发送提醒',
    test: '用于测试Webhook连接是否正常'
  }
  return descriptions[type] || ''
}

// 保存OEM设置
const saveOemSettings = async () => {
  try {
    const settings = {
      siteName: oemSettings.value.siteName,
      siteIcon: oemSettings.value.siteIcon,
      siteIconData: oemSettings.value.siteIconData,
      showAdminButton: oemSettings.value.showAdminButton
    }
    const result = await settingsStore.saveOemSettings(settings)
    if (result && result.success) {
      showToast('OEM设置保存成功', 'success')
    } else {
      showToast(result?.message || '保存失败', 'error')
    }
  } catch (error) {
    showToast('保存OEM设置失败', 'error')
  }
}

// 重置OEM设置
const resetOemSettings = async () => {
  if (!confirm('确定要重置为默认设置吗？\n\n这将清除所有自定义的网站名称和图标设置。')) return

  try {
    const result = await settingsStore.resetOemSettings()
    if (result && result.success) {
      showToast('已重置为默认设置', 'success')
    } else {
      showToast('重置失败', 'error')
    }
  } catch (error) {
    showToast('重置失败', 'error')
  }
}

// 处理图标上传
const handleIconUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件
  const validation = settingsStore.validateIconFile(file)
  if (!validation.isValid) {
    validation.errors.forEach((error) => showToast(error, 'error'))
    return
  }

  try {
    // 转换为Base64
    const base64Data = await settingsStore.fileToBase64(file)
    oemSettings.value.siteIconData = base64Data
  } catch (error) {
    showToast('文件读取失败', 'error')
  }

  // 清除input的值，允许重复选择同一文件
  event.target.value = ''
}

// 删除图标
const removeIcon = () => {
  oemSettings.value.siteIcon = ''
  oemSettings.value.siteIconData = ''
}

// 处理图标加载错误
const handleIconError = () => {
  console.warn('Icon failed to load')
}

// 格式化日期时间
const formatDateTime = settingsStore.formatDateTime
</script>
