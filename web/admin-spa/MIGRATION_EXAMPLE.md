# 迁移示例：从旧组件迁移到 Headless UI 架构

## 示例 1：迁移 API Keys 管理页面中的删除确认

### 旧版实现

```vue
<!-- views/ApiKeys.vue (旧版) -->
<script setup>
import { ref } from 'vue'

const handleDelete = async (key) => {
  // 使用旧版全局 ConfirmDialog
  const confirmed = await window.showConfirm(
    '确认删除',
    `确定要删除 API Key "${key.name}" 吗？此操作不可撤销。`,
    '删除',
    '取消'
  )

  if (confirmed) {
    await deleteApiKey(key.id)
  }
}
</script>
```

### 新版实现

```vue
<!-- views/ApiKeys.vue (新版) -->
<script setup>
import { ref } from 'vue'
import { ConfirmDialog, Button } from '@/components/ui'
import { Trash2 } from 'lucide-vue-next'

const confirmDialogRef = ref(null)

const handleDelete = async (key) => {
  // 使用新版 ConfirmDialog，支持 variant
  const confirmed = await confirmDialogRef.value?.showConfirm(
    '确认删除',
    `确定要删除 API Key "${key.name}" 吗？此操作不可撤销。`,
    {
      confirmTextParam: '删除',
      cancelTextParam: '取消',
      variant: 'danger' // 红色危险样式
    }
  )

  if (confirmed) {
    await deleteApiKey(key.id)
  }
}
</script>

<template>
  <!-- 旧版按钮 -->
  <!-- <button class="btn btn-danger" @click="handleDelete(key)">删除</button> -->

  <!-- 新版按钮 -->
  <Button variant="danger" :icon="Trash2" @click="handleDelete(key)"> 删除 </Button>

  <!-- 添加 ConfirmDialog 组件 -->
  <ConfirmDialog ref="confirmDialogRef" />
</template>
```

## 示例 2：迁移账户添加模态框

### 旧版实现

```vue
<!-- components/accounts/AccountForm.vue (旧版) -->
<template>
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3>添加账户</h3>
          <button @click="close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>账户名称</label>
            <input v-model="form.name" type="text" class="input" />
          </div>

          <div class="form-group">
            <label>账户类型</label>
            <select v-model="form.type" class="select">
              <option value="claude-official">Claude 官方</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">确认</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
}

/* ... 更多样式 */
</style>
```

### 新版实现

```vue
<!-- components/accounts/AccountForm.vue (新版) -->
<script setup>
import { ref } from 'vue'
import { Dialog, Button } from '@/components/ui'
// import { Input, Select } from '@/components/ui' // TODO: 待创建

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  name: '',
  type: 'claude-official'
})

const handleSubmit = () => {
  emit('submit', form.value)
  emit('close')
}
</script>

<template>
  <Dialog :is-open="isOpen" title="添加账户" panel-class="max-w-lg" @close="$emit('close')">
    <!-- 表单内容 -->
    <div class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          账户名称
        </label>
        <!-- 暂时使用原生 input，后续替换为 Input 组件 -->
        <input
          v-model="form.name"
          type="text"
          class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          账户类型
        </label>
        <select
          v-model="form.type"
          class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="claude-official">Claude 官方</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer="{ close }">
      <div class="flex justify-end gap-3">
        <Button variant="secondary" @click="close">取消</Button>
        <Button variant="primary" @click="handleSubmit">确认</Button>
      </div>
    </template>
  </Dialog>
</template>
```

## 示例 3：迁移下拉菜单

### 旧版实现

```vue
<!-- components/layout/AppHeader.vue (旧版) -->
<template>
  <div class="user-menu" @click="toggleMenu">
    <span>{{ username }}</span>
    <div v-if="menuOpen" class="dropdown">
      <a @click="goToProfile">个人资料</a>
      <a @click="goToSettings">设置</a>
      <a @click="logout">退出登录</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<style scoped>
.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  min-width: 200px;
}

.dropdown a {
  display: block;
  padding: 0.75rem 1rem;
  cursor: pointer;
}

.dropdown a:hover {
  background: #f3f4f6;
}
</style>
```

### 新版实现

```vue
<!-- components/layout/AppHeader.vue (新版) -->
<script setup>
import { Menu, MenuItem } from '@/components/ui'
import { User, Settings, LogOut, ChevronDown } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToProfile = () => router.push('/profile')
const goToSettings = () => router.push('/settings')
const logout = () => {
  // 退出登录逻辑
  router.push('/login')
}
</script>

<template>
  <Menu>
    <template #button>
      <button
        class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <User :size="16" />
        <span>{{ username }}</span>
        <ChevronDown :size="16" />
      </button>
    </template>

    <MenuItem :icon="User" @click="goToProfile"> 个人资料 </MenuItem>
    <MenuItem :icon="Settings" @click="goToSettings"> 设置 </MenuItem>
    <MenuItem :icon="LogOut" @click="logout"> 退出登录 </MenuItem>
  </Menu>
</template>
```

**优势：**

- ✅ 不需要手动管理 menuOpen 状态
- ✅ 自动处理焦点管理和键盘导航
- ✅ 自动处理点击外部关闭
- ✅ 符合 ARIA 可访问性标准
- ✅ 内置过渡动画
- ✅ 不需要写自定义样式

## 示例 4：创建新的自定义对话框

### 使用新架构创建功能丰富的对话框

```vue
<!-- components/apikeys/UsageDetailModal.vue (新版) -->
<script setup>
import { ref, computed } from 'vue'
import { Dialog, Button } from '@/components/ui'
import { Download, X } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  apiKey: Object
})

const emit = defineEmits(['close'])

const usageData = computed(() => {
  // 计算使用数据
  return props.apiKey?.usage || {}
})

const exportData = () => {
  // 导出数据逻辑
  console.log('导出数据')
}
</script>

<template>
  <Dialog
    :is-open="isOpen"
    :title="`API Key 使用详情 - ${apiKey?.name}`"
    panel-class="max-w-3xl"
    @close="$emit('close')"
  >
    <!-- 自定义头部按钮 -->
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          API Key 使用详情 - {{ apiKey?.name }}
        </h3>
        <div class="flex gap-2">
          <Button variant="ghost" size="sm" :icon="Download" @click="exportData"> 导出 </Button>
          <button
            class="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="$emit('close')"
          >
            <X :size="20" />
          </button>
        </div>
      </div>
    </template>

    <!-- 主体内容 -->
    <div class="space-y-6">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div class="text-sm text-blue-600 dark:text-blue-400">总请求数</div>
          <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {{ usageData.totalRequests || 0 }}
          </div>
        </div>

        <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div class="text-sm text-green-600 dark:text-green-400">成功率</div>
          <div class="text-2xl font-bold text-green-900 dark:text-green-100">
            {{ usageData.successRate || '0%' }}
          </div>
        </div>

        <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <div class="text-sm text-purple-600 dark:text-purple-400">总费用</div>
          <div class="text-2xl font-bold text-purple-900 dark:text-purple-100">
            ${{ usageData.totalCost || '0.00' }}
          </div>
        </div>
      </div>

      <!-- 使用趋势图表 -->
      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h4 class="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">使用趋势</h4>
        <!-- Chart 组件 -->
        <div class="flex h-64 items-center justify-center text-gray-400">图表占位符</div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer="{ close }">
      <Button variant="primary" @click="close">关闭</Button>
    </template>
  </Dialog>
</template>
```

## 渐进式迁移策略

### 阶段 1：新功能使用新组件（当前）

- ✅ 所有新增功能使用新的 UI 组件库
- ✅ 不破坏现有功能

### 阶段 2：迁移核心组件（建议）

优先级排序：

1. **ConfirmDialog** - 全局使用，影响面大 ✅ 已完成
2. **Button** - 使用频率最高 ✅ 已完成
3. **Dialog/Modal** - 多个页面使用 ✅ 已完成
4. **Menu/Dropdown** - 导航和操作菜单 ✅ 已完成
5. **Input** - 表单基础组件 ⏳ 待创建
6. **Select** - 下拉选择 ⏳ 待创建

### 阶段 3：逐页迁移（长期）

- 按业务模块逐步迁移
- 保持旧组件向后兼容
- 最终删除旧组件和样式

## 常见问题

### Q: 旧版 ConfirmDialog 还能用吗？

A: 可以！新版完全兼容旧版的全局调用方式 `window.showConfirm()`，只是参数格式略有改进。

### Q: 需要一次性迁移所有组件吗？

A: 不需要！可以渐进式迁移。新功能用新组件，旧代码保持不变。

### Q: 如何处理自定义样式？

A:

1. 优先使用 `themes/components.js` 配置
2. 需要时可以通过 `class` prop 传入自定义类名
3. 使用 `useTheme()` composable 访问主题变量

### Q: 所有组件都需要用 Headless UI 吗？

A: 不一定！简单的展示型组件（如 Card、Badge）可以直接实现。Headless UI 主要用于交互复杂的组件（Dialog、Menu、Select 等）。

---

最后更新：2025-01-20
