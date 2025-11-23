# Headless UI 无头组件架构指南

## 📁 目录结构

```
src/
├── components/
│   ├── ui/                    # 新的样式化基础 UI 组件
│   │   ├── Dialog.vue         # 对话框（基于 Headless UI）
│   │   ├── ConfirmDialog.vue  # 确认对话框
│   │   ├── Button.vue         # 按钮组件
│   │   ├── Menu.vue           # 下拉菜单
│   │   └── MenuItem.vue       # 菜单项
│   ├── common/                # 现有通用组件（待迁移）
│   └── ...                    # 其他业务组件
├── composables/
│   └── ui/                    # UI 逻辑 composables
│       ├── useTheme.js        # 主题样式访问
│       └── useDialog.js       # 对话框逻辑
├── themes/
│   ├── tokens.js              # 设计 tokens（颜色、间距等）
│   └── components.js          # 组件样式配置
└── stores/
    └── theme.js               # 现有的主题 store（明/暗模式）
```

## 🎯 核心概念

### 1. **分离关注点**

- **Headless Layer** (无头层): 逻辑、状态、可访问性
- **Theme Layer** (主题层): 颜色、间距、字体等设计 tokens
- **Component Layer** (组件层): 组合逻辑 + 样式的最终组件

### 2. **主题系统**

#### Design Tokens (`themes/tokens.js`)

```javascript
export const tokens = {
  colors: {
    primary: { DEFAULT: 'teal-600', hover: 'teal-700' },
    neutral: {
      bg: 'bg-white dark:bg-gray-900',
      text: { primary: 'text-gray-900 dark:text-gray-100' }
    }
  },
  spacing: { md: '1rem', lg: '1.5rem' },
  radius: { md: 'rounded-md', lg: 'rounded-lg' }
}
```

#### 组件样式配置 (`themes/components.js`)

```javascript
export const componentStyles = {
  dialog: {
    overlay: 'fixed inset-0 bg-black/50 dark:bg-black/70...',
    panel: 'relative w-full max-w-md bg-white dark:bg-gray-800...',
    title: 'text-lg font-semibold text-gray-900 dark:text-gray-100'
  },
  button: {
    base: 'inline-flex items-center justify-center...',
    variants: {
      primary: 'bg-teal-600 hover:bg-teal-700 text-white...',
      secondary: 'bg-gray-200 hover:bg-gray-300...'
    }
  }
}
```

## 🚀 使用指南

### 1. Dialog 组件

#### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'

const isOpen = ref(false)
</script>

<template>
  <button @click="isOpen = true">打开对话框</button>

  <Dialog
    :is-open="isOpen"
    title="对话框标题"
    description="这是对话框的描述"
    @close="isOpen = false"
  >
    <!-- 内容 -->
    <p>对话框主体内容</p>

    <!-- 底部操作 -->
    <template #footer="{ close }">
      <button @click="close">关闭</button>
    </template>
  </Dialog>
</template>
```

#### 自定义样式

```vue
<Dialog
  :is-open="isOpen"
  panel-class="max-w-2xl"  <!-- 自定义宽度 -->
  @close="isOpen = false"
>
  <div class="custom-content">...</div>
</Dialog>
```

### 2. ConfirmDialog 组件

#### 在组件中使用

```vue
<script setup>
import { ref } from 'vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const confirmDialogRef = ref(null)

const handleDelete = async () => {
  const confirmed = await confirmDialogRef.value?.showConfirm(
    '确认删除',
    '此操作不可撤销，确定要删除吗？',
    {
      confirmTextParam: '删除',
      cancelTextParam: '取消',
      variant: 'danger' // warning | danger | info | success | default
    }
  )

  if (confirmed) {
    // 执行删除操作
    console.log('用户确认删除')
  }
}
</script>

<template>
  <button @click="handleDelete">删除</button>
  <ConfirmDialog ref="confirmDialogRef" />
</template>
```

#### 全局使用（兼容旧版）

```javascript
// 在 App.vue 或 main.js 中注册
const confirmDialogRef = ref(null)

onMounted(() => {
  window.showConfirm = confirmDialogRef.value?.showConfirm
})
```

### 3. Button 组件

```vue
<script setup>
import Button from '@/components/ui/Button.vue'
import { Save } from 'lucide-vue-next'
</script>

<template>
  <!-- 基础按钮 -->
  <Button variant="primary" @click="handleSave"> 保存 </Button>

  <!-- 带图标 -->
  <Button variant="secondary" :icon="Save" icon-position="left"> 保存文件 </Button>

  <!-- Loading 状态 -->
  <Button variant="primary" :loading="isLoading"> 提交中... </Button>

  <!-- 不同尺寸 -->
  <Button size="sm">小按钮</Button>
  <Button size="md">中等按钮</Button>
  <Button size="lg">大按钮</Button>

  <!-- 不同变体 -->
  <Button variant="primary">主要</Button>
  <Button variant="secondary">次要</Button>
  <Button variant="danger">危险</Button>
  <Button variant="ghost">幽灵</Button>
  <Button variant="outline">轮廓</Button>
</template>
```

### 4. Menu 组件

```vue
<script setup>
import Menu from '@/components/ui/Menu.vue'
import MenuItem from '@/components/ui/MenuItem.vue'
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

    <MenuItem :icon="User" @click="handleProfile"> 个人资料 </MenuItem>
    <MenuItem :icon="Settings" @click="handleSettings"> 设置 </MenuItem>
    <MenuItem :icon="LogOut" @click="handleLogout"> 退出登录 </MenuItem>
  </Menu>
</template>
```

### 5. 使用 useTheme Composable

```vue
<script setup>
import { useTheme } from '@/composables/ui/useTheme'

const { styles, cn, variant, getToken } = useTheme('button')

// 获取组件样式
const buttonClass = cn(styles.base, styles.variants.primary, 'custom-class')

// 获取 token 值
const primaryColor = getToken('colors.primary.DEFAULT') // 'teal-600'

// 使用 variant 函数
const cardClass = variant('base-styles', { default: 'bg-white', active: 'bg-blue-50' }, 'active')
</script>

<template>
  <button :class="buttonClass">按钮</button>
</template>
```

## 📝 迁移指南

### 从旧版 ConfirmDialog 迁移

#### 旧版用法

```javascript
// 全局调用
const result = await window.showConfirm('标题', '消息', '确认', '取消')
```

#### 新版用法

```javascript
// 方式 1: 组件 ref（推荐）
const confirmDialogRef = ref(null)
const result = await confirmDialogRef.value?.showConfirm(
  '标题',
  '消息',
  { confirmTextParam: '确认', cancelTextParam: '取消', variant: 'warning' }
)

// 方式 2: 全局调用（兼容旧版）
const result = await window.showConfirm('标题', '消息', { ... })
```

**变化点：**

- ✅ 新增 `variant` 参数支持不同风格（warning/danger/info/success）
- ✅ 参数从位置参数改为 options 对象（更灵活）
- ✅ 完全兼容暗黑模式
- ✅ 基于 Headless UI，更好的可访问性

### 迁移步骤示例

#### 1. 替换 Dialog 组件

**旧版（自定义实现）：**

```vue
<div v-if="showModal" class="modal-overlay" @click="close">
  <div class="modal-content">
    <h3>{{ title }}</h3>
    <div>{{ content }}</div>
    <button @click="close">关闭</button>
  </div>
</div>
```

**新版（Headless UI）：**

```vue
<Dialog :is-open="showModal" :title="title" @close="close">
  {{ content }}
  <template #footer="{ close }">
    <Button @click="close">关闭</Button>
  </template>
</Dialog>
```

#### 2. 替换按钮

**旧版：**

```vue
<button class="btn bg-teal-600 text-white hover:bg-teal-700">
  保存
</button>
```

**新版：**

```vue
<Button variant="primary">保存</Button>
```

## 🎨 自定义主题

### 修改设计 tokens

编辑 `src/themes/tokens.js`：

```javascript
export const tokens = {
  colors: {
    primary: {
      DEFAULT: 'blue-600', // 改为蓝色
      hover: 'blue-700'
    }
  }
}
```

### 添加新组件样式

编辑 `src/themes/components.js`：

```javascript
export const componentStyles = {
  // ... 现有样式

  // 添加新组件
  tooltip: {
    container: 'absolute z-50 px-3 py-2 text-sm',
    arrow: 'absolute w-2 h-2',
    variants: {
      dark: 'bg-gray-900 text-white',
      light: 'bg-white text-gray-900 shadow-lg'
    }
  }
}
```

## 🔧 开发工具函数

### cn() - 条件类名合并

```javascript
const { cn } = useTheme()

const className = cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class',
  null, // 会被过滤
  'another-class'
)
// 结果: 'base-class active-class another-class'
```

### variant() - 变体选择器

```javascript
const { variant } = useTheme()

const buttonClass = variant(
  'px-4 py-2 rounded', // 基础样式
  {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-900'
  },
  'primary' // 当前变体
)
```

## 📦 可用的 UI 组件

### 已创建

- ✅ Dialog - 对话框
- ✅ ConfirmDialog - 确认对话框
- ✅ Button - 按钮
- ✅ Menu / MenuItem - 下拉菜单

### 待创建（建议优先级）

1. **Input** - 输入框
2. **Select** - 选择器
3. **Switch** - 开关
4. **Tabs** - 标签页
5. **Popover** - 弹出框
6. **Tooltip** - 提示
7. **RadioGroup** - 单选组
8. **Checkbox** - 复选框
9. **Combobox** - 组合框

## 🎯 最佳实践

### 1. 组件组合优先

```vue
<!-- ✅ 好的做法 -->
<Dialog :is-open="isOpen" @close="handleClose">
  <div class="space-y-4">
    <Input v-model="name" label="姓名" />
    <Button variant="primary" @click="handleSubmit">提交</Button>
  </div>
</Dialog>

<!-- ❌ 避免 -->
<!-- 不要创建过度封装的 FormDialog，保持组件灵活性 -->
```

### 2. 样式放在主题配置中

```javascript
// ✅ 好的做法 - 在 themes/components.js 中
export const componentStyles = {
  card: {
    base: 'rounded-lg shadow-md bg-white dark:bg-gray-800'
  }
}

// ❌ 避免 - 在组件内硬编码样式
<div class="rounded-lg shadow-md bg-white dark:bg-gray-800">
```

### 3. 使用 composables 共享逻辑

```javascript
// composables/ui/useForm.js
export function useForm() {
  const errors = ref({})
  const validate = (field) => {
    /* ... */
  }
  return { errors, validate }
}

// 在多个组件中复用
const { errors, validate } = useForm()
```

### 4. 保持响应式设计

所有新组件必须支持响应式：

```vue
<Dialog panel-class="max-w-md md:max-w-lg lg:max-w-2xl">
  <!-- 内容自适应 -->
</Dialog>
```

## 📚 参考资源

- [Headless UI 官方文档](https://headlessui.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Lucide Icons](https://lucide.dev/icons/) - 项目使用的图标库

## 🤝 贡献指南

创建新的 UI 组件时：

1. **创建无头逻辑 composable** (`composables/ui/use*.js`)
2. **在主题配置中定义样式** (`themes/components.js`)
3. **创建组件** (`components/ui/*.vue`)
4. **更新本文档** 添加使用示例
5. **格式化代码** `npx prettier --write <file>`

---

最后更新：2025-01-20
