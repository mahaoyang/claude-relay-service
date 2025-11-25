<template>
  <div class="space-y-6">
    <!-- Claude OAuth流程 -->
    <div v-if="platform === 'claude'">
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div>
          <div></div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Claude 账户授权</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              请按照以下步骤完成 Claude 账户的授权：
            </p>

            <div class="mt-6 space-y-8">
              <!-- 步骤1: 生成授权链接 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    1
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    点击下方按钮生成授权链接
                  </h5>
                  <button
                    v-if="!authUrl"
                    :disabled="loading"
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
                    @click="generateAuthUrl"
                  >
                    <div
                      v-if="loading"
                      class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                    {{ loading ? '生成中...' : '生成授权链接' }}
                  </button>
                  <div v-else class="space-y-3">
                    <div class="flex gap-2">
                      <input
                        readonly
                        type="text"
                        :value="authUrl"
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      />
                      <button
                        title="复制链接"
                        class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        @click="copyAuthUrl"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      @click="regenerateAuthUrl"
                    >
                      重新生成
                    </button>
                  </div>
                </div>
              </div>

              <!-- 步骤2: 访问链接并授权 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    2
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    在浏览器中打开链接并完成授权
                  </h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    请在新标签页中打开授权链接，登录您的 Claude 账户并授权。
                  </p>
                  <div
                    class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30"
                  >
                    <p class="text-sm text-amber-800 dark:text-amber-200">
                      <strong>注意：</strong
                      >如果您设置了代理，请确保浏览器也使用相同的代理访问授权页面。
                    </p>
                  </div>
                </div>
              </div>

              <!-- 步骤3: 输入授权码 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    3
                  </div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    输入 Authorization Code
                  </h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    授权完成后，页面会显示一个
                    <strong>Authorization Code</strong>，请将其复制并粘贴到下方输入框：
                  </p>
                  <div class="mt-3 space-y-3">
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Authorization Code
                      </label>
                      <textarea
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        v-model="authCode"
                        placeholder="粘贴从Claude页面获取的Authorization Code..."
                        rows="3"
                      />
                      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        请粘贴从Claude页面复制的Authorization Code
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gemini OAuth流程 -->
    <div v-else-if="platform === 'gemini'">
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div>
          <div></div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Gemini 账户授权</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              请按照以下步骤完成 Gemini 账户的授权：
            </p>

            <div class="mt-6 space-y-8">
              <!-- 步骤1: 生成授权链接 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    1
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    点击下方按钮生成授权链接
                  </h5>
                  <button
                    v-if="!authUrl"
                    :disabled="loading"
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
                    @click="generateAuthUrl"
                  >
                    <div
                      v-if="loading"
                      class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                    {{ loading ? '生成中...' : '生成授权链接' }}
                  </button>
                  <div v-else class="space-y-3">
                    <div class="flex gap-2">
                      <input
                        readonly
                        type="text"
                        :value="authUrl"
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      />
                      <button
                        title="复制链接"
                        class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        @click="copyAuthUrl"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      @click="regenerateAuthUrl"
                    >
                      重新生成
                    </button>
                  </div>
                </div>
              </div>

              <!-- 步骤2: 操作说明 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    2
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    在浏览器中打开链接并完成授权
                  </h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    请在新标签页中打开授权链接，登录您的 Gemini 账户并授权。
                  </p>
                  <div
                    class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30"
                  >
                    <p class="text-sm text-amber-800 dark:text-amber-200">
                      <strong>注意：</strong
                      >如果您设置了代理，请确保浏览器也使用相同的代理访问授权页面。
                    </p>
                  </div>
                </div>
              </div>

              <!-- 步骤3: 输入授权码 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    3
                  </div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    输入 Authorization Code
                  </h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    授权完成后，页面会显示一个 Authorization Code，请将其复制并粘贴到下方输入框：
                  </p>
                  <div class="mt-3 space-y-3">
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Authorization Code
                      </label>
                      <textarea
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        v-model="authCode"
                        placeholder="粘贴从Gemini页面获取的Authorization Code..."
                        rows="3"
                      />
                      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        请粘贴从Gemini页面复制的Authorization Code
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OpenAI OAuth流程 -->
    <div v-else-if="platform === 'openai'">
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div>
          <div></div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">OpenAI 账户授权</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              请按照以下步骤完成 OpenAI 账户的授权：
            </p>

            <div class="mt-6 space-y-8">
              <!-- 步骤1: 生成授权链接 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    1
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    点击下方按钮生成授权链接
                  </h5>
                  <button
                    v-if="!authUrl"
                    :disabled="loading"
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
                    @click="generateAuthUrl"
                  >
                    <div
                      v-if="loading"
                      class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                    {{ loading ? '生成中...' : '生成授权链接' }}
                  </button>
                  <div v-else class="space-y-3">
                    <div class="flex gap-2">
                      <input
                        readonly
                        type="text"
                        :value="authUrl"
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      />
                      <button
                        title="复制链接"
                        class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        @click="copyAuthUrl"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      @click="regenerateAuthUrl"
                    >
                      重新生成
                    </button>
                  </div>
                </div>
              </div>

              <!-- 步骤2: 访问链接并授权 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    2
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    在浏览器中打开链接并完成授权
                  </h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    请在新标签页中打开授权链接，登录您的 OpenAI 账户并授权。
                  </p>
                  <div
                    class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30"
                  >
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      <strong>重要提示：</strong>授权后页面可能会加载较长时间，请耐心等待。
                    </p>
                    <p class="mt-2 text-sm text-blue-800 dark:text-blue-200">
                      当浏览器地址栏变为
                      <strong>http://localhost:1455/...</strong>
                      开头时，表示授权已完成。
                    </p>
                  </div>
                  <div
                    class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30"
                  >
                    <p class="text-sm text-amber-800 dark:text-amber-200">
                      <strong>注意：</strong
                      >如果您设置了代理，请确保浏览器也使用相同的代理访问授权页面。
                    </p>
                  </div>
                </div>
              </div>

              <!-- 步骤3: 输入授权码 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    3
                  </div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    输入授权链接或 Code
                  </h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    授权完成后，当页面地址变为
                    <strong>http://localhost:1455/...</strong> 时：
                  </p>
                  <div class="mt-3 space-y-3">
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        授权链接或 Code
                      </label>
                      <textarea
                        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        v-model="authCode"
                        placeholder="方式1：复制完整的链接（http://localhost:1455/auth/callback?code=...）&#10;方式2：仅复制 code 参数的值&#10;系统会自动识别并提取所需信息"
                        rows="3"
                      />
                      <div class="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <p>
                          <strong>提示：</strong>您可以直接复制整个链接或仅复制 code
                          参数值，系统会自动识别。
                        </p>
                        <p>
                          • 完整链接示例：<span class="font-mono"
                            >http://localhost:1455/auth/callback?code=ac_4hm8...</span
                          >
                        </p>
                        <p>
                          • 仅 Code 示例：<span class="font-mono"
                            >ac_4hm8iqmx9A2fzMy_cwye7U3W7...</span
                          >
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Droid OAuth流程 -->
    <div v-else-if="platform === 'droid'">
      <div
        class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div>
          <div></div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Droid 账户授权</h4>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              请按照以下步骤完成 Factory (Droid) 账户的授权：
            </p>

            <div class="mt-6 space-y-8">
              <!-- 步骤1: 生成授权链接 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    1
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    点击下方按钮生成授权链接
                  </h5>
                  <button
                    v-if="!authUrl"
                    :disabled="loading"
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
                    @click="generateAuthUrl"
                  >
                    <div
                      v-if="loading"
                      class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                    {{ loading ? '生成中...' : '生成授权链接' }}
                  </button>
                  <div v-else class="space-y-4">
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        授权链接
                      </label>
                      <div class="space-y-3">
                        <div class="flex gap-2">
                          <input
                            readonly
                            type="text"
                            :value="authUrl"
                            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          />
                          <button
                            title="复制链接"
                            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            @click="copyAuthUrl"
                          >
                            <svg
                              class="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                              />
                            </svg>
                          </button>
                        </div>
                        <div class="mt-4 flex items-center gap-3">
                          <button
                            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                            @click="openVerificationPage"
                          >
                            在新标签中打开
                          </button>
                          <button
                            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                            @click="regenerateAuthUrl"
                          >
                            重新生成
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label
                        class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        授权验证码
                      </label>
                      <div class="flex items-center gap-3">
                        <span
                          class="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 font-mono text-xl font-semibold tracking-wider text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          {{ userCode || '------' }}
                        </span>
                        <button
                          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                          @click="copyUserCode"
                        >
                          复制
                        </button>
                      </div>
                    </div>
                    <div
                      class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30"
                    >
                      <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
                        剩余有效期：{{ formattedCountdown }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 步骤2: 访问链接并授权 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    2
                  </div>
                  <div class="mt-2 w-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">
                    在浏览器中打开链接并完成授权
                  </h5>
                  <div
                    class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30"
                  >
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      在浏览器中打开授权页面，输入上方验证码并登录 Factory / Droid
                      账户，最后点击允许授权。
                    </p>
                  </div>
                </div>
              </div>

              <!-- 步骤3: 输入授权结果 -->
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-sm dark:bg-primary-500"
                  >
                    3
                  </div>
                </div>
                <div class="flex-1 space-y-4">
                  <h5 class="text-base font-semibold text-gray-900 dark:text-white">完成授权</h5>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    完成授权后点击下方"完成授权"按钮，系统会自动获取访问令牌。
                  </p>
                  <div
                    class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30"
                  >
                    <p class="text-sm text-amber-800 dark:text-amber-200">
                      若提示授权仍在等待确认，请稍候片刻后系统会自动重试。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-between gap-3">
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        @click="$emit('back')"
      >
        上一步
      </button>
      <button
        :disabled="!canExchange || exchanging"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
        @click="exchangeCode"
      >
        <div
          v-if="exchanging"
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        {{ exchanging ? '验证中...' : '完成授权' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { showToast } from '@/utils/toast'
import { useAccountsStore } from '@/stores/accounts'

const props = defineProps({
  platform: {
    type: String,
    required: true
  },
  proxy: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'back'])

const accountsStore = useAccountsStore()

// 状态
const loading = ref(false)
const exchanging = ref(false)
const authUrl = ref('')
const authCode = ref('')
const copied = ref(false)
const sessionId = ref('') // 保存sessionId用于后续交换
const userCode = ref('')
const verificationUri = ref('')
const verificationUriComplete = ref('')
const remainingSeconds = ref(0)
let countdownTimer = null

// 计算是否可以交换code
const canExchange = computed(() => {
  if (props.platform === 'droid') {
    return !!sessionId.value
  }
  return authUrl.value && authCode.value.trim()
})

const formattedCountdown = computed(() => {
  if (!remainingSeconds.value || remainingSeconds.value <= 0) {
    return '00:00'
  }
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const startCountdown = (seconds) => {
  stopCountdown()
  if (!seconds || seconds <= 0) {
    remainingSeconds.value = 0
    return
  }

  remainingSeconds.value = Math.floor(seconds)
  countdownTimer = setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0
      stopCountdown()
    } else {
      remainingSeconds.value -= 1
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 监听授权码输入，自动提取URL中的code参数
watch(authCode, (newValue) => {
  if (props.platform === 'droid') return
  if (!newValue || typeof newValue !== 'string') return

  const trimmedValue = newValue.trim()

  // 如果内容为空，不处理
  if (!trimmedValue) return

  // 检查是否是 URL 格式（包含 http:// 或 https://）
  const isUrl = trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')

  // 如果是 URL 格式
  if (isUrl) {
    // 检查是否是正确的 localhost 回调 URL
    if (
      trimmedValue.startsWith('http://localhost:45462') ||
      trimmedValue.startsWith('http://localhost:1455')
    ) {
      try {
        const url = new URL(trimmedValue)
        const code = url.searchParams.get('code')

        if (code) {
          // 成功提取授权码
          authCode.value = code
          showToast('成功提取授权码！', 'success')
          console.log('Successfully extracted authorization code from URL')
        } else {
          // URL 中没有 code 参数
          showToast('URL 中未找到授权码参数，请检查链接是否正确', 'error')
        }
      } catch (error) {
        // URL 解析失败
        console.error('Failed to parse URL:', error)
        showToast('链接格式错误，请检查是否为完整的 URL', 'error')
      }
    } else if (props.platform === 'gemini' || props.platform === 'openai') {
      // Gemini 和 OpenAI 平台可能使用不同的回调URL
      // 尝试从任何URL中提取code参数
      try {
        const url = new URL(trimmedValue)
        const code = url.searchParams.get('code')

        if (code) {
          authCode.value = code
          showToast('成功提取授权码！', 'success')
        }
      } catch (error) {
        // 不是有效的URL，保持原值
      }
    } else {
      // 错误的 URL（不是正确的 localhost 回调地址）
      showToast('请粘贴以 http://localhost:1455 或 http://localhost:45462 开头的链接', 'error')
    }
  }
  // 如果不是 URL，保持原值（兼容直接输入授权码）
})

// 生成授权URL
const generateAuthUrl = async () => {
  stopCountdown()
  authUrl.value = ''
  authCode.value = ''
  userCode.value = ''
  verificationUri.value = ''
  verificationUriComplete.value = ''
  remainingSeconds.value = 0
  sessionId.value = ''
  copied.value = false
  loading.value = true
  try {
    const proxyConfig = props.proxy?.enabled
      ? {
          proxy: {
            type: props.proxy.type,
            host: props.proxy.host,
            port: parseInt(props.proxy.port),
            username: props.proxy.username || null,
            password: props.proxy.password || null
          }
        }
      : {}

    if (props.platform === 'claude') {
      const result = await accountsStore.generateClaudeAuthUrl(proxyConfig)
      authUrl.value = result.authUrl
      sessionId.value = result.sessionId
    } else if (props.platform === 'gemini') {
      const result = await accountsStore.generateGeminiAuthUrl(proxyConfig)
      authUrl.value = result.authUrl
      sessionId.value = result.sessionId
    } else if (props.platform === 'openai') {
      const result = await accountsStore.generateOpenAIAuthUrl(proxyConfig)
      authUrl.value = result.authUrl
      sessionId.value = result.sessionId
    } else if (props.platform === 'droid') {
      const result = await accountsStore.generateDroidAuthUrl(proxyConfig)
      authUrl.value = result.verificationUriComplete || result.verificationUri
      verificationUri.value = result.verificationUri
      verificationUriComplete.value = result.verificationUriComplete || result.verificationUri
      userCode.value = result.userCode
      startCountdown(result.expiresIn || 300)
      sessionId.value = result.sessionId
    }
  } catch (error) {
    showToast(error.message || '生成授权链接失败', 'error')
  } finally {
    loading.value = false
  }
}

// 重新生成授权URL
const regenerateAuthUrl = () => {
  stopCountdown()
  authUrl.value = ''
  authCode.value = ''
  userCode.value = ''
  verificationUri.value = ''
  verificationUriComplete.value = ''
  remainingSeconds.value = 0
  sessionId.value = ''
  generateAuthUrl()
}

// 复制授权URL
const copyAuthUrl = async () => {
  if (!authUrl.value) {
    showToast('请先生成授权链接', 'warning')
    return
  }
  try {
    await navigator.clipboard.writeText(authUrl.value)
    copied.value = true
    showToast('链接已复制', 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    // 降级方案
    const input = document.createElement('input')
    input.value = authUrl.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    showToast('链接已复制', 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const copyUserCode = async () => {
  if (!userCode.value) {
    showToast('请先生成授权验证码', 'warning')
    return
  }
  try {
    await navigator.clipboard.writeText(userCode.value)
    showToast('验证码已复制', 'success')
  } catch (error) {
    const input = document.createElement('input')
    input.value = userCode.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    showToast('验证码已复制', 'success')
  }
}

const openVerificationPage = () => {
  if (verificationUriComplete.value) {
    window.open(verificationUriComplete.value, '_blank', 'noopener')
  } else if (verificationUri.value) {
    window.open(verificationUri.value, '_blank', 'noopener')
  }
}

// 交换授权码
const exchangeCode = async () => {
  if (!canExchange.value) return

  exchanging.value = true
  try {
    let data = {}

    if (props.platform === 'claude') {
      // Claude使用sessionId和callbackUrl（即授权码）
      data = {
        sessionId: sessionId.value,
        callbackUrl: authCode.value.trim()
      }
    } else if (props.platform === 'gemini') {
      // Gemini使用code和sessionId
      data = {
        code: authCode.value.trim(),
        sessionId: sessionId.value
      }
    } else if (props.platform === 'openai') {
      // OpenAI使用code和sessionId
      data = {
        code: authCode.value.trim(),
        sessionId: sessionId.value
      }
    } else if (props.platform === 'droid') {
      data = {
        sessionId: sessionId.value
      }
    }

    // 添加代理配置（如果启用）
    if (props.proxy?.enabled) {
      data.proxy = {
        type: props.proxy.type,
        host: props.proxy.host,
        port: parseInt(props.proxy.port),
        username: props.proxy.username || null,
        password: props.proxy.password || null
      }
    }

    let tokenInfo
    if (props.platform === 'claude') {
      tokenInfo = await accountsStore.exchangeClaudeCode(data)
    } else if (props.platform === 'gemini') {
      tokenInfo = await accountsStore.exchangeGeminiCode(data)
    } else if (props.platform === 'openai') {
      tokenInfo = await accountsStore.exchangeOpenAICode(data)
    } else if (props.platform === 'droid') {
      const response = await accountsStore.exchangeDroidCode(data)
      if (!response.success) {
        if (response.pending) {
          const message = response.message || '授权尚未完成，请在浏览器确认后稍候再次尝试。'
          showToast(message, 'info')
          if (typeof response.expiresIn === 'number' && response.expiresIn >= 0) {
            startCountdown(response.expiresIn)
          }
          return
        }
        throw new Error(response.message || '授权失败，请重试')
      }
      tokenInfo = response.data
      stopCountdown()
    }

    emit('success', tokenInfo)
  } catch (error) {
    showToast(error.message || '授权失败，请检查授权码是否正确', 'error')
  } finally {
    exchanging.value = false
  }
}

onBeforeUnmount(() => {
  stopCountdown()
})
</script>
