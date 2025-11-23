# UI 组件库使用示例

完整的优雅暗黑主题 UI 组件库，基于 Headless UI + Tailwind CSS 构建。

## 快速开始

```vue
<script setup>
import { Button, Card, Input, Badge, StatCard } from '@/ui'
import { Users } from 'lucide-vue-next'
</script>
```

## 组件列表

### 1. Button 按钮

```vue
<template>
  <!-- 基础按钮 -->
  <Button variant="primary">主要按钮</Button>
  <Button variant="secondary">次要按钮</Button>
  <Button variant="danger">危险按钮</Button>
  <Button variant="ghost">幽灵按钮</Button>
  <Button variant="outline">轮廓按钮</Button>

  <!-- 带图标 -->
  <Button variant="primary" :icon="Users">添加用户</Button>

  <!-- 加载状态 -->
  <Button variant="primary" :loading="true">加载中...</Button>

  <!-- 不同尺寸 -->
  <Button size="sm">小按钮</Button>
  <Button size="md">中等按钮</Button>
  <Button size="lg">大按钮</Button>
</template>
```

### 2. Card 卡片

```vue
<template>
  <!-- 基础卡片 -->
  <Card title="卡片标题" subtitle="卡片副标题">
    卡片内容
  </Card>

  <!-- 可悬停效果 -->
  <Card title="标题" hover>
    <p>卡片内容</p>
  </Card>

  <!-- 无内边距 -->
  <Card title="标题" noPadding>
    <div>自定义内容</div>
  </Card>

  <!-- 带底部 -->
  <Card title="标题">
    主体内容
    <template #footer>
      <Button size="sm">操作</Button>
    </template>
  </Card>
</template>
```

### 3. StatCard 统计卡片

```vue
<script setup>
import { StatCard } from '@/ui'
import { Users, TrendingUp } from 'lucide-vue-next'

const trend = {
  positive: true,
  value: '+12.5%',
  label: '较上周'
}
</script>

<template>
  <!-- 基础统计卡片 -->
  <StatCard title="总用户数" value="1,234" :icon="Users" />

  <!-- 带趋势指示器 -->
  <StatCard title="总用户数" value="1,234" :icon="Users" :trend="trend" />

  <!-- 不同颜色 -->
  <StatCard title="总用户数" value="1,234" :icon="Users" color="success" />
  <StatCard title="警告数" value="42" :icon="AlertTriangle" color="warning" />
  <StatCard title="错误数" value="8" :icon="AlertCircle" color="danger" />

  <!-- 加载状态 -->
  <StatCard title="加载中" value="" :icon="Users" :loading="true" />

  <!-- 带操作 -->
  <StatCard title="总用户数" value="1,234" :icon="Users">
    <template #action>
      <Button size="sm" variant="ghost">查看详情</Button>
    </template>
  </StatCard>
</template>
```

### 4. Input 输入框

```vue
<script setup>
import { Input } from '@/ui'
import { Mail } from 'lucide-vue-next'
import { ref } from 'vue'

const email = ref('')
const error = ref('邮箱格式不正确')
</script>

<template>
  <!-- 基础输入框 -->
  <Input v-model="email" label="邮箱" placeholder="请输入邮箱" />

  <!-- 带图标 -->
  <Input v-model="email" label="邮箱" placeholder="请输入邮箱" :icon="Mail" />

  <!-- 带错误提示 -->
  <Input v-model="email" label="邮箱" placeholder="请输入邮箱" :error="error" />

  <!-- 禁用状态 -->
  <Input v-model="email" label="邮箱" :disabled="true" />
</template>
```

### 5. Textarea 文本域

```vue
<script setup>
import { Textarea } from '@/ui'
import { ref } from 'vue'

const content = ref('')
</script>

<template>
  <Textarea v-model="content" label="内容" placeholder="请输入内容" :rows="4" />
</template>
```

### 6. Select 选择器

```vue
<script setup>
import { Select } from '@/ui'
import { ref } from 'vue'

const selected = ref('')
const options = [
  { value: '1', label: '选项 1' },
  { value: '2', label: '选项 2' },
  { value: '3', label: '选项 3' }
]
</script>

<template>
  <Select
    v-model="selected"
    label="选择"
    placeholder="请选择"
    :options="options"
  />
</template>
```

### 7. Switch 开关

```vue
<script setup>
import { Switch } from '@/ui'
import { ref } from 'vue'

const enabled = ref(false)
</script>

<template>
  <Switch v-model="enabled" label="启用功能" />
</template>
```

### 8. Badge 徽章

```vue
<template>
  <!-- 不同变体 -->
  <Badge variant="primary">主要</Badge>
  <Badge variant="success">成功</Badge>
  <Badge variant="warning">警告</Badge>
  <Badge variant="danger">危险</Badge>
  <Badge variant="info">信息</Badge>
  <Badge variant="neutral">中性</Badge>

  <!-- 带点 -->
  <Badge variant="success" dot>在线</Badge>

  <!-- 不同尺寸 -->
  <Badge size="sm">小</Badge>
  <Badge size="md">中</Badge>
</template>
```

### 9. Dialog 对话框

```vue
<script setup>
import { Dialog, Button } from '@/ui'
import { ref } from 'vue'

const isOpen = ref(false)
</script>

<template>
  <Button @click="isOpen = true">打开对话框</Button>

  <Dialog v-model="isOpen" title="对话框标题" size="md">
    <p>对话框内容</p>

    <template #footer>
      <Button variant="ghost" @click="isOpen = false">取消</Button>
      <Button variant="primary" @click="isOpen = false">确认</Button>
    </template>
  </Dialog>
</template>
```

### 10. Menu 下拉菜单

```vue
<script setup>
import { Menu, MenuItem } from '@/ui'
import { Settings, User, LogOut } from 'lucide-vue-next'
</script>

<template>
  <Menu button-text="选项">
    <template #button>
      <button class="flex items-center gap-2">
        <Settings :size="16" />
        <span>设置</span>
      </button>
    </template>

    <MenuItem :icon="User" @click="handleProfile">个人资料</MenuItem>
    <MenuItem :icon="Settings" @click="handleSettings">设置</MenuItem>
    <MenuItem :icon="LogOut" @click="handleLogout">退出</MenuItem>
  </Menu>
</template>
```

### 11. Tabs 标签页

```vue
<script setup>
import { Tabs } from '@/ui'
import { ref } from 'vue'

const activeTab = ref('tab1')
const tabs = [
  { key: 'tab1', label: '标签 1' },
  { key: 'tab2', label: '标签 2' },
  { key: 'tab3', label: '标签 3' }
]
</script>

<template>
  <Tabs v-model="activeTab" :tabs="tabs">
    <template #panel-tab1>
      <p>标签 1 的内容</p>
    </template>
    <template #panel-tab2>
      <p>标签 2 的内容</p>
    </template>
    <template #panel-tab3>
      <p>标签 3 的内容</p>
    </template>
  </Tabs>
</template>
```

### 12. Alert 警告提示

```vue
<template>
  <!-- 不同变体 -->
  <Alert variant="success" title="成功">操作已成功完成</Alert>
  <Alert variant="warning" title="警告">请注意这个操作</Alert>
  <Alert variant="danger" title="错误">发生了一个错误</Alert>
  <Alert variant="info" title="提示">这是一条提示信息</Alert>

  <!-- 可关闭 -->
  <Alert variant="info" title="提示" :closable="true" @close="handleClose">
    这条消息可以关闭
  </Alert>
</template>
```

### 13. Spinner 加载指示器

```vue
<template>
  <!-- 不同尺寸 -->
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />

  <!-- 在按钮中使用 -->
  <Button :loading="true">加载中...</Button>
</template>
```

## 完整示例：Dashboard 页面

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { StatCard, Card, Button, Badge, Tabs } from '@/ui'
import { Users, Activity, DollarSign, TrendingUp } from 'lucide-vue-next'

const activeTab = ref('overview')
const tabs = [
  { key: 'overview', label: '概览' },
  { key: 'analytics', label: '分析' },
  { key: 'reports', label: '报告' }
]

const stats = ref({
  users: 1234,
  requests: 5678,
  revenue: '$12,345',
  uptime: '99.9%'
})

const trend = { positive: true, value: '+12.5%', label: '较上周' }
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">仪表盘</h1>
        <p class="text-secondary-400 mt-1">欢迎回来，管理员</p>
      </div>
      <Button variant="primary" :icon="Plus">创建项目</Button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="总用户数"
        :value="stats.users"
        :icon="Users"
        :trend="trend"
        color="primary"
      />
      <StatCard
        title="今日请求"
        :value="stats.requests"
        :icon="Activity"
        :trend="trend"
        color="success"
      />
      <StatCard title="总收入" :value="stats.revenue" :icon="DollarSign" color="warning" />
      <StatCard title="系统运行时间" :value="stats.uptime" :icon="TrendingUp" color="info" />
    </div>

    <!-- Tabs Section -->
    <Card title="数据分析">
      <Tabs v-model="activeTab" :tabs="tabs">
        <template #panel-overview>
          <div class="space-y-4">
            <p class="text-secondary-300">概览内容...</p>
          </div>
        </template>
        <template #panel-analytics>
          <p class="text-secondary-300">分析内容...</p>
        </template>
        <template #panel-reports>
          <p class="text-secondary-300">报告内容...</p>
        </template>
      </Tabs>
    </Card>

    <!-- Recent Activity -->
    <Card title="最近活动">
      <div class="space-y-3">
        <div class="flex items-center justify-between py-2 border-b border-secondary-800">
          <div>
            <p class="text-white">用户登录</p>
            <p class="text-sm text-secondary-400">2 分钟前</p>
          </div>
          <Badge variant="success">成功</Badge>
        </div>
        <div class="flex items-center justify-between py-2 border-b border-secondary-800">
          <div>
            <p class="text-white">API 调用</p>
            <p class="text-sm text-secondary-400">5 分钟前</p>
          </div>
          <Badge variant="info">完成</Badge>
        </div>
      </div>
    </Card>
  </div>
</template>
```

## 主题定制

所有组件都使用统一的主题系统，颜色在 `themes/tokens.js` 中定义：

```javascript
// 自定义主色调
colors: {
  primary: 'teal-500',    // 主色
  secondary: 'indigo-500'  // 次色
}
```

## 暗黑模式

所有组件原生支持暗黑模式，无需额外配置。使用 Tailwind CSS 的 `dark:` 前缀自动适配。

## 响应式设计

所有组件都经过响应式优化，支持：

- 手机端 (< 640px)
- 平板端 (640px - 1024px)
- 桌面端 (> 1024px)

使用 Tailwind 的响应式前缀：`sm:`、`md:`、`lg:`、`xl:`

## 最佳实践

1. **统一导入**: 从 `@/ui` 统一导入所有组件
2. **类型验证**: 使用 prop validators 确保参数正确
3. **v-model**: 表单组件都支持 v-model 双向绑定
4. **插槽**: 充分利用具名插槽自定义内容
5. **图标**: 使用 `lucide-vue-next` 图标库保持一致性

## 组件清单

- ✅ Button - 按钮
- ✅ Badge - 徽章
- ✅ Card - 卡片
- ✅ Input - 输入框
- ✅ Textarea - 文本域
- ✅ Select - 选择器
- ✅ Switch - 开关
- ✅ Spinner - 加载指示器
- ✅ Dialog - 对话框
- ✅ Menu - 下拉菜单
- ✅ MenuItem - 菜单项
- ✅ Tabs - 标签页
- ✅ Alert - 警告提示
- ✅ StatCard - 统计卡片

总计：**14 个组件**，全部支持暗黑模式和响应式设计！
