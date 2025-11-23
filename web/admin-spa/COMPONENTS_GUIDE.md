# 完整组件使用指南

## 🎉 已创建的所有组件 (17个)

### 表单组件 (6个)

1. ✅ **Input** - 输入框
2. ✅ **Textarea** - 多行文本
3. ✅ **Select** - 下拉选择
4. ✅ **Switch** - 开关
5. ✅ **RadioGroup** - 单选组
6. ✅ **Checkbox** - 复选框

### 交互组件 (5个)

7. ✅ **Button** - 按钮
8. ✅ **Dialog** - 对话框
9. ✅ **ConfirmDialog** - 确认对话框
10. ✅ **Menu/MenuItem** - 下拉菜单

### 布局组件 (3个)

11. ✅ **Card** - 卡片
12. ✅ **Tabs** - 标签页
13. ✅ **Popover** - 弹出框

### 反馈组件 (3个)

14. ✅ **Badge** - 徽章
15. ✅ **Alert** - 警告提示
16. ✅ **Spinner** - 加载指示器

---

## 📖 详细使用指南

### 1️⃣ Input - 输入框

#### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { Input } from '@/components/ui'

const value = ref('')
</script>

<template>
  <Input
    v-model="value"
    label="用户名"
    placeholder="请输入用户名"
    helperText="用户名长度为 3-20 个字符"
  />
</template>
```

#### 高级功能

```vue
<template>
  <!-- 带前缀图标 -->
  <Input v-model="email" type="email" label="邮箱" :prefix-icon="Mail" />

  <!-- 可清空 -->
  <Input v-model="search" clearable placeholder="搜索..." />

  <!-- 错误状态 -->
  <Input v-model="username" label="用户名" error="用户名已存在" />

  <!-- 禁用和只读 -->
  <Input v-model="value" disabled />
  <Input v-model="value" readonly />
</template>
```

**Props:**

- `modelValue` - 绑定值
- `type` - 类型 (text/email/password/number/tel/url/search)
- `label` - 标签
- `placeholder` - 占位符
- `helperText` - 帮助文本
- `error` - 错误信息
- `disabled` - 禁用
- `readonly` - 只读
- `required` - 必填
- `clearable` - 可清空
- `prefixIcon` - 前缀图标
- `suffixIcon` - 后缀图标

---

### 2️⃣ Textarea - 多行文本

```vue
<template>
  <Textarea
    v-model="description"
    label="描述"
    placeholder="请输入描述"
    :rows="4"
    :max-length="200"
    show-count
    helperText="详细描述您的需求"
  />

  <!-- 禁用调整大小 -->
  <Textarea v-model="text" resize="none" />
</template>
```

**Props:**

- `resize` - 调整大小 (none/both/horizontal/vertical)
- `rows` - 行数 (默认 3)
- `maxLength` - 最大长度
- `showCount` - 显示字符计数

---

### 3️⃣ Select - 下拉选择

```vue
<script setup>
import { ref } from 'vue'
import { Select } from '@/components/ui'

const selected = ref(null)
const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' }
]
</script>

<template>
  <Select
    v-model="selected"
    :options="options"
    label="选择选项"
    placeholder="请选择"
    helperText="请从列表中选择一项"
  />
</template>
```

**Props:**

- `options` - 选项数组 (必填)
- `optionLabel` - 选项标签字段 (默认 'label')
- `optionValue` - 选项值字段 (默认 'value')
- `placeholder` - 占位符
- `emptyText` - 空状态文本

---

### 4️⃣ Switch - 开关

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from '@/components/ui'

const enabled = ref(false)
</script>

<template>
  <!-- 基础用法 -->
  <Switch v-model="enabled" label="启用通知" />

  <!-- 不同尺寸 -->
  <Switch v-model="enabled" size="sm" label="小尺寸" />
  <Switch v-model="enabled" size="md" label="中等尺寸" />
  <Switch v-model="enabled" size="lg" label="大尺寸" />

  <!-- 禁用 -->
  <Switch v-model="enabled" label="禁用状态" disabled />
</template>
```

**Props:**

- `modelValue` - 绑定值 (Boolean)
- `label` - 标签
- `size` - 尺寸 (sm/md/lg)
- `disabled` - 禁用

---

### 5️⃣ RadioGroup - 单选组

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup } from '@/components/ui'

const selected = ref('1')
const options = [
  { label: 'Option 1', value: '1', description: '这是选项 1 的描述' },
  { label: 'Option 2', value: '2', description: '这是选项 2 的描述' },
  { label: 'Option 3', value: '3', disabled: true }
]
</script>

<template>
  <!-- 垂直布局 -->
  <RadioGroup v-model="selected" :options="options" label="请选择一项" direction="vertical" />

  <!-- 水平布局 -->
  <RadioGroup v-model="selected" :options="options" direction="horizontal" />
</template>
```

**Props:**

- `options` - 选项数组 (必填)
- `direction` - 方向 (vertical/horizontal)
- 每个 option 可包含: label, value, description, disabled

---

### 6️⃣ Checkbox - 复选框

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox } from '@/components/ui'

const checked = ref(false)
const selected = ref([])
</script>

<template>
  <!-- 单个复选框 -->
  <Checkbox v-model="checked" label="同意条款" />

  <!-- 带描述 -->
  <Checkbox v-model="checked" label="接收邮件通知" description="我们会向您发送产品更新和优惠信息" />

  <!-- 多选 (绑定数组) -->
  <Checkbox v-model="selected" value="option1" label="选项 1" />
  <Checkbox v-model="selected" value="option2" label="选项 2" />
  <Checkbox v-model="selected" value="option3" label="选项 3" />

  <!-- 禁用 -->
  <Checkbox v-model="checked" label="禁用状态" disabled />
</template>
```

**Props:**

- `modelValue` - Boolean 或 Array
- `value` - 当 modelValue 为数组时的值
- `label` - 标签
- `description` - 描述文本

---

### 7️⃣ Card - 卡片

```vue
<script setup>
import { Card } from '@/components/ui'
</script>

<template>
  <!-- 基础用法 -->
  <Card title="卡片标题">
    <p>卡片内容</p>
  </Card>

  <!-- 自定义头部和底部 -->
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <h3>自定义头部</h3>
        <button>操作</button>
      </div>
    </template>

    <p>卡片主体内容</p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="secondary">取消</Button>
        <Button variant="primary">确认</Button>
      </div>
    </template>
  </Card>

  <!-- 不同变体 -->
  <Card variant="default">默认卡片</Card>
  <Card variant="bordered">带边框</Card>
  <Card variant="elevated">阴影卡片</Card>

  <!-- 不同内边距 -->
  <Card padding="none">无内边距</Card>
  <Card padding="sm">小内边距</Card>
  <Card padding="lg">大内边距</Card>
</template>
```

**Props:**

- `title` - 标题
- `variant` - 变体 (default/bordered/elevated)
- `padding` - 内边距 (none/sm/normal/lg)

---

### 8️⃣ Tabs - 标签页

```vue
<script setup>
import { ref } from 'vue'
import { Tabs } from '@/components/ui'
import { Home, Settings, User } from 'lucide-vue-next'

const selectedTab = ref(0)

const tabs = [
  { key: 'home', label: '首页', icon: Home, badge: '3' },
  { key: 'profile', label: '个人资料', icon: User },
  { key: 'settings', label: '设置', icon: Settings, disabled: true }
]
</script>

<template>
  <Tabs v-model="selectedTab" :tabs="tabs">
    <template #panel-home>
      <div>首页内容</div>
    </template>

    <template #panel-profile>
      <div>个人资料内容</div>
    </template>

    <template #panel-settings>
      <div>设置内容</div>
    </template>
  </Tabs>
</template>
```

**Props:**

- `tabs` - 标签数组 (必填)
- `modelValue` - 当前选中的索引
- `unmount` - 未选中的面板是否卸载 (默认 true)

**Tabs 配置:**

- `key` - 唯一标识
- `label` - 标签文本
- `icon` - 图标组件 (可选)
- `badge` - 徽章文本 (可选)
- `disabled` - 禁用 (可选)

---

### 9️⃣ Badge - 徽章

```vue
<template>
  <!-- 不同变体 -->
  <Badge variant="success">成功</Badge>
  <Badge variant="warning">警告</Badge>
  <Badge variant="error">错误</Badge>
  <Badge variant="info">信息</Badge>
  <Badge variant="neutral">中性</Badge>

  <!-- 不同尺寸 -->
  <Badge size="sm">小徽章</Badge>
  <Badge size="md">中等徽章</Badge>
  <Badge size="lg">大徽章</Badge>

  <!-- 圆形 (pill) -->
  <Badge rounded>圆形徽章</Badge>

  <!-- 带图标 -->
  <Badge :icon="Check" icon-position="left">已完成</Badge>

  <!-- 可关闭 -->
  <Badge closable @close="handleClose">可关闭</Badge>
</template>
```

**Props:**

- `variant` - 变体 (success/warning/error/info/neutral)
- `size` - 尺寸 (sm/md/lg)
- `rounded` - 圆形
- `closable` - 可关闭
- `icon` - 图标组件

---

### 🔟 Alert - 警告提示

```vue
<template>
  <!-- 不同类型 -->
  <Alert variant="success" title="成功" message="操作已成功完成" />
  <Alert variant="warning" title="警告" message="请注意相关风险" />
  <Alert variant="error" title="错误" message="操作失败，请重试" />
  <Alert variant="info" title="提示" message="这是一条提示信息" />

  <!-- 可关闭 -->
  <Alert
    variant="info"
    title="重要通知"
    message="这是一条可关闭的通知"
    closable
    @close="handleClose"
  />

  <!-- 带边框 -->
  <Alert variant="success" message="带边框的警告" bordered />

  <!-- 自定义内容 -->
  <Alert variant="info" title="自定义内容">
    <div class="mt-2">
      <p>自定义 HTML 内容</p>
      <button class="mt-2 text-blue-600">查看详情</button>
    </div>
  </Alert>
</template>
```

**Props:**

- `variant` - 类型 (success/warning/error/info)
- `title` - 标题
- `message` - 消息
- `showIcon` - 显示图标 (默认 true)
- `closable` - 可关闭
- `bordered` - 显示左边框

---

### 1️⃣1️⃣ Spinner - 加载指示器

```vue
<template>
  <!-- 基础用法 -->
  <Spinner />

  <!-- 不同尺寸 -->
  <Spinner size="xs" />
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
  <Spinner size="xl" />
  <Spinner :size="60" />
  <!-- 自定义 px -->

  <!-- 不同颜色 -->
  <Spinner color="primary" />
  <Spinner color="success" />
  <Spinner color="warning" />
  <Spinner color="error" />
  <Spinner color="white" />

  <!-- 带标签 -->
  <Spinner label="加载中..." />

  <!-- 居中全屏 -->
  <Spinner center label="正在加载数据..." />

  <!-- 自定义厚度 -->
  <Spinner :thickness="4" />
</template>
```

**Props:**

- `size` - 尺寸 (xs/sm/md/lg/xl 或数字)
- `color` - 颜色 (primary/secondary/success/warning/error/white)
- `thickness` - 边框厚度
- `label` - 标签文本
- `center` - 居中全屏

---

### 1️⃣2️⃣ Popover - 弹出框

```vue
<script setup>
import { Popover } from '@/components/ui'
</script>

<template>
  <!-- 基础用法 -->
  <Popover button-text="点击打开">
    <p>这是弹出框的内容</p>
  </Popover>

  <!-- 自定义按钮 -->
  <Popover>
    <template #button="{ open }">
      <Button :variant="open ? 'primary' : 'secondary'"> 自定义按钮 </Button>
    </template>

    <div>弹出框内容</div>
  </Popover>

  <!-- 带头部和底部 -->
  <Popover title="操作确认">
    <template #header>
      <h3 class="font-semibold">自定义头部</h3>
    </template>

    <p>确定要执行此操作吗？</p>

    <template #footer>
      <div class="flex gap-2">
        <Button size="sm" variant="secondary">取消</Button>
        <Button size="sm" variant="primary">确认</Button>
      </div>
    </template>
  </Popover>

  <!-- 不同位置 -->
  <Popover placement="top">上方弹出</Popover>
  <Popover placement="bottom">下方弹出</Popover>
  <Popover placement="left">左侧弹出</Popover>
  <Popover placement="right">右侧弹出</Popover>

  <!-- 不同宽度 -->
  <Popover width="xs">超小</Popover>
  <Popover width="sm">小</Popover>
  <Popover width="md">中等</Popover>
  <Popover width="lg">大</Popover>

  <!-- 带箭头 -->
  <Popover arrow>带箭头</Popover>
</template>
```

**Props:**

- `title` - 标题
- `buttonText` - 按钮文本
- `placement` - 位置 (top/bottom/left/right)
- `width` - 宽度 (xs/sm/md/lg/xl/full)
- `arrow` - 显示箭头

---

## 🎨 完整使用示例

### 注册表单示例

```vue
<script setup>
import { ref } from 'vue'
import {
  Card,
  Input,
  Textarea,
  Select,
  Switch,
  RadioGroup,
  Checkbox,
  Button,
  Alert,
  Spinner
} from '@/components/ui'
import { User, Mail, Lock } from 'lucide-vue-next'

const form = ref({
  username: '',
  email: '',
  password: '',
  bio: '',
  country: null,
  notifications: true,
  gender: 'male',
  terms: false
})

const countries = [
  { label: '中国', value: 'cn' },
  { label: '美国', value: 'us' },
  { label: '日本', value: 'jp' }
]

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''

  if (!form.value.terms) {
    error.value = '请先同意服务条款'
    return
  }

  loading.value = true

  try {
    // 提交表单...
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert('注册成功！')
  } catch (e) {
    error.value = '注册失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Card title="用户注册" class="mx-auto max-w-2xl">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 错误提示 -->
      <Alert v-if="error" variant="error" :message="error" closable @close="error = ''" />

      <!-- 用户名 -->
      <Input
        v-model="form.username"
        label="用户名"
        placeholder="请输入用户名"
        :prefix-icon="User"
        required
        helperText="用户名长度为 3-20 个字符"
      />

      <!-- 邮箱 -->
      <Input
        v-model="form.email"
        type="email"
        label="邮箱"
        placeholder="your@email.com"
        :prefix-icon="Mail"
        required
      />

      <!-- 密码 -->
      <Input
        v-model="form.password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        :prefix-icon="Lock"
        required
        helperText="密码至少 8 个字符"
      />

      <!-- 国家 -->
      <Select
        v-model="form.country"
        :options="countries"
        label="国家"
        placeholder="请选择国家"
        required
      />

      <!-- 个人简介 -->
      <Textarea
        v-model="form.bio"
        label="个人简介"
        placeholder="介绍一下自己..."
        :rows="4"
        :max-length="200"
        show-count
      />

      <!-- 性别 -->
      <RadioGroup
        v-model="form.gender"
        :options="genderOptions"
        label="性别"
        direction="horizontal"
      />

      <!-- 通知开关 -->
      <Switch v-model="form.notifications" label="接收邮件通知" />

      <!-- 服务条款 -->
      <Checkbox v-model="form.terms" label="我已阅读并同意服务条款" required />

      <!-- 提交按钮 -->
      <div class="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary"> 取消 </Button>
        <Button type="submit" variant="primary" :loading="loading" :disabled="!form.terms">
          {{ loading ? '注册中...' : '立即注册' }}
        </Button>
      </div>
    </form>
  </Card>

  <!-- 全屏加载 -->
  <Spinner v-if="loading" center label="正在注册..." />
</template>
```

---

## 📚 更多资源

- [Headless UI 官方文档](https://headlessui.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [项目架构总结](./UI_ARCHITECTURE_SUMMARY.md)
- [迁移指南](./MIGRATION_EXAMPLE.md)

---

最后更新：2025-01-20
