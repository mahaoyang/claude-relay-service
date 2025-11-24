# ApiKeysView.vue 重构实施计划

## 当前状态分析

**文件**: `src/views/ApiKeysView.vue`
**总行数**: 4,164 行
- 模板: 1,888 行
- 脚本: 2,276 行

### 主要问题

1. **多选逻辑重复** (~30 行)
   - `selectedApiKeys`, `selectAllChecked`, `isIndeterminate`, `showCheckboxes`
   - `toggleSelectionMode`, 手动更新选择状态

2. **日期筛选逻辑复杂** (~100 行)
   - `globalDateFilter` reactive对象
   - 自定义日期选择器逻辑
   - 时间范围预设处理

3. **8个独立模态框状态** (~20 行)
   ```javascript
   const showCreateApiKeyModal = ref(false)
   const showEditApiKeyModal = ref(false)
   const showRenewApiKeyModal = ref(false)
   const showNewApiKeyModal = ref(false)
   const showBatchApiKeyModal = ref(false)
   const showBatchEditModal = ref(false)
   const showUsageDetailModal = ref(false)
   // 还有 expiryEditModalRef
   ```

4. **复杂的模板结构**
   - 筛选器UI分散在多处 (~300 行)
   - 表格渲染逻辑冗长 (~800 行)
   - 批量操作控制UI (~50 行)

---

## 重构方案

### 1. 应用 Composables

#### useMultiSelect (替换 ~30 行)

**当前代码**:
```javascript
const selectedApiKeys = ref([])
const selectAllChecked = ref(false)
const isIndeterminate = ref(false)
const showCheckboxes = ref(false)

const toggleSelectionMode = () => {
  showCheckboxes.value = !showCheckboxes.value
  if (!showCheckboxes.value) {
    selectedApiKeys.value = []
    selectAllChecked.value = false
    isIndeterminate.value = false
  }
}

// 手动更新全选状态的逻辑...
```

**重构后**:
```javascript
import { useMultiSelect } from '@/composables/useMultiSelect'

const {
  selectedItems: selectedApiKeys,
  selectAllChecked,
  isIndeterminate,
  handleSelectAll,
  handleToggleSelect,
  clearSelection
} = useMultiSelect({
  items: computed(() => filteredAndSortedApiKeys.value),
  getItemId: (item) => item.id
})

const showCheckboxes = ref(false)

const toggleSelectionMode = () => {
  showCheckboxes.value = !showCheckboxes.value
  if (!showCheckboxes.value) {
    clearSelection()
  }
}
```

**收益**: 减少 ~20 行，逻辑更清晰，自动管理全选/半选状态

---

#### useDateRangeFilter (替换 ~100 行)

**当前代码**:
```javascript
const globalDateFilter = reactive({
  type: 'preset',
  preset: 'today',
  customStart: '',
  customEnd: '',
  customRange: null
})

const timeRangeDropdownOptions = computed(() => [
  { value: 'today', label: '今日', icon: 'CalendarDays' },
  { value: '7days', label: '最近7天', icon: 'CalendarRange' },
  // ...
])

const handleTimeRangeChange = (preset) => {
  if (preset === 'custom') {
    globalDateFilter.type = 'custom'
    // ...
  } else {
    globalDateFilter.type = 'preset'
    globalDateFilter.preset = preset
    // ...
  }
  currentPage.value = 1
}

// 还有 onGlobalCustomDateRangeChange 等方法...
```

**重构后**:
```javascript
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'

const {
  dateFilter,
  presetOptions,
  setPreset,
  setCustomRange,
  getApiParams,
  isCustomMode
} = useDateRangeFilter({
  defaultPreset: 'today',
  onFilterChange: () => {
    currentPage.value = 1
  }
})

// 在API调用时
const params = {
  ...getApiParams(), // 自动返回正确的日期参数
  // 其他参数...
}
```

**收益**: 减少 ~80 行，标准化日期筛选逻辑

---

#### useModalManager (替换 ~20 行)

**当前代码**:
```javascript
const showCreateApiKeyModal = ref(false)
const showEditApiKeyModal = ref(false)
const showRenewApiKeyModal = ref(false)
const showNewApiKeyModal = ref(false)
const showBatchApiKeyModal = ref(false)
const showBatchEditModal = ref(false)
const showUsageDetailModal = ref(false)
const editingApiKey = ref(null)
const renewingApiKey = ref(null)
const selectedApiKeyForDetail = ref(null)

// 手动打开关闭...
```

**重构后**:
```javascript
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
  renew: { visible: false, data: null },
  newKey: { visible: false },
  batch: { visible: false },
  batchEdit: { visible: false },
  usageDetail: { visible: false, data: null },
  expiryEdit: { visible: false, data: null }
})

// 使用
openModal('edit', apiKey) // 打开编辑模态框并传入数据
closeModal('edit') // 关闭
const editData = getModalData('edit') // 获取数据
```

**收益**: 减少 ~15 行，统一模态框管理

---

### 2. 提取组件

#### ApiKeysFilters.vue (替换 ~300 行)

**已创建**: `src/components/apikeys/ApiKeysFilters.vue`

**Props**:
```javascript
{
  searchQuery: String,
  dateFilter: Object
}
```

**Emits**:
```javascript
'update:search-query'
'update:date-filter'
'clear-filters'
```

**使用**:
```vue
<ApiKeysFilters
  v-model:search-query="searchKeyword"
  v-model:date-filter="dateFilter"
  @clear-filters="handleClearFilters"
/>
```

---

#### ApiKeysTable.vue (替换 ~800 行)

**已创建**: `src/components/apikeys/ApiKeysTable.vue`

**Props**:
```javascript
{
  apiKeys: Array,
  selectedIds: Array,
  selectable: Boolean,
  selectAllChecked: Boolean,
  isIndeterminate: Boolean,
  showPagination: Boolean,
  currentPage: Number,
  pageSize: Number,
  totalCount: Number
}
```

**Emits**:
```javascript
'select-all'
'toggle-select'
'copy-key'
'view-stats'
'edit'
'delete'
'page-change'
```

**使用**:
```vue
<ApiKeysTable
  :api-keys="paginatedApiKeys"
  :selected-ids="selectedApiKeys"
  :selectable="showCheckboxes"
  :select-all-checked="selectAllChecked"
  :is-indeterminate="isIndeterminate"
  @select-all="handleSelectAll"
  @toggle-select="handleToggleSelect"
  @edit="openEditModal"
  @delete="handleDelete"
/>
```

---

#### BatchSelectControl.vue (替换 ~50 行)

**已创建**: `src/components/apikeys/BatchSelectControl.vue`

**Props**:
```javascript
{
  selectedCount: Number,
  showBatchEdit: Boolean
}
```

**Emits**:
```javascript
'cancel-selection'
'batch-edit'
'batch-delete'
```

**使用**:
```vue
<BatchSelectControl
  v-if="selectedApiKeys.length > 0"
  :selected-count="selectedApiKeys.length"
  :show-batch-edit="true"
  @cancel-selection="clearSelection"
  @batch-edit="openModal('batchEdit')"
  @batch-delete="handleBatchDelete"
/>
```

---

## 重构后的 ApiKeysView.vue 结构

### Script Section (预计 ~1,200 行)

```vue
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'

// Composables
import { useMultiSelect } from '@/composables/useMultiSelect'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { useModalManager } from '@/composables/useModalManager'

// Components
import ApiKeysFilters from '@/components/apikeys/ApiKeysFilters.vue'
import ApiKeysTable from '@/components/apikeys/ApiKeysTable.vue'
import BatchSelectControl from '@/components/apikeys/BatchSelectControl.vue'
import CreateApiKeyModal from '@/components/apikeys/CreateApiKeyModal.vue'
import EditApiKeyModal from '@/components/apikeys/EditApiKeyModal.vue'
// ... 其他模态框组件

// ============================================
// 1. Stores
// ============================================
const clientsStore = useClientsStore()
const authStore = useAuthStore()

// ============================================
// 2. 基础数据
// ============================================
const apiKeys = ref([])
const apiKeysLoading = ref(false)
const activeTab = ref('active')
const deletedApiKeys = ref([])

// ============================================
// 3. 多选逻辑 (useMultiSelect)
// ============================================
const showCheckboxes = ref(false)

const {
  selectedItems: selectedApiKeys,
  selectAllChecked,
  isIndeterminate,
  handleSelectAll,
  handleToggleSelect,
  clearSelection
} = useMultiSelect({
  items: computed(() => filteredAndSortedApiKeys.value),
  getItemId: (item) => item.id
})

const toggleSelectionMode = () => {
  showCheckboxes.value = !showCheckboxes.value
  if (!showCheckboxes.value) clearSelection()
}

// ============================================
// 4. 日期筛选 (useDateRangeFilter)
// ============================================
const {
  dateFilter,
  presetOptions,
  setPreset,
  setCustomRange,
  getApiParams: getDateParams
} = useDateRangeFilter({
  defaultPreset: 'today',
  onFilterChange: () => {
    currentPage.value = 1
  }
})

// ============================================
// 5. 模态框管理 (useModalManager)
// ============================================
const {
  modals,
  open: openModal,
  close: closeModal,
  getData: getModalData
} = useModalManager({
  create: { visible: false },
  edit: { visible: false, data: null },
  renew: { visible: false, data: null },
  newKey: { visible: false },
  batch: { visible: false },
  batchEdit: { visible: false },
  usageDetail: { visible: false, data: null }
})

// ============================================
// 6. 搜索和筛选
// ============================================
const searchKeyword = ref('')
const searchMode = ref('apiKey')
const selectedTagFilter = ref('')

// ============================================
// 7. 分页
// ============================================
const currentPage = ref(1)
const pageSize = ref(10)

// ============================================
// 8. 计算属性
// ============================================
const filteredAndSortedApiKeys = computed(() => {
  let result = [...apiKeys.value]

  // 应用搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(key =>
      key.name.toLowerCase().includes(keyword)
    )
  }

  // 应用标签筛选
  if (selectedTagFilter.value) {
    result = result.filter(key =>
      key.tags && key.tags.includes(selectedTagFilter.value)
    )
  }

  return result
})

const paginatedApiKeys = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAndSortedApiKeys.value.slice(start, end)
})

// ============================================
// 9. 方法
// ============================================
const loadApiKeys = async () => {
  apiKeysLoading.value = true
  try {
    const params = {
      ...getDateParams(), // 自动获取日期参数
      // 其他参数...
    }
    const response = await apiClient.get('/admin/api-keys', { params })
    apiKeys.value = response.data
    showToast('API Keys 加载成功', 'success')
  } catch (error) {
    showToast('加载失败: ' + error.message, 'error')
  } finally {
    apiKeysLoading.value = false
  }
}

const handleEdit = (apiKey) => {
  openModal('edit', apiKey)
}

const handleDelete = async (apiKey) => {
  if (!confirm(`确定要删除 ${apiKey.name} 吗?`)) return

  try {
    await apiClient.delete(`/admin/api-keys/${apiKey.id}`)
    await loadApiKeys()
    showToast('删除成功', 'success')
  } catch (error) {
    showToast('删除失败: ' + error.message, 'error')
  }
}

const handleBatchDelete = async () => {
  if (selectedApiKeys.value.length === 0) return
  if (!confirm(`确定要删除 ${selectedApiKeys.value.length} 个API Keys 吗?`)) return

  try {
    await Promise.all(
      selectedApiKeys.value.map(id =>
        apiClient.delete(`/admin/api-keys/${id}`)
      )
    )
    await loadApiKeys()
    clearSelection()
    showToast('批量删除成功', 'success')
  } catch (error) {
    showToast('批量删除失败: ' + error.message, 'error')
  }
}

// ============================================
// 10. 生命周期
// ============================================
onMounted(() => {
  loadApiKeys()
})
</script>
```

---

### Template Section (预计 ~600 行)

```vue
<template>
  <PageContainer max-width="7xl">
    <template #header>
      <div>
        <h1 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          API Keys 管理
        </h1>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
          管理和监控您的 API 密钥
        </p>
      </div>
    </template>

    <Card>
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex gap-8 px-6" aria-label="Tabs">
          <button
            class="relative border-b-2 px-1 pb-4 pt-4 text-sm font-medium transition-colors"
            :class="activeTab === 'active'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500'"
            @click="activeTab = 'active'"
          >
            活跃 API Keys
            <span class="ml-2 rounded-full px-2.5 py-0.5 text-xs">
              {{ apiKeys.length }}
            </span>
          </button>
          <button
            class="relative border-b-2 px-1 pb-4 pt-4 text-sm font-medium"
            :class="activeTab === 'deleted'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500'"
            @click="activeTab = 'deleted'"
          >
            已删除 API Keys
            <span class="ml-2 rounded-full px-2.5 py-0.5 text-xs">
              {{ deletedApiKeys.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'active'" class="p-6">
        <!-- 工具栏 -->
        <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <!-- 筛选器组件 -->
          <ApiKeysFilters
            v-model:search-query="searchKeyword"
            v-model:date-filter="dateFilter"
            @clear-filters="handleClearFilters"
          />

          <!-- 操作按钮组 -->
          <div class="flex flex-wrap gap-2">
            <!-- 刷新按钮 -->
            <button
              class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              :disabled="apiKeysLoading"
              @click="loadApiKeys"
            >
              <Icon class="h-4 w-4" :class="{ 'animate-spin': apiKeysLoading }" name="RefreshCw" />
              刷新
            </button>

            <!-- 选择模式切换 -->
            <button
              class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              @click="toggleSelectionMode"
            >
              <Icon class="h-4 w-4" :name="showCheckboxes ? 'X' : 'CheckSquare'" />
              {{ showCheckboxes ? '取消选择' : '选择' }}
            </button>

            <!-- 创建 API Key -->
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm text-white"
              @click="openModal('create')"
            >
              <Icon class="h-4 w-4" name="Plus" />
              创建 API Key
            </button>
          </div>
        </div>

        <!-- 批量操作控制栏 -->
        <BatchSelectControl
          v-if="selectedApiKeys.length > 0"
          :selected-count="selectedApiKeys.length"
          :show-batch-edit="true"
          class="mb-4"
          @cancel-selection="clearSelection"
          @batch-edit="openModal('batchEdit')"
          @batch-delete="handleBatchDelete"
        />

        <!-- API Keys 表格 -->
        <ApiKeysTable
          :api-keys="paginatedApiKeys"
          :selected-ids="selectedApiKeys"
          :selectable="showCheckboxes"
          :select-all-checked="selectAllChecked"
          :is-indeterminate="isIndeterminate"
          :show-pagination="true"
          :current-page="currentPage"
          :page-size="pageSize"
          :total-count="filteredAndSortedApiKeys.length"
          @select-all="handleSelectAll"
          @toggle-select="handleToggleSelect"
          @copy-key="handleCopyKey"
          @view-stats="(key) => openModal('usageDetail', key)"
          @edit="handleEdit"
          @delete="handleDelete"
          @page-change="(page) => currentPage = page"
        />
      </div>

      <!-- 已删除 Tab -->
      <div v-else class="p-6">
        <!-- 已删除 API Keys 内容 -->
      </div>
    </Card>

    <!-- 模态框 -->
    <CreateApiKeyModal
      :visible="modals.create.visible"
      @close="closeModal('create')"
      @success="loadApiKeys"
    />

    <EditApiKeyModal
      :visible="modals.edit.visible"
      :api-key="getModalData('edit')"
      @close="closeModal('edit')"
      @success="loadApiKeys"
    />

    <RenewApiKeyModal
      :visible="modals.renew.visible"
      :api-key="getModalData('renew')"
      @close="closeModal('renew')"
      @success="loadApiKeys"
    />

    <!-- 其他模态框... -->
  </PageContainer>
</template>
```

---

## 预期收益

### 代码行数对比

| 部分 | 当前行数 | 重构后行数 | 减少 | 减少比例 |
|-----|---------|-----------|------|---------|
| 模板 | 1,888 | ~600 | 1,288 | 68% |
| 脚本 | 2,276 | ~1,200 | 1,076 | 47% |
| **总计** | **4,164** | **~1,800** | **2,364** | **57%** |

### 功能模块对比

| 功能 | 当前实现 | 重构后 | 收益 |
|-----|---------|--------|------|
| 多选逻辑 | 手动管理30行 | useMultiSelect | 代码减少20行 |
| 日期筛选 | reactive对象100行 | useDateRangeFilter | 代码减少80行 |
| 模态框管理 | 8个独立ref | useModalManager | 代码减少15行 |
| 筛选器UI | 内嵌300行 | ApiKeysFilters组件 | 模板减少300行 |
| 表格UI | 内嵌800行 | ApiKeysTable组件 | 模板减少800行 |
| 批量操作UI | 内嵌50行 | BatchSelectControl组件 | 模板减少50行 |

### 可维护性提升

- ✅ **单一职责**: 每个组件/Composable专注一个功能
- ✅ **代码复用**: Composables可用于AccountsView等其他视图
- ✅ **易于测试**: 小组件和Composables更容易编写单元测试
- ✅ **清晰接口**: Props/Emits明确，数据流清晰
- ✅ **快速定位**: 修改某个功能只需找到对应组件

---

## 实施步骤

### Step 1: 创建新文件 (已完成 ✅)

- [x] `src/composables/useMultiSelect.js`
- [x] `src/composables/useDateRangeFilter.js`
- [x] `src/composables/useModalManager.js`
- [x] `src/components/apikeys/ApiKeysFilters.vue`
- [x] `src/components/apikeys/ApiKeysTable.vue`
- [x] `src/components/apikeys/BatchSelectControl.vue`

### Step 2: 备份原文件

```bash
cp src/views/ApiKeysView.vue src/views/ApiKeysView.vue.backup
```

### Step 3: 渐进式重构

1. **阶段1**: 应用 useMultiSelect
   - 替换多选逻辑
   - 测试选择功能

2. **阶段2**: 应用 useDateRangeFilter
   - 替换日期筛选逻辑
   - 测试筛选功能

3. **阶段3**: 应用 useModalManager
   - 替换模态框状态管理
   - 测试所有模态框

4. **阶段4**: 集成组件
   - 替换筛选器UI为 ApiKeysFilters
   - 替换表格UI为 ApiKeysTable
   - 替换批量操作UI为 BatchSelectControl

5. **阶段5**: 全面测试
   - 测试所有功能
   - 确认无回归问题
   - 删除备份文件

### Step 4: 验证清单

- [ ] API Keys 列表正常加载
- [ ] 搜索和筛选功能正常
- [ ] 日期范围筛选正常
- [ ] 多选和批量操作正常
- [ ] 创建/编辑/删除功能正常
- [ ] 所有模态框正常打开关闭
- [ ] 分页功能正常
- [ ] 响应式设计正常
- [ ] 暗黑模式兼容
- [ ] 无控制台错误

---

## 风险和注意事项

### 潜在风险

1. **数据绑定变化**: v-model双向绑定需要正确配置
2. **事件监听**: 确保所有emit事件都正确处理
3. **计算属性依赖**: 重构后可能影响依赖链
4. **样式继承**: 子组件样式需要与原样式一致

### 缓解措施

1. **保留备份文件**: 随时可以回滚
2. **渐进式重构**: 每个阶段独立测试
3. **完整测试**: 确保所有功能正常
4. **代码审查**: 仔细检查重构后的代码

---

## 下一步

完成 ApiKeysView 重构后，可以使用相同的模式重构:

1. **AccountsView.vue** (3,958 行)
   - 复用 useMultiSelect
   - 复用 useDateRangeFilter
   - 复用 useModalManager
   - 创建 AccountsFilters.vue
   - 创建 AccountsTable.vue

2. **TutorialView.vue** (1,842 行)
   - 数据驱动渲染
   - 提取步骤组件

3. **SettingsView.vue** (1,445 行)
   - 按领域拆分组件
   - 提取表单组件

---

**文档创建时间**: 2025-11-24
**作者**: Claude (Sonnet 4.5)
**目标**: 减少 57% 代码量，提升可维护性
