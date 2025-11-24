import { ref, reactive, computed } from 'vue'

/**
 * 通用的弹窗管理 Composable
 * 集中管理多个弹窗的显示状态和关联数据
 *
 * @param {Object} modalsConfig - 弹窗配置对象，key为弹窗名称
 * @example
 * const { modals, open, close, toggle, getData, setData } = useModalManager({
 *   create: { visible: false, data: null },
 *   edit: { visible: false, data: null },
 *   delete: { visible: false, data: null }
 * })
 * @returns {Object} 返回弹窗管理相关的状态和方法
 */
export function useModalManager(modalsConfig = {}) {
  // 弹窗状态管理
  const modals = reactive(
    Object.fromEntries(
      Object.keys(modalsConfig).map((name) => [
        name,
        {
          visible: false,
          data: null,
          ...modalsConfig[name]
        }
      ])
    )
  )

  /**
   * 获取所有打开的弹窗名称
   */
  const openModals = computed(() => {
    return Object.keys(modals).filter((name) => modals[name].visible)
  })

  /**
   * 是否有打开的弹窗
   */
  const hasOpenModal = computed(() => openModals.value.length > 0)

  /**
   * 打开指定弹窗
   * @param {string} name - 弹窗名称
   * @param {any} data - 关联数据（可选）
   */
  const open = (name, data = null) => {
    if (!modals[name]) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }

    modals[name].visible = true
    if (data !== undefined) {
      modals[name].data = data
    }
  }

  /**
   * 关闭指定弹窗
   * @param {string} name - 弹窗名称
   * @param {boolean} clearData - 是否清空关联数据
   */
  const close = (name, clearData = true) => {
    if (!modals[name]) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }

    modals[name].visible = false
    if (clearData) {
      modals[name].data = null
    }
  }

  /**
   * 切换指定弹窗的显示状态
   * @param {string} name - 弹窗名称
   * @param {any} data - 关联数据（打开时可选）
   */
  const toggle = (name, data = null) => {
    if (!modals[name]) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }

    if (modals[name].visible) {
      close(name)
    } else {
      open(name, data)
    }
  }

  /**
   * 关闭所有弹窗
   * @param {boolean} clearData - 是否清空所有关联数据
   */
  const closeAll = (clearData = true) => {
    Object.keys(modals).forEach((name) => {
      close(name, clearData)
    })
  }

  /**
   * 判断指定弹窗是否打开
   * @param {string} name - 弹窗名称
   * @returns {boolean}
   */
  const isOpen = (name) => {
    return modals[name]?.visible || false
  }

  /**
   * 获取指定弹窗的关联数据
   * @param {string} name - 弹窗名称
   * @returns {any}
   */
  const getData = (name) => {
    return modals[name]?.data
  }

  /**
   * 设置指定弹窗的关联数据
   * @param {string} name - 弹窗名称
   * @param {any} data - 关联数据
   */
  const setData = (name, data) => {
    if (!modals[name]) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }

    modals[name].data = data
  }

  /**
   * 清空指定弹窗的关联数据
   * @param {string} name - 弹窗名称
   */
  const clearData = (name) => {
    if (!modals[name]) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }

    modals[name].data = null
  }

  /**
   * 注册新弹窗
   * @param {string} name - 弹窗名称
   * @param {Object} config - 弹窗配置
   */
  const registerModal = (name, config = {}) => {
    if (modals[name]) {
      console.warn(`弹窗 "${name}" 已存在`)
      return
    }

    modals[name] = {
      visible: false,
      data: null,
      ...config
    }
  }

  /**
   * 注销弹窗
   * @param {string} name - 弹窗名称
   */
  const unregisterModal = (name) => {
    if (!modals[name]) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }

    delete modals[name]
  }

  return {
    // 状态
    modals,
    openModals,
    hasOpenModal,

    // 方法
    open,
    close,
    toggle,
    closeAll,
    isOpen,
    getData,
    setData,
    clearData,
    registerModal,
    unregisterModal
  }
}

/**
 * 简化版弹窗管理 Composable
 * 只管理弹窗的显示状态，不管理数据
 *
 * @param {Array<string>} modalNames - 弹窗名称数组
 * @returns {Object}
 */
export function useSimpleModalManager(modalNames = []) {
  const modals = reactive(Object.fromEntries(modalNames.map((name) => [name, false])))

  const open = (name) => {
    if (modals[name] === undefined) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }
    modals[name] = true
  }

  const close = (name) => {
    if (modals[name] === undefined) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }
    modals[name] = false
  }

  const toggle = (name) => {
    if (modals[name] === undefined) {
      console.warn(`弹窗 "${name}" 不存在`)
      return
    }
    modals[name] = !modals[name]
  }

  const closeAll = () => {
    Object.keys(modals).forEach((name) => {
      modals[name] = false
    })
  }

  const isOpen = (name) => {
    return modals[name] || false
  }

  const hasOpenModal = computed(() => {
    return Object.values(modals).some((visible) => visible)
  })

  return {
    modals,
    open,
    close,
    toggle,
    closeAll,
    isOpen,
    hasOpenModal
  }
}

/**
 * 带数据管理的独立弹窗 Composable
 * 用于单个弹窗的管理
 *
 * @param {Object} options - 配置选项
 * @param {boolean} options.defaultVisible - 默认是否可见
 * @param {any} options.defaultData - 默认数据
 * @param {Function} options.onOpen - 打开回调
 * @param {Function} options.onClose - 关闭回调
 * @returns {Object}
 */
export function useSingleModal(options = {}) {
  const { defaultVisible = false, defaultData = null, onOpen, onClose } = options

  const visible = ref(defaultVisible)
  const data = ref(defaultData)

  const open = (newData = null) => {
    visible.value = true
    if (newData !== undefined) {
      data.value = newData
    }

    if (typeof onOpen === 'function') {
      onOpen(data.value)
    }
  }

  const close = (clearData = true) => {
    visible.value = false
    if (clearData) {
      data.value = null
    }

    if (typeof onClose === 'function') {
      onClose()
    }
  }

  const toggle = (newData = null) => {
    if (visible.value) {
      close()
    } else {
      open(newData)
    }
  }

  const setData = (newData) => {
    data.value = newData
  }

  const clearData = () => {
    data.value = null
  }

  return {
    visible,
    data,
    open,
    close,
    toggle,
    setData,
    clearData
  }
}
