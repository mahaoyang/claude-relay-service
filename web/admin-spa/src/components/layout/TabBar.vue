<template>
  <div class="mb-4">
    <!-- 移动端下拉选择器 -->
    <div class="block p-2 md:hidden">
      <select
        class="w-full px-4 py-3 border font-semibold"
        :value="activeTab"
        @change="$emit('tab-change', $event.target.value)"
      >
        <option v-for="tab in tabs" :key="tab.key" :value="tab.key">
          {{ tab.name }}
        </option>
      </select>
    </div>

    <!-- 桌面端标签栏 -->
    <div class="hidden md:flex flex-wrap gap-2 p-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[ 'tab-btn flex-1 px-6 py-3 text-sm font-semibold transition-all duration-300', activeTab === tab.key ? 'active' : '' ]"
        @click="$emit('tab-change', tab.key)"
      >
        <i :class="tab.icon + ' mr-2'" />
        <span class="hidden sm:inline">{{ tab.name }}</span>
        <span class="sm:hidden">{{ tab.shortName || tab.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits(['tab-change'])

const authStore = useAuthStore()

// 根据 LDAP 配置动态生成 tabs
const tabs = computed(() => {
  const baseTabs = [
    { key: 'dashboard', name: '仪表板', shortName: '仪表板', icon: 'fas fa-tachometer-alt' },
    { key: 'apiKeys', name: 'API Keys', shortName: 'API', icon: 'fas fa-key' },
    { key: 'accounts', name: '账户管理', shortName: '账户', icon: 'fas fa-user-circle' }
  ]

  // 只有在 LDAP 启用时才显示用户管理
  if (authStore.oemSettings?.ldapEnabled) {
    baseTabs.push({
      key: 'userManagement',
      name: '用户管理',
      shortName: '用户',
      icon: 'fas fa-users'
    })
  }

  baseTabs.push(
    { key: 'tutorial', name: '使用教程', shortName: '教程', icon: 'fas fa-graduation-cap' },
    { key: 'settings', name: '系统设置', shortName: '设置', icon: 'fas fa-cogs' }
  )

  return baseTabs
})
</script>

<style scoped>
/* 使用全局样式中定义的 .tab-btn 类 */
</style>
