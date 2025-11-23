<template>
  <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 max-w-7xl">
      <TabSelect
        :model-value="activeTab"
        :options="tabOptions"
        :no-border="true"
        @update:model-value="$emit('tab-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import TabSelect from '@/components/common/TabSelect.vue'

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

// 转换为 TabSelect 需要的格式
const tabOptions = computed(() =>
  tabs.value.map((tab) => ({
    value: tab.key,
    label: tab.name,
    shortLabel: tab.shortName,
    icon: tab.icon
  }))
)
</script>
