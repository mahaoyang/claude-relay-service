# 快速修复页面样式 - 使用新 UI 组件

## 问题现状

所有页面的 HTML 标签都没有 class 属性，导致页面完全没有样式。例如：

```vue
<!-- 当前状态 - 无样式 -->
<template>
  <div>
    <div>
      <button @click="currentTab = 'stats'">
        <span>统计查询</span>
      </button>
    </div>
  </div>
</template>
```

## 解决方案：使用新 UI 组件

### 示例 1：ApiStatsView.vue 快速修复

```vue
<script setup>
import { ref } from 'vue'
import { Card, Button, Tabs, Badge } from '@/ui'
import { BarChart3, BookOpen } from 'lucide-vue-next'

const currentTab = ref('stats')
const tabs = [
  { key: 'stats', label: '统计查询' },
  { key: 'tutorial', label: '使用教程' }
]
</script>

<template>
  <div class="min-h-screen bg-dark-bg p-6">
    <!-- 顶部区域 -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">API 统计</h1>
        <p class="text-secondary-400 mt-1">查看 API Key 使用情况</p>
      </div>
      <ThemeToggle mode="dropdown" />
    </div>

    <!-- 使用新的 Tabs 组件 -->
    <Card>
      <Tabs v-model="currentTab" :tabs="tabs">
        <template #panel-stats>
          <div class="space-y-4">
            <ApiKeyInput />
            <!-- 其他统计内容 -->
          </div>
        </template>

        <template #panel-tutorial>
          <div class="prose prose-invert">
            <h3 class="text-white">使用教程</h3>
            <!-- 教程内容 -->
          </div>
        </template>
      </Tabs>
    </Card>
  </div>
</template>
```

### 示例 2：Dashboard 统计卡片

```vue
<script setup>
import { StatCard } from '@/ui'
import { Users, Activity, Database, TrendingUp } from 'lucide-vue-next'

const stats = {
  totalKeys: 42,
  activeKeys: 38,
  totalRequests: 12543,
  todayRequests: 234
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      title="总 API Keys"
      :value="stats.totalKeys"
      :icon="Users"
      :trend="{ positive: true, value: '+5', label: '新增' }"
    />

    <StatCard
      title="活跃 Keys"
      :value="stats.activeKeys"
      :icon="Activity"
      color="success"
    />

    <StatCard
      title="总请求数"
      :value="stats.totalRequests.toLocaleString()"
      :icon="Database"
      color="info"
    />

    <StatCard
      title="今日请求"
      :value="stats.todayRequests"
      :icon="TrendingUp"
      :trend="{ positive: true, value: '+12%', label: '较昨日' }"
      color="warning"
    />
  </div>
</template>
```

### 示例 3：列表和卡片

```vue
<script setup>
import { Card, Badge, Button } from '@/ui'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'

const accounts = [
  { id: 1, name: 'Account 1', status: 'active', type: 'claude' },
  { id: 2, name: 'Account 2', status: 'error', type: 'gemini' }
]
</script>

<template>
  <Card title="账户列表">
    <template #header-action>
      <Button variant="primary" size="sm" :icon="Plus">
        添加账户
      </Button>
    </template>

    <div class="space-y-3">
      <div
        v-for="account in accounts"
        :key="account.id"
        class="flex items-center justify-between p-4 rounded-lg border border-secondary-800 bg-secondary-900/20 hover:bg-secondary-900/40 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div>
            <h4 class="text-white font-medium">{{ account.name }}</h4>
            <p class="text-sm text-secondary-400">{{ account.type }}</p>
          </div>
          <Badge :variant="account.status === 'active' ? 'success' : 'danger'">
            {{ account.status === 'active' ? '正常' : '错误' }}
          </Badge>
        </div>

        <div class="flex gap-2">
          <Button variant="ghost" size="sm" :icon="Edit">编辑</Button>
          <Button variant="danger" size="sm" :icon="Trash2">删除</Button>
        </div>
      </div>
    </div>
  </Card>
</template>
```

## 必需的 Tailwind 类

由于你使用的是暗黑主题，页面需要这些基础类：

### 布局类
```html
<!-- 页面容器 -->
<div class="min-h-screen bg-dark-bg p-6">

<!-- 网格布局 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- 弹性布局 -->
<div class="flex items-center justify-between gap-4">

<!-- 间距 -->
<div class="space-y-4">  <!-- 垂直间距 -->
<div class="space-x-4">  <!-- 水平间距 -->
```

### 文本类
```html
<!-- 标题 -->
<h1 class="text-2xl font-bold text-white">

<!-- 正文 -->
<p class="text-sm text-secondary-400">

<!-- 副标题 -->
<p class="text-secondary-300">
```

### 响应式断点
- `sm:` - 640px 以上
- `md:` - 768px 以上
- `lg:` - 1024px 以上
- `xl:` - 1280px 以上

## 全局样式类（在 tailwind.config.js 中定义）

检查你的 `tailwind.config.js` 是否有这些颜色定义：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'primary': {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        'secondary': {
          300: '#cbd5e1',
          400: '#94a3b8',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      }
    }
  }
}
```

## 快速开始

1. **更新一个页面**（推荐从简单的开始）：
   ```bash
   # 比如先更新 ApiStatsView.vue
   ```

2. **添加导入**：
   ```vue
   <script setup>
   import { Card, Button, Badge, Tabs } from '@/ui'
   </script>
   ```

3. **替换裸 HTML 为组件**：
   - `<div>` → `<Card>`
   - `<button>` → `<Button>`
   - `<span class="badge">` → `<Badge>`

4. **添加必要的 Tailwind 类**：
   - 容器：`class="p-6 space-y-4"`
   - 文本：`class="text-white"`
   - 布局：`class="flex items-center gap-4"`

## 完整示例：重构一个简单页面

```vue
<script setup>
import { ref } from 'vue'
import { Card, Button, Input, Select, Badge } from '@/ui'
import { Search, Plus } from 'lucide-vue-next'

const searchQuery = ref('')
const filterType = ref('all')
const typeOptions = [
  { value: 'all', label: '全部' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' }
]
</script>

<template>
  <div class="min-h-screen bg-dark-bg p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">账户管理</h1>
      <p class="text-secondary-400 mt-1">管理所有 API 账户</p>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6">
      <div class="flex items-center gap-4">
        <Input
          v-model="searchQuery"
          placeholder="搜索账户..."
          :icon="Search"
          class="flex-1"
        />
        <Select
          v-model="filterType"
          :options="typeOptions"
          class="w-48"
        />
        <Button variant="primary" :icon="Plus">
          添加账户
        </Button>
      </div>
    </Card>

    <!-- 账户列表 -->
    <Card title="账户列表">
      <div class="space-y-3">
        <!-- 列表项会在这里 -->
      </div>
    </Card>
  </div>
</template>
```

## 注意事项

1. **所有新组件都需要容器有暗黑背景**：
   ```html
   <div class="bg-dark-bg">
   ```

2. **文本颜色需要明确指定**：
   ```html
   <p class="text-white">  <!-- 主要文本 -->
   <p class="text-secondary-300">  <!-- 次要文本 -->
   <p class="text-secondary-400">  <!-- 辅助文本 -->
   ```

3. **间距使用 Tailwind 的工具类**：
   ```html
   <div class="p-6">  <!-- padding -->
   <div class="mb-4">  <!-- margin bottom -->
   <div class="space-y-4">  <!-- 子元素垂直间距 -->
   ```

这样页面就有样式了！🎨
