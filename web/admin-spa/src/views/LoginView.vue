<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/10 blur-3xl opacity-60"
      ></div>
    </div>

    <!-- 主题切换按钮 - 固定在右上角 -->
    <div class="absolute top-6 right-6 z-20">
      <ThemeToggle mode="dropdown" class="shadow-sm hover:shadow-md transition-shadow" />
    </div>

    <!-- 主要内容区域 -->
    <div class="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- 登录卡片 -->
        <Card :no-padding="true">
          <div class="p-8 sm:p-10">
            <!-- Logo 和标题区域 -->
            <div class="text-center mb-8">
              <!-- Logo -->
              <div class="mb-6 flex justify-center">
                <template v-if="!oemLoading">
                  <img
                    v-if="authStore.oemSettings.siteIconData || authStore.oemSettings.siteIcon"
                    class="h-16 w-16 rounded-xl object-cover shadow-lg"
                    alt="Logo"
                    :src="authStore.oemSettings.siteIconData || authStore.oemSettings.siteIcon"
                    @error="(e) => (e.target.style.display = 'none')"
                  />
                </template>
                <div
                  v-else
                  class="h-16 w-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                />
              </div>

              <!-- 站点标题 -->
              <template v-if="!oemLoading && authStore.oemSettings.siteName">
                <h1
                  class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl mb-2"
                >
                  {{ authStore.oemSettings.siteName }}
                </h1>
              </template>
              <div
                v-else-if="oemLoading"
                class="h-8 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"
              />

              <!-- 副标题 -->
              <p class="text-sm text-gray-600 dark:text-gray-400">管理后台</p>
            </div>

            <!-- 登录表单 -->
            <form @submit.prevent="handleLogin" class="space-y-6">
              <!-- 用户名输入 -->
              <div>
                <label
                  for="username"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  用户名
                </label>
                <input
                  id="username"
                  v-model="loginForm.username"
                  type="text"
                  name="username"
                  autocomplete="username"
                  required
                  placeholder="请输入用户名"
                  class="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white outline-none ring-0 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200 sm:text-sm"
                />
              </div>

              <!-- 密码输入 -->
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  密码
                </label>
                <input
                  id="password"
                  v-model="loginForm.password"
                  type="password"
                  name="password"
                  autocomplete="current-password"
                  required
                  placeholder="请输入密码"
                  class="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white outline-none ring-0 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200 sm:text-sm"
                />
              </div>

              <!-- 登录按钮 -->
              <button
                type="submit"
                :disabled="authStore.loginLoading"
                class="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:bg-primary-700 hover:shadow-primary-500/40 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="authStore.loginLoading"
                  class="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{{ authStore.loginLoading ? '登录中...' : '登录' }}</span>
              </button>
            </form>

            <!-- 错误提示 -->
            <div
              v-if="authStore.loginError"
              class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 animate-shake"
            >
              <div class="flex items-start gap-2">
                <svg
                  class="h-5 w-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{{ authStore.loginError }}</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- 页脚 -->
        <footer class="mt-8 text-center text-sm text-gray-400 dark:text-gray-600">
          <p>&copy; {{ new Date().getFullYear() }} {{ authStore.oemSettings.siteName || 'Claude Relay Service' }}. All rights reserved.</p>
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
