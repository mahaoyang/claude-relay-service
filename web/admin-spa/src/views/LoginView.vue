<template>
  <div class="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-dark-bg">
    <!-- 背景装饰 -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        class="absolute left-1/2 top-0 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-primary-50/50 to-transparent opacity-60 blur-3xl dark:from-primary-900/10"
      ></div>
    </div>

    <!-- 主题切换按钮 - 固定在右上角 -->
    <div class="absolute right-6 top-6 z-20">
      <ThemeToggle class="shadow-sm transition-shadow hover:shadow-md" mode="dropdown" />
    </div>

    <!-- 主要内容区域 -->
    <div class="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- 登录卡片 -->
        <Card :no-padding="true">
          <div class="p-8 sm:p-10">
            <!-- Logo 和标题区域 -->
            <div class="mb-8 text-center">
              <!-- Logo -->
              <div class="mb-6 flex justify-center">
                <template v-if="!oemLoading">
                  <img
                    v-if="authStore.oemSettings.siteIconData || authStore.oemSettings.siteIcon"
                    alt="Logo"
                    class="h-16 w-16 rounded-xl object-cover shadow-lg"
                    :src="authStore.oemSettings.siteIconData || authStore.oemSettings.siteIcon"
                    @error="(e) => (e.target.style.display = 'none')"
                  />
                </template>
                <div
                  v-else
                  class="h-16 w-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
                />
              </div>

              <!-- 站点标题 -->
              <template v-if="!oemLoading && authStore.oemSettings.siteName">
                <h1
                  class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
                >
                  {{ authStore.oemSettings.siteName }}
                </h1>
              </template>
              <div
                v-else-if="oemLoading"
                class="mx-auto mb-2 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />

              <!-- 副标题 -->
              <p class="text-sm text-gray-600 dark:text-gray-400">管理后台</p>
            </div>

            <!-- 登录表单 -->
            <form class="space-y-6" @submit.prevent="handleLogin">
              <!-- 用户名输入 -->
              <div>
                <label
                  class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  for="username"
                >
                  用户名
                </label>
                <input
                  id="username"
                  v-model="loginForm.username"
                  autocomplete="username"
                  class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                  name="username"
                  placeholder="请输入用户名"
                  required
                  type="text"
                />
              </div>

              <!-- 密码输入 -->
              <div>
                <label
                  class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  for="password"
                >
                  密码
                </label>
                <input
                  id="password"
                  v-model="loginForm.password"
                  autocomplete="current-password"
                  class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                  name="password"
                  placeholder="请输入密码"
                  required
                  type="password"
                />
              </div>

              <!-- 登录按钮 -->
              <button
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:bg-primary-700 hover:shadow-primary-500/40 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
                :disabled="authStore.loginLoading"
                type="submit"
              >
                <svg
                  v-if="authStore.loginLoading"
                  class="h-5 w-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span>{{ authStore.loginLoading ? '登录中...' : '登录' }}</span>
              </button>
            </form>

            <!-- 错误提示 -->
            <div
              v-if="authStore.loginError"
              class="animate-shake mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              <div class="flex items-start gap-2">
                <svg
                  class="h-5 w-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
                <span>{{ authStore.loginError }}</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- 页脚 -->
        <footer class="mt-8 text-center text-sm text-gray-400 dark:text-gray-600">
          <p>
            &copy; {{ new Date().getFullYear() }}
            {{ authStore.oemSettings.siteName || 'Claude Relay Service' }}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import { Card } from '@/ui'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const oemLoading = computed(() => authStore.oemLoading)

const loginForm = ref({
  username: '',
  password: ''
})

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  // 加载OEM设置
  authStore.loadOemSettings()
})

const handleLogin = async () => {
  await authStore.login(loginForm.value)
}
</script>
