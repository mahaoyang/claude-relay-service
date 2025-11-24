# 组件集成指南

本文档展示如何在AccountForm.vue中使用提取的组件。

## 组件依赖关系

```
AccountForm.vue (主文件)
├── PlatformSelector.vue          (平台选择)
├── BasicInfoForm.vue             (基本信息)
├── ProxyConfig.vue               (代理配置 - 已存在)
├── ModelRestrictionConfig.vue    (模型限制)
└── AccountExpiryEditModal.vue    (过期管理 - 已存在)
```

---

## 完整集成示例

### 1. 在AccountForm.vue中引入组件

```vue
<script setup>
import { ref, reactive, computed } from 'vue'
import PlatformSelector from './PlatformSelector.vue'
import BasicInfoForm from './BasicInfoForm.vue'
import ProxyConfig from './ProxyConfig.vue'
import ModelRestrictionConfig from './ModelRestrictionConfig.vue'
import AccountExpiryEditModal from './AccountExpiryEditModal.vue'
import { useProxyManagement } from '@/composables/useProxyManagement'
import { useFormSubmission } from '@/composables/useFormSubmission'

const props = defineProps({
  account: Object,
  isEdit: Boolean
})

// 表单数据
const formData = reactive({
  // 平台相关
  platform: '',

  // 基本信息
  name: '',
  description: '',
  accountType: 'shared',
  groupIds: [],
  expiresAt: null,

  // 模型限制
  modelRestriction: {
    mode: 'whitelist',
    allowedModels: [],
    mappings: []
  }
})

// 代理管理
const {
  proxyState,
  getProxyPayload,
  validate: validateProxy
} = useProxyManagement({
  initialProxy: props.account?.proxy
})

// 表单验证错误
const errors = reactive({
  name: '',
  platform: ''
})

// 可用分组列表
const groups = ref([])

// 表单提交
const { submit, isSubmitting } = useFormSubmission({
  submitFn: async () => {
    // 验证表单
    if (!formData.name) {
      errors.name = '请填写账户名称'
      return
    }

    if (!formData.platform) {
      errors.platform = '请选择平台'
      return
    }

    // 验证代理配置
    const proxyValidation = validateProxy()
    if (!proxyValidation.valid) {
      throw new Error(proxyValidation.errors[0])
    }

    // 构建提交数据
    const payload = {
      ...formData,
      proxy: getProxyPayload()
    }

    // 调用API
    if (props.isEdit) {
      return await accountsStore.updateAccount(props.account.id, payload)
    } else {
      return await accountsStore.createAccount(payload)
    }
  },
  onSuccess: () => {
    // 成功后的处理
    emit('success')
  },
  messages: {
    success: props.isEdit ? '账户更新成功' : '账户创建成功',
    error: props.isEdit ? '更新失败：' : '创建失败：'
  }
})
</script>
```

---

### 2. 模板使用示例

```vue
<template>
  <div class="space-y-6">
    <!-- 步骤1: 平台选择 -->
    <div v-if="!isEdit">
      <PlatformSelector v-model="formData.platform" />
    </div>

    <!-- 步骤2: 基本信息 -->
    <BasicInfoForm
      v-model="formData"
      :is-edit="isEdit"
      :groups="groups"
      :errors="errors"
      @new-group="handleNewGroup"
    />

    <!-- 步骤3: 代理配置 -->
    <ProxyConfig v-model="proxyState" />

    <!-- 步骤4: 模型限制（可选） -->
    <ModelRestrictionConfig
      v-model="formData.modelRestriction"
      :common-models="commonModels"
    />

    <!-- 提交按钮 -->
    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        type="button"
        class="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
        :disabled="isSubmitting"
        @click="submit"
      >
        {{ isSubmitting ? '提交中...' : (isEdit ? '更新账户' : '创建账户') }}
      </button>
    </div>
  </div>
</template>
```

---

## 各组件详细用法

### PlatformSelector

**功能**: 选择AI平台和子平台

**Props**:
```javascript
modelValue: String  // v-model绑定，当前选中的平台值
```

**Events**:
```javascript
'update:modelValue'  // 平台变化时触发
```

**使用示例**:
```vue
<PlatformSelector v-model="formData.platform" />
```

**支持的平台值**:
- Claude: `claude`, `claude-console`, `bedrock`, `ccr`
- OpenAI: `openai`, `openai-responses`, `azure_openai`
- Gemini: `gemini`
- Droid: `droid`

---

### BasicInfoForm

**功能**: 账户基本信息表单

**Props**:
```javascript
modelValue: Object  // v-model绑定，表单数据对象
isEdit: Boolean     // 是否编辑模式
groups: Array       // 可用分组列表
errors: Object      // 表单验证错误
```

**Events**:
```javascript
'update:modelValue'  // 表单数据变化
'new-group'          // 点击新建分组按钮
```

**使用示例**:
```vue
<BasicInfoForm
  v-model="formData"
  :is-edit="isEdit"
  :groups="groups"
  :errors="errors"
  @new-group="handleNewGroup"
/>
```

**modelValue数据结构**:
```javascript
{
  name: '',              // 账户名称
  description: '',       // 账户描述
  accountType: 'shared', // 账户类型: shared/dedicated/group
  groupIds: [],          // 选中的分组ID列表
  expiresAt: null        // 过期时间 ISO字符串
}
```

---

### ProxyConfig

**功能**: 代理配置管理

**Props**:
```javascript
modelValue: Object  // v-model绑定，代理配置对象
```

**Events**:
```javascript
'update:modelValue'  // 代理配置变化
```

**使用示例**:
```vue
<ProxyConfig v-model="proxyState" />
```

**建议配合 useProxyManagement 使用**:
```javascript
import { useProxyManagement } from '@/composables/useProxyManagement'

const {
  proxyState,
  getProxyPayload,
  validate
} = useProxyManagement({
  initialProxy: account?.proxy
})

// 提交时获取payload
const payload = getProxyPayload()

// 验证代理配置
const { valid, errors } = validate()
```

---

### ModelRestrictionConfig

**功能**: 模型限制配置（白名单/映射）

**Props**:
```javascript
modelValue: Object  // v-model绑定，模型限制配置
commonModels: Array // 常用模型列表（可选）
```

**Events**:
```javascript
'update:modelValue'  // 配置变化
```

**使用示例**:
```vue
<ModelRestrictionConfig
  v-model="formData.modelRestriction"
  :common-models="commonModels"
/>
```

**modelValue数据结构**:
```javascript
{
  mode: 'whitelist',    // 模式: whitelist | mapping
  allowedModels: [],    // 白名单模式：允许的模型列表
  mappings: [           // 映射模式：模型映射关系
    { from: 'claude-sonnet-4', to: 'claude-sonnet-4-20250514' }
  ]
}
```

**commonModels结构**:
```javascript
[
  { value: 'claude-sonnet-4-20250514', label: 'Sonnet 4' },
  { value: 'claude-opus-4-1-20250805', label: 'Opus 4.1' }
]
```

---

## 数据流管理

### 1. 表单数据集中管理

```javascript
// 推荐：使用reactive统一管理表单数据
const formData = reactive({
  // 所有表单字段
  platform: '',
  name: '',
  description: '',
  accountType: 'shared',
  // ...
})

// 通过v-model双向绑定
<BasicInfoForm v-model="formData" />
```

### 2. 代理配置独立管理

```javascript
// 使用 useProxyManagement composable
const { proxyState, getProxyPayload } = useProxyManagement()

// 组件绑定
<ProxyConfig v-model="proxyState" />

// 提交时获取标准格式
const payload = {
  ...formData,
  proxy: getProxyPayload()  // 转换为API需要的格式
}
```

### 3. 表单提交统一处理

```javascript
import { useFormSubmission } from '@/composables/useFormSubmission'

const { submit, isSubmitting } = useFormSubmission({
  submitFn: async () => {
    // 1. 验证
    validateForm()

    // 2. 构建payload
    const payload = buildPayload()

    // 3. 调用API
    return await api.createAccount(payload)
  },
  onSuccess: () => {
    // 成功处理
  },
  messages: {
    success: '创建成功',
    error: '创建失败：'
  }
})
```

---

## 完整工作流程

### 创建账户流程

```
1. 用户选择平台
   ↓ PlatformSelector

2. 填写基本信息
   ↓ BasicInfoForm

3. 配置代理（可选）
   ↓ ProxyConfig

4. 配置模型限制（可选）
   ↓ ModelRestrictionConfig

5. 提交创建
   ↓ useFormSubmission

6. 成功/失败处理
```

### 编辑账户流程

```
1. 加载现有数据
   ↓ 初始化各组件

2. 修改信息
   ↓ 各组件双向绑定

3. 提交更新
   ↓ useFormSubmission

4. 成功/失败处理
```

---

## 性能优化建议

### 1. 懒加载组件

```javascript
// 对于大型组件，使用懒加载
const ModelRestrictionConfig = defineAsyncComponent(() =>
  import('./ModelRestrictionConfig.vue')
)
```

### 2. 表单数据验证

```javascript
// 使用computed实时验证
const canSubmit = computed(() => {
  return formData.name && formData.platform && !isSubmitting.value
})
```

### 3. 防抖处理

```javascript
import { useDebounceFn } from '@vueuse/core'

const debouncedValidation = useDebounceFn(() => {
  validateForm()
}, 300)
```

---

## 错误处理

### 1. 表单验证错误

```javascript
const errors = reactive({
  name: '',
  platform: '',
  proxy: ''
})

// 显示错误
<p v-if="errors.name" class="text-red-500">{{ errors.name }}</p>
```

### 2. API调用错误

```javascript
// useFormSubmission自动处理
const { submit, error } = useFormSubmission({
  submitFn: apiCall,
  showErrorToast: true  // 自动显示错误toast
})
```

### 3. 代理配置验证

```javascript
const { validate } = useProxyManagement()

const { valid, errors } = validate()
if (!valid) {
  showToast(errors[0], 'error')
  return
}
```

---

## 测试建议

### 1. 单元测试

```javascript
import { mount } from '@vue/test-utils'
import BasicInfoForm from './BasicInfoForm.vue'

describe('BasicInfoForm', () => {
  it('should emit update when name changes', async () => {
    const wrapper = mount(BasicInfoForm, {
      props: {
        modelValue: { name: '' }
      }
    })

    await wrapper.find('input').setValue('Test Account')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
```

### 2. 集成测试

```javascript
describe('AccountForm Integration', () => {
  it('should create account with all components', async () => {
    // 1. 选择平台
    await selectPlatform('claude')

    // 2. 填写基本信息
    await fillBasicInfo({ name: 'Test' })

    // 3. 配置代理
    await configureProxy({ host: '127.0.0.1', port: 1080 })

    // 4. 提交
    await clickSubmit()

    // 5. 验证API调用
    expect(apiMock.createAccount).toHaveBeenCalled()
  })
})
```

---

## 常见问题

### Q1: 组件数据如何同步？
**A**: 使用v-model双向绑定，数据自动同步。

### Q2: 如何处理复杂的表单验证？
**A**: 建议使用 [VeeValidate](https://vee-validate.logaretm.com/) 或创建自定义验证composable。

### Q3: 代理配置如何存储？
**A**: 使用 `useProxyManagement` 的 `getProxyPayload()` 获取标准格式，直接传给API。

### Q4: 是否需要全部使用提取的组件？
**A**: 不是必须的。可以根据需要逐步迁移，旧组件和新组件可以共存。

---

**最后更新**: 2025-11-24
