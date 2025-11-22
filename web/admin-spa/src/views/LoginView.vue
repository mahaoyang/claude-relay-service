<template>
  <div>
    <!-- 主题切换按钮 - 固定在右上角 -->
    <div>
      <ThemeToggle mode="dropdown" />
    </div>

    <div>
      <div>
        <!-- 使用自定义布局来保持登录页面的居中大logo样式 -->
        <div>
          <template v-if="!oemLoading">
            <img
              v-if="authStore.oemSettings.siteIconData || authStore.oemSettings.siteIcon"
              alt="Logo"
              :src="authStore.oemSettings.siteIconData || authStore.oemSettings.siteIcon"
              @error="(e) => (e.target.style.display = 'none')"
            />
          </template>
          <div v-else />
        </div>
        <template v-if="!oemLoading && authStore.oemSettings.siteName">
          <h1>
            {{ authStore.oemSettings.siteName }}
          </h1>
        </template>
        <div v-else-if="oemLoading" />
        <p>管理后台</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div>
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            autocomplete="username"
            name="username"
            placeholder="请输入用户名"
            required
            type="text"
          />
        </div>

        <div>
          <label for="password">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            autocomplete="current-password"
            name="password"
            placeholder="请输入密码"
            required
            type="password"
          />
        </div>

        <button :disabled="authStore.loginLoading" type="submit">
          <div v-if="authStore.loginLoading" />
          {{ authStore.loginLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div v-if="authStore.loginError">
        {{ authStore.loginError }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

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
