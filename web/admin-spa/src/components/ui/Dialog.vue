<template>
  <TransitionRoot as="template" :show="isOpen">
    <HeadlessDialog
      :class="cn(styles.container, tokens.zIndex.modal)"
      :open="isOpen"
      @close="handleClose"
    >
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
            <DialogPanel :class="cn(styles.panel, panelClass)">
              <!-- 关闭按钮 -->
              <button
                v-if="showClose"
                aria-label="关闭"
                :class="styles.closeButton"
                type="button"
                @click="handleClose"
              >
                <X :size="20" />
              </button>

              <!-- 标题 -->
              <DialogTitle v-if="title" as="h3" :class="styles.title">
                {{ title }}
              </DialogTitle>

              <!-- 描述 -->
              <DialogDescription v-if="description" :class="styles.description">
                {{ description }}
              </DialogDescription>

              <!-- 主体内容 -->
              <div>
                <slot />
              </div>

              <!-- 底部操作 -->
              <div v-if="$slots.footer" :class="styles.footer">
                <slot :close="handleClose" name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </HeadlessDialog>
  </TransitionRoot>
</template>

<script setup>
import { computed } from 'vue'
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import { X } from 'lucide-vue-next'
import { useTheme } from '@/composables/ui/useTheme'

const props = defineProps({
  /**
   * 是否打开
   */
  isOpen: {
    type: Boolean,
    required: true
  },
  /**
   * 标题
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * 描述
   */
  description: {
    type: String,
    default: ''
  },
  /**
   * 是否显示关闭按钮
   */
  showClose: {
    type: Boolean,
    default: true
  },
  /**
   * 自定义面板类名
   */
  panelClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'update:isOpen'])

const { styles, tokens, cn } = useTheme('dialog')

const handleClose = () => {
  emit('close')
  emit('update:isOpen', false)
}
</script>
