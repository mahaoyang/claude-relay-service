import { ref, computed } from 'vue'
import { showToast } from '../utils/toast'

/**
 * 通用的表单提交逻辑 Composable
 * 处理表单的提交状态、错误处理、成功/失败通知
 *
 * @param {Object} options - 配置选项
 * @param {Function} options.submitFn - 提交函数，应返回Promise
 * @param {Function} options.onSuccess - 提交成功后的回调函数
 * @param {Function} options.onError - 提交失败后的回调函数
 * @param {Object} options.messages - 自定义提示消息
 * @param {string} options.messages.loading - 加载中的提示消息
 * @param {string} options.messages.success - 成功的提示消息
 * @param {string} options.messages.error - 错误的提示消息前缀
 * @param {boolean} options.showSuccessToast - 是否显示成功提示，默认true
 * @param {boolean} options.showErrorToast - 是否显示错误提示，默认true
 * @returns {Object} 返回表单提交相关的状态和方法
 */
export function useFormSubmission(options = {}) {
  const {
    submitFn,
    onSuccess,
    onError,
    messages = {},
    showSuccessToast = true,
    showErrorToast = true
  } = options

  // 状态管理
  const isSubmitting = ref(false)
  const error = ref(null)
  const result = ref(null)

  /**
   * 是否正在加载
   */
  const isLoading = computed(() => isSubmitting.value)

  /**
   * 是否有错误
   */
  const hasError = computed(() => error.value !== null)

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 清除结果
   */
  const clearResult = () => {
    result.value = null
  }

  /**
   * 重置所有状态
   */
  const reset = () => {
    isSubmitting.value = false
    error.value = null
    result.value = null
  }

  /**
   * 执行表单提交
   * @param {...any} args - 传递给submitFn的参数
   * @returns {Promise<any>} 返回提交结果
   */
  const submit = async (...args) => {
    if (isSubmitting.value) {
      console.warn('表单正在提交中，请勿重复提交')
      return null
    }

    // 清除之前的错误和结果
    clearError()
    clearResult()

    // 设置加载状态
    isSubmitting.value = true

    try {
      // 显示加载提示（如果配置了）
      if (messages.loading) {
        showToast(messages.loading, 'loading')
      }

      // 执行提交函数
      if (typeof submitFn !== 'function') {
        throw new Error('submitFn必须是一个函数')
      }

      const submitResult = await submitFn(...args)
      result.value = submitResult

      // 显示成功提示
      if (showSuccessToast && messages.success) {
        showToast(messages.success, 'success')
      }

      // 执行成功回调
      if (typeof onSuccess === 'function') {
        await onSuccess(submitResult, ...args)
      }

      return submitResult
    } catch (err) {
      error.value = err

      // 显示错误提示
      if (showErrorToast) {
        const errorMessage = messages.error
          ? `${messages.error}${err.message || err}`
          : err.message || '提交失败'
        showToast(errorMessage, 'error')
      }

      // 执行错误回调
      if (typeof onError === 'function') {
        await onError(err, ...args)
      }

      // 重新抛出错误，让调用者可以捕获
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    // 状态
    isSubmitting,
    isLoading,
    error,
    hasError,
    result,

    // 方法
    submit,
    clearError,
    clearResult,
    reset
  }
}

/**
 * 用于API调用的表单提交 Composable
 * 专门处理API请求的表单提交
 *
 * @param {Object} options - 配置选项
 * @param {Function} options.apiCall - API调用函数
 * @param {string} options.successMessage - 成功提示消息
 * @param {string} options.errorMessagePrefix - 错误提示消息前缀
 * @param {Function} options.onSuccess - 成功回调
 * @param {Function} options.onError - 错误回调
 * @returns {Object}
 */
export function useApiFormSubmission(options = {}) {
  const {
    apiCall,
    successMessage = '操作成功',
    errorMessagePrefix = '操作失败：',
    onSuccess,
    onError
  } = options

  return useFormSubmission({
    submitFn: apiCall,
    onSuccess,
    onError,
    messages: {
      success: successMessage,
      error: errorMessagePrefix
    }
  })
}

/**
 * 用于批量操作的表单提交 Composable
 * 处理批量操作的进度和结果
 *
 * @param {Object} options - 配置选项
 * @returns {Object}
 */
export function useBatchFormSubmission(options = {}) {
  const {
    batchFn,
    onSuccess,
    onError,
    successMessage = '批量操作完成',
    errorMessagePrefix = '批量操作失败：'
  } = options

  const progress = ref(0)
  const total = ref(0)
  const failed = ref([])
  const succeeded = ref([])

  const progressPercentage = computed(() => {
    if (total.value === 0) return 0
    return Math.round((progress.value / total.value) * 100)
  })

  const submitBatch = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('批量操作需要提供项目数组')
    }

    progress.value = 0
    total.value = items.length
    failed.value = []
    succeeded.value = []

    try {
      const results = await batchFn(items, (index, result, isSuccess) => {
        progress.value = index + 1
        if (isSuccess) {
          succeeded.value.push({ index, result })
        } else {
          failed.value.push({ index, error: result })
        }
      })

      if (failed.value.length === 0) {
        showToast(successMessage, 'success')
      } else if (succeeded.value.length === 0) {
        showToast(`${errorMessagePrefix}所有操作都失败了`, 'error')
      } else {
        showToast(
          `批量操作完成：成功 ${succeeded.value.length}，失败 ${failed.value.length}`,
          'warning'
        )
      }

      if (typeof onSuccess === 'function') {
        await onSuccess(results)
      }

      return results
    } catch (err) {
      showToast(`${errorMessagePrefix}${err.message || err}`, 'error')

      if (typeof onError === 'function') {
        await onError(err)
      }

      throw err
    }
  }

  const formSubmission = useFormSubmission({
    submitFn: submitBatch,
    showSuccessToast: false,
    showErrorToast: false
  })

  return {
    ...formSubmission,
    progress,
    total,
    progressPercentage,
    failed,
    succeeded,
    submitBatch
  }
}
