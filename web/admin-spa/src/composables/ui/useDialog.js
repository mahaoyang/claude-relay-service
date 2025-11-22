/**
 * useDialog - 对话框逻辑 Composable
 * 提供对话框的状态管理和控制逻辑
 */

import { ref, computed } from 'vue'

/**
 * 对话框 Composable
 * @param {Object} options - 配置选项
 * @param {boolean} options.initialOpen - 初始打开状态
 * @param {Function} options.onOpen - 打开回调
 * @param {Function} options.onClose - 关闭回调
 * @returns {Object} 对话框状态和控制方法
 */
export function useDialog(options = {}) {
  const { initialOpen = false, onOpen = null, onClose = null } = options

  // 对话框打开状态
  const isOpen = ref(initialOpen)

  // 打开对话框
  const open = () => {
    isOpen.value = true
    onOpen?.()
  }

  // 关闭对话框
  const close = () => {
    isOpen.value = false
    onClose?.()
  }

  // 切换对话框状态
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  return {
    isOpen: computed(() => isOpen.value),
    open,
    close,
    toggle
  }
}

/**
 * 确认对话框 Composable
 * 提供 Promise 风格的确认对话框
 */
export function useConfirmDialog() {
  const isOpen = ref(false)
  const title = ref('')
  const message = ref('')
  const options = ref({})
  let resolvePromise = null

  /**
   * 显示确认对话框
   * @param {string} dialogTitle - 对话框标题
   * @param {string} dialogMessage - 对话框消息
   * @param {Object} dialogOptions - 对话框选项
   * @returns {Promise<boolean>} 用户的选择结果
   */
  const showConfirm = (dialogTitle, dialogMessage, dialogOptions = {}) => {
    title.value = dialogTitle
    message.value = dialogMessage
    options.value = dialogOptions
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  /**
   * 确认操作
   */
  const confirm = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  /**
   * 取消操作
   */
  const cancel = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    isOpen: computed(() => isOpen.value),
    title: computed(() => title.value),
    message: computed(() => message.value),
    options: computed(() => options.value),
    showConfirm,
    confirm,
    cancel
  }
}

export default useDialog
