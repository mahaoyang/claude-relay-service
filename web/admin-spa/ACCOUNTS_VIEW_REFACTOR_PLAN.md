# AccountsView.vue 重构计划

## 当前状态

**文件**: `src/views/AccountsView.vue`
**总行数**: 3,958 行
- 模板: ~1,797 行
- 脚本: ~2,161 行

## 可复用的资源

### ✅ 已有 Composables（直接复用）

1. **useMultiSelect** - 多选逻辑
   - 替换 `selectedAccounts`, `selectAllChecked`, `isIndeterminate`

2. **useModalManager** - 模态框管理
   - 替换多个模态框状态

### ✅ 已有组件（可复用）

从 ApiKeysView 重构中:
- `BatchSelectControl.vue` - 批量操作控制栏（可直接使用）

## 需要创建的新组件

### 1. AccountsFilters.vue (~150行)
筛选器组合组件：
- 排序选择器
- 平台筛选器
- 分组筛选器
- 搜索框

### 2. AccountCard.vue (~200行)
单个账户卡片组件：
- 账户基本信息展示
- 状态指示器
- 操作按钮（编辑、删除、查看详情）
- 使用统计
- 过期状态

### 3. AccountsGrid.vue (~300行)
账户网格容器：
- 响应式网格布局
- 加载状态
- 空状态
- 分页控制

## 预期效果

| 指标 | 当前 | 预期 | 减少 |
|-----|------|------|------|
| 总行数 | 3,958 | ~1,600 | ~2,358 (-60%) |
| 模板 | ~1,797 | ~400 | ~1,397 (-78%) |
| 脚本 | ~2,161 | ~1,200 | ~961 (-44%) |

## 重构步骤

1. ✅ 分析文件结构
2. 🔄 创建 AccountsFilters.vue
3. 🔄 创建 AccountCard.vue
4. 🔄 创建 AccountsGrid.vue
5. 🔄 备份原文件
6. 🔄 实施重构
7. 🔄 测试验证

## 时间估计

约 1-1.5 小时
