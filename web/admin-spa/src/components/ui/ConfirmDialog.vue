<template>
  <TransitionRoot as="template" :show="isOpen">
    <HeadlessDialog :class="tokens.zIndex.modal" :open="isOpen" @close="handleCancel">
      <!-- 背景遮罩 -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div aria-hidden="true" :class="styles.overlay" />
      </TransitionChild>

      <!-- 对话框内容 -->
      <div :class="styles.container">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel :class="styles.panel">
              <!-- 标题区域（带图标） -->
              <div :class="styles.header">
                <!-- 图标 -->
                <div :class="cn(styles.iconWrapper, currentVariantStyles.iconWrapper)">
                  <component
                    :is="iconComponent"
                    :class="cn('h-6 w-6', currentVariantStyles.icon)"
                  />
                </div>

                <!-- 标题 -->
                <DialogTitle :class="cn(styles.title, currentVariantStyles.title)">
                  {{ dialogTitle }}
                </DialogTitle>
              </div>

              <!-- 消息内容 -->
              <DialogDescription :class="cn(styles.message, currentVariantStyles.message)">
                {{ dialogMessage }}
              </DialogDescription>

              <!-- 操作按钮 -->
              <div :class="styles.footer">
                <Button :disabled="isLoading" size="md" variant="ghost" @click="handleCancel">
                  {{ cancelText }}
                </Button>
                <Button
                  :loading="isLoading"
                  size="md"
                  :variant="confirmButtonVariant"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import { AlertCircle, CheckCircle, Info, AlertTriangle, HelpCircle } from 'lucide-vue-next'
import { useTheme } from '@/composables/ui/useTheme'
import Button from './Button.vue'

const { styles, tokens, cn } = useTheme('confirmDialog')

// 对话框状态
const isOpen = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const variant = ref('default')
const confirmText = ref('确认')
const cancelText = ref('取消')
const isLoading = ref(false)

let resolvePromise = null

// 图标映射
const iconMap = {
  default: HelpCircle,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle
}

// 确认按钮变体映射
const confirmButtonVariantMap = {
  default: 'primary',
  info: 'primary',
  success: 'success',
  warning: 'primary',
  danger: 'danger'
}

// 当前变体样式
const currentVariantStyles = computed(() => {
  return styles.variants[variant.value] || styles.variants.default
})

// 当前图标组件
const iconComponent = computed(() => {
  return iconMap[variant.value] || iconMap.default
})

// 确认按钮变体
const confirmButtonVariant = computed(() => {
  return confirmButtonVariantMap[variant.value] || 'primary'
})

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} message - 消息
 * @param {Object} options - 选项
 * @returns {Promise<boolean>} 用户的选择
 */
const showConfirm = (title, message, options = {}) => {
  dialogTitle.value = title
  dialogMessage.value = message
  variant.value = options.variant || 'default'
  confirmText.value = options.confirmTextParam || options.confirmText || '确认'
  cancelText.value = options.cancelTextParam || options.cancelText || '取消'
  isLoading.value = false
  isOpen.value = true

  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

/**
 * 确认操作
 */
const handleConfirm = async () => {
  if (isLoading.value) return

  if (resolvePromise) {
    isLoading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      isOpen.value = false
      resolvePromise(true)
      resolvePromise = null
    } finally {
      isLoading.value = false
    }
  }
}

/**
 * 取消操作
 */
const handleCancel = () => {
  if (isLoading.value) return

  isOpen.value = false
  if (resolvePromise) {
    resolvePromise(false)
    resolvePromise = null
  }
}

// 暴露方法供父组件调用
defineExpose({
  showConfirm
})
</script>
