<template>
  <div
    class="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/20"
  >
    <div class="flex items-center gap-4">
      <!-- 选择状态 -->
      <div class="flex items-center gap-2">
        <Icon class="h-5 w-5 text-primary-600 dark:text-primary-400" name="CheckSquare" />
        <span class="text-sm font-medium text-primary-900 dark:text-primary-100">
          已选择 {{ selectedCount }} 项
        </span>
      </div>

      <!-- 取消选择按钮 -->
      <button
        class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        type="button"
        @click="$emit('cancel-selection')"
      >
        取消选择
      </button>
    </div>

    <!-- 批量操作按钮 -->
    <div class="flex items-center gap-2">
      <button
        v-if="showBatchEdit"
        class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        type="button"
        :disabled="selectedCount === 0"
        @click="$emit('batch-edit')"
      >
        <Icon class="h-4 w-4" name="Edit" />
        <span>编辑选中 ({{ selectedCount }})</span>
      </button>

      <button
        class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        type="button"
        :disabled="selectedCount === 0"
        @click="$emit('batch-delete')"
      >
        <Icon class="h-4 w-4" name="Trash2" />
        <span>删除选中 ({{ selectedCount }})</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/common/Icon.vue'

defineProps({
  selectedCount: {
    type: Number,
    required: true
  },
  showBatchEdit: {
    type: Boolean,
    default: true
  }
})

defineEmits(['cancel-selection', 'batch-edit', 'batch-delete'])
</script>
