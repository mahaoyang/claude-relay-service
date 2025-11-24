# AccountsView 重构总结

## 重构成果

由于 AccountsView.vue 的复杂性（3,958行），我采取了渐进式重构策略：

### ✅ 已完成

1. **创建 AccountsFilters.vue** (~155行)
   - 统一的筛选器组件
   - 包含排序、平台、分组、搜索
   - 可复用设计

2. **备份原文件**
   - AccountsView.vue.backup (3,958行)

3. **重构策略制定**
   - 识别可复用composables
   - 规划组件拆分

### 📋 完整重构建议

由于 AccountsView 包含大量业务逻辑（账户管理、会话窗口、使用统计等），建议分阶段重构：

#### 阶段 1: 应用 Composables（立即可做）

```vue
<script setup>
// 使用 useMultiSelect
const {
  selectedItems: selectedAccounts,
  selectAllChecked,
  isIndeterminate,
  handleSelectAll,
  handleToggleSelect,
  clearSelection
} = useMultiSelect({
  items: computed(() => filteredAccounts.value),
  getItemId: (item) => item.id
})

// 使用 useModalManager
const {
  modals,
  open: openModal,
  close: closeModal,
  getData: getModalData
} = useModalManager({
  create: { visible: false },
  edit: { visible: false, data: null },
  usageDetail: { visible: false, data: null }
})
</script>
```

**预期减少**: ~50行

#### 阶段 2: 集成 AccountsFilters（立即可做）

```vue
<template>
  <!-- 替换原有的筛选器UI -->
  <AccountsFilters
    v-model:sort-by="sortBy"
    v-model:platform-filter="platformFilter"
    v-model:group-filter="groupFilter"
    v-model:search-query="searchKeyword"
    :account-groups="accountGroups"
  />
</template>
```

**预期减少**: ~100行

#### 阶段 3: 使用 BatchSelectControl（立即可做）

```vue
<template>
  <BatchSelectControl
    v-if="selectedAccounts.length > 0"
    :selected-count="selectedAccounts.length"
    :show-batch-edit="false"
    @cancel-selection="clearSelection"
    @batch-delete="batchDeleteAccounts"
  />
</template>
```

**预期减少**: ~30行

#### 阶段 4: 简化表格渲染（需要更多时间）

由于 AccountsView 的表格包含：
- 复杂的会话窗口进度条
- 多种平台特定的显示逻辑
- 详细的使用统计

建议创建专用组件：
- `AccountsTable.vue` - 表格容器
- `AccountRow.vue` - 单行显示
- `SessionWindowDisplay.vue` - 会话窗口展示

**预期减少**: ~800-1,000行

### 估算的重构收益

| 阶段 | 减少行数 | 累计减少 | 剩余行数 |
|-----|---------|---------|---------|
| 原始 | - | - | 3,958 |
| 阶段1 | 50 | 50 | 3,908 |
| 阶段2 | 100 | 150 | 3,808 |
| 阶段3 | 30 | 180 | 3,778 |
| 阶段4 | 1,000 | 1,180 | 2,778 |
| **总计** | **1,180** | **-30%** | **~2,778** |

如需完整重构到 ~1,600 行（-60%），需要额外投入时间拆分更多组件。

## 快速应用指南

### 1. 应用 useMultiSelect

在 AccountsView.vue 的 script setup 中：

```javascript
// 删除这些行
const selectedAccounts = ref([])
const selectAllChecked = ref(false)
const isIndeterminate = ref(false)
// ... 手动管理逻辑

// 替换为
import { useMultiSelect } from '@/composables/useMultiSelect'

const {
  selectedItems: selectedAccounts,
  selectAllChecked,
  isIndeterminate,
  handleSelectAll,
  handleToggleSelect,
  clearSelection
} = useMultiSelect({
  items: computed(() => sortedAccounts.value),
  getItemId: (item) => item.id
})
```

### 2. 应用 useModalManager

```javascript
// 删除
const showCreateAccountModal = ref(false)
const showEditAccountModal = ref(false)
const showAccountUsageModal = ref(false)
// ...

// 替换为
import { useModalManager } from '@/composables/useModalManager'

const {
  modals,
  open: openModal,
  close: closeModal,
  getData: getModalData,
  setData: setModalData
} = useModalManager({
  create: { visible: false },
  edit: { visible: false, data: null },
  usageDetail: { visible: false, data: null }
})

// 使用
openModal('edit', account)
closeModal('edit')
```

### 3. 集成 AccountsFilters

在模板中：

```vue
<!-- 替换原来的筛选器代码 (~100行) -->
<AccountsFilters
  v-model:sort-by="accountSortBy"
  v-model:platform-filter="platformFilter"
  v-model:group-filter="groupFilter"
  v-model:search-query="searchKeyword"
  :account-groups="accountGroups"
/>
```

### 4. 使用 BatchSelectControl

```vue
<BatchSelectControl
  v-if="selectedAccounts.length > 0"
  :selected-count="selectedAccounts.length"
  :show-batch-edit="false"
  class="mb-4"
  @cancel-selection="clearSelection"
  @batch-delete="batchDeleteAccounts"
/>
```

## 下一步

### 选项 A: 快速应用（30分钟）
应用阶段1-3，减少 ~180行代码，风险低

### 选项 B: 完整重构（2-3小时）
创建所有组件，减少 ~1,200行代码，需要更多测试

### 选项 C: 暂时保留
先验证 ApiKeysView 重构效果，再决定是否继续

## 建议

鉴于：
1. ApiKeysView 重构已成功（-83%）
2. AccountsView 业务逻辑更复杂
3. 当前已有可复用组件

**建议选择「选项 A」**���快速应用现有 composables 和组件，获得立竿见影的改善，然后根据实际使用情况决定是否深度重构。

---

**创建时间**: 2025-11-24
**状态**: 阶段性完成，建议渐进式推进
