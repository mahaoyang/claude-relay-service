<template>
  <!-- 顶部导航 -->
  <div class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
    <div class="container mx-auto max-w-7xl px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- 左侧：Logo 和标题 -->
        <div class="flex items-center gap-3">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <template v-if="!oemLoading">
              <img
                v-if="oemSettings.siteIconData || oemSettings.siteIcon"
                alt="Logo"
                class="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                :src="oemSettings.siteIconData || oemSettings.siteIcon"
              />
            </template>
            <div v-else class="h-10 w-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>

          <!-- 标题和版本信息 -->
          <div class="flex flex-col">
            <div class="flex items-baseline gap-2">
              <template v-if="!oemLoading && oemSettings.siteName">
                <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ oemSettings.siteName }}
                </h1>
              </template>
              <div
                v-else-if="oemLoading"
                class="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />

              <!-- 版本标签 -->
              <div class="flex items-center gap-1.5">
                <span
                  class="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10 dark:bg-primary-400/10 dark:text-primary-400 dark:ring-primary-400/30"
                >
                  v{{ versionInfo.current || '...' }}
                </span>
                <!-- 更新提示 -->
                <a
                  v-if="versionInfo.hasUpdate"
                  class="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 transition-all hover:bg-green-100 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/30 dark:hover:bg-green-400/20"
                  :href="versionInfo.releaseInfo?.htmlUrl || '#'"
                  target="_blank"
                  title="有新版本可用"
                >
                  <svg
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>新版本</span>
                </a>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">管理后台</p>
          </div>
        </div>

        <!-- 右侧：主题切换和用户菜单 -->
        <div class="flex items-center gap-3">
          <!-- 主题切换按钮 -->
          <ThemeToggle mode="dropdown" />

          <!-- 分隔线 -->
          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          <!-- 用户菜单 -->
          <div class="user-menu-container relative">
            <button
              class="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              @click="userMenuOpen = !userMenuOpen"
            >
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
              >
                {{ (currentUser.username || 'Admin').charAt(0).toUpperCase() }}
              </div>
              <span class="hidden sm:inline">{{ currentUser.username || 'Admin' }}</span>
              <svg
                class="h-4 w-4 transition-transform"
                :class="{ 'rotate-180': userMenuOpen }"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <!-- 悬浮菜单 -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
              @click.stop
            >
              <!-- 版本信息卡片 -->
              <div class="border-b border-gray-100 p-4 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">当前版本</span>
                  <span
                    class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    v{{ versionInfo.current || '...' }}
                  </span>
                </div>
                <div v-if="versionInfo.hasUpdate" class="mt-3">
                  <div
                    class="mb-2 flex items-center gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-900/20"
                  >
                    <svg
                      class="h-4 w-4 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <div class="flex-1">
                      <p class="text-xs font-medium text-green-700 dark:text-green-400">有新版本</p>
                      <p class="text-xs text-green-600 dark:text-green-500">
                        v{{ versionInfo.latest }}
                      </p>
                    </div>
                  </div>
                  <a
                    class="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                    :href="versionInfo.releaseInfo?.htmlUrl || '#'"
                    target="_blank"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      />
                    </svg>
                    查看更新
                  </a>
                </div>
                <div
                  v-else-if="versionInfo.checkingUpdate"
                  class="mt-2 text-xs text-gray-500 dark:text-gray-400"
                >
                  检查更新中...
                </div>
                <div v-else class="mt-2">
                  <!-- 已是最新版提醒 -->
                  <transition mode="out-in" name="fade">
                    <div
                      v-if="versionInfo.noUpdateMessage"
                      key="message"
                      class="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50"
                    >
                      <p class="text-xs text-gray-600 dark:text-gray-300">当前已是最新版本</p>
                    </div>
                    <button
                      v-else
                      key="button"
                      class="w-full rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                      @click="checkForUpdates()"
                    >
                      检查更新
                    </button>
                  </transition>
                </div>
              </div>

              <!-- 菜单项 -->
              <div class="p-2">
                <button
                  class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  @click="openChangePasswordModal"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                  <span>修改账户信息</span>
                </button>

                <div class="my-2 h-px bg-gray-100 dark:bg-gray-700" />

                <button
                  class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  @click="logout"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 修改账户信息模态框 -->
  <div v-if="showChangePasswordModal">
    <div>
      <div>
        <div>
          <div></div>
          <h3>修改账户信息</h3>
        </div>
        <button @click="closeChangePasswordModal"></button>
      </div>

      <form @submit.prevent="changePassword">
        <div>
          <label>当前用户名</label>
          <input disabled type="text" :value="currentUser.username || 'Admin'" />
          <p>当前用户名，输入新用户名以修改</p>
        </div>

        <div>
          <label>新用户名</label>
          <input
            v-model="changePasswordForm.newUsername"
            placeholder="输入新用户名（留空保持不变）"
            type="text"
          />
          <p>留空表示不修改用户名</p>
        </div>

        <div>
          <label>当前密码</label>
          <input
            v-model="changePasswordForm.currentPassword"
            placeholder="请输入当前密码"
            required
            type="password"
          />
        </div>

        <div>
          <label>新密码</label>
          <input
            v-model="changePasswordForm.newPassword"
            placeholder="请输入新密码"
            required
            type="password"
          />
          <p>密码长度至少8位</p>
        </div>

        <div>
          <label>确认新密码</label>
          <input
            v-model="changePasswordForm.confirmPassword"
            placeholder="请再次输入新密码"
            required
            type="password"
          />
        </div>

        <div>
          <button type="button" @click="closeChangePasswordModal">取消</button>
          <button :disabled="changePasswordLoading" type="submit">
            <div v-if="changePasswordLoading" />
            {{ changePasswordLoading ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()

// 当前用户信息
const currentUser = computed(() => authStore.user || { username: 'Admin' })

// OEM设置
const oemSettings = computed(() => authStore.oemSettings || {})
const oemLoading = computed(() => authStore.oemLoading)

// 版本信息
const versionInfo = ref({
  current: '...',
  latest: '',
  hasUpdate: false,
  checkingUpdate: false,
  lastChecked: null,
  releaseInfo: null,
  noUpdateMessage: false
})

// 用户菜单状态
const userMenuOpen = ref(false)

// 修改密码模态框
const showChangePasswordModal = ref(false)
const changePasswordLoading = ref(false)
const changePasswordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  newUsername: ''
})

// 检查更新（同时获取版本信息）
const checkForUpdates = async () => {
  if (versionInfo.value.checkingUpdate) {
    return
  }

  versionInfo.value.checkingUpdate = true

  try {
    const result = await apiClient.get('/admin/check-updates')

    if (result.success) {
      const data = result.data

      versionInfo.value.current = data.current
      versionInfo.value.latest = data.latest
      versionInfo.value.hasUpdate = data.hasUpdate
      versionInfo.value.releaseInfo = data.releaseInfo
      versionInfo.value.lastChecked = new Date()

      // 保存到localStorage
      localStorage.setItem(
        'versionInfo',
        JSON.stringify({
          current: data.current,
          latest: data.latest,
          lastChecked: versionInfo.value.lastChecked,
          hasUpdate: data.hasUpdate,
          releaseInfo: data.releaseInfo
        })
      )

      // 如果没有更新，显示提醒
      if (!data.hasUpdate) {
        versionInfo.value.noUpdateMessage = true
        // 3秒后自动隐藏提醒
        setTimeout(() => {
          versionInfo.value.noUpdateMessage = false
        }, 3000)
      }
    }
  } catch (error) {
    console.error('Error checking for updates:', error)

    // 尝试从localStorage读取缓存的版本信息
    const cached = localStorage.getItem('versionInfo')
    if (cached) {
      const cachedInfo = JSON.parse(cached)
      versionInfo.value.current = cachedInfo.current || versionInfo.value.current
      versionInfo.value.latest = cachedInfo.latest
      versionInfo.value.hasUpdate = cachedInfo.hasUpdate
      versionInfo.value.releaseInfo = cachedInfo.releaseInfo
      versionInfo.value.lastChecked = new Date(cachedInfo.lastChecked)
    }
  } finally {
    versionInfo.value.checkingUpdate = false
  }
}

// 打开修改密码弹窗
const openChangePasswordModal = () => {
  changePasswordForm.currentPassword = ''
  changePasswordForm.newPassword = ''
  changePasswordForm.confirmPassword = ''
  changePasswordForm.newUsername = ''
  showChangePasswordModal.value = true
  userMenuOpen.value = false
}

// 关闭修改密码弹窗
const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
}

// 修改密码
const changePassword = async () => {
  if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
    showToast('两次输入的密码不一致', 'error')
    return
  }

  if (changePasswordForm.newPassword.length < 8) {
    showToast('新密码长度至少8位', 'error')
    return
  }

  changePasswordLoading.value = true

  try {
    const data = await apiClient.post('/web/auth/change-password', {
      currentPassword: changePasswordForm.currentPassword,
      newPassword: changePasswordForm.newPassword,
      newUsername: changePasswordForm.newUsername || undefined
    })

    if (data.success) {
      const message = changePasswordForm.newUsername
        ? '账户信息修改成功，请重新登录'
        : '密码修改成功，请重新登录'
      showToast(message, 'success')
      closeChangePasswordModal()

      // 延迟后退出登录
      setTimeout(() => {
        authStore.logout()
        router.push('/login')
      }, 1500)
    } else {
      showToast(data.message || '修改失败', 'error')
    }
  } catch (error) {
    showToast('修改密码失败', 'error')
  } finally {
    changePasswordLoading.value = false
  }
}

// 退出登录
const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/login')
    showToast('已安全退出', 'success')
  }
  userMenuOpen.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  const userMenuContainer = event.target.closest('.user-menu-container')
  if (!userMenuContainer && userMenuOpen.value) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  checkForUpdates()

  // 设置自动检查更新（每小时检查一次）
  setInterval(() => {
    checkForUpdates()
  }, 3600000) // 1小时

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
