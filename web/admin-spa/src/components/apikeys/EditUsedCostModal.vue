<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-800">
          <!-- 标题 -->
          <div
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30"
              >
                <i class="fas fa-dollar-sign text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">修改已用费用</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ apiKeyName }}
                </p>
              </div>
            </div>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="$emit('close')"
            >
              <i class="fas fa-times" />
            </button>
          </div>

          <!-- 内容 -->
          <div class="p-6">
            <!-- 警告提示 -->
            <div
              class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20"
            >
              <div class="flex items-start gap-2">
                <i class="fas fa-exclamation-triangle mt-0.5 text-amber-500" />
                <p class="text-sm text-amber-700 dark:text-amber-300">
                  此值用于"总费用限制"检查。修改会影响限额判断，请谨慎操作。
                </p>
              </div>
            </div>

            <!-- 当前值显示 -->
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                当前已用费用
              </label>
              <div
                class="rounded-lg bg-gray-100 px-4 py-2.5 text-lg font-semibold text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              >
                ${{ currentCost }}
              </div>
            </div>

            <!-- 新值输入 -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                新的已用费用 (美元)
              </label>
              <input
                v-model="newCost"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-lg transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                min="0"
                placeholder="输入新的已用费用"
                step="0.01"
                type="number"
              />
            </div>
          </div>

          <!-- 底部按钮 -->
          <div
            class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700"
          >
            <button
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              type="button"
              @click="$emit('close')"
            >
              取消
            </button>
            <button
              class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!isValid || saving"
              type="button"
              @click="handleSave"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin mr-2" />
              {{ saving ? '保存中...' : '确认修改' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { apiClient } from '@/config/api'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  apiKeyId: {
    type: String,
    default: ''
  },
  apiKeyName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'saved'])

const currentCost = ref('0.00')
const newCost = ref('')
const saving = ref(false)
const loading = ref(false)

const isValid = computed(() => {
  if (newCost.value === '') return false
  const value = parseFloat(newCost.value)
  return !isNaN(value) && value >= 0
})

// 加载当前费用
const loadCurrentCost = async () => {
  if (!props.apiKeyId) return

  loading.value = true
  try {
    const response = await apiClient.post('/admin/api-keys/batch-stats', {
      keyIds: [props.apiKeyId],
      timeRange: 'all'
    })
    if (response.success && response.data && response.data[props.apiKeyId]) {
      const stats = response.data[props.apiKeyId]
      const cost = stats.allTimeCost || 0
      currentCost.value = cost.toFixed(2)
      newCost.value = currentCost.value
    }
  } catch (error) {
    console.error('Failed to load current cost:', error)
    currentCost.value = '0.00'
    newCost.value = '0'
  } finally {
    loading.value = false
  }
}

// 保存
const handleSave = async () => {
  if (!isValid.value || saving.value) return

  saving.value = true
  try {
    const response = await apiClient.put(`/admin/api-keys/${props.apiKeyId}`, {
      usedCost: parseFloat(newCost.value)
    })

    if (response.success) {
      emit('saved', parseFloat(newCost.value))
      emit('close')
    } else {
      alert(response.message || '保存失败')
    }
  } catch (error) {
    console.error('Failed to save used cost:', error)
    alert('保存失败: ' + (error.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// 监听显示状态，加载数据
watch(
  () => props.show,
  (val) => {
    if (val) {
      loadCurrentCost()
    } else {
      newCost.value = ''
      currentCost.value = '0.00'
    }
  }
)
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .rounded-xl,
.modal-leave-active .rounded-xl {
  transition: transform 0.2s ease;
}

.modal-enter-from .rounded-xl,
.modal-leave-to .rounded-xl {
  transform: scale(0.95);
}
</style>
