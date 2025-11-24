import { ref, reactive, computed } from 'vue'

/**
 * 通用的代理配置管理 Composable
 * 处理代理配置的解析、验证、构建
 *
 * @param {Object} options - 配置选项
 * @param {Object} options.initialProxy - 初始代理配置
 * @param {Function} options.onProxyChange - 代理配置变化时的回调函数
 * @returns {Object} 返回代理管理相关的状态和方法
 */
export function useProxyManagement(options = {}) {
  const { initialProxy, onProxyChange } = options

  /**
   * ���建默认代理状态
   */
  const createDefaultProxyState = () => ({
    enabled: false,
    type: 'socks5',
    host: '',
    port: '',
    username: '',
    password: ''
  })

  /**
   * 解析代理响应数据
   * @param {string|Object} rawProxy - 原始代理数据
   * @returns {Object|null} 解析后的代理配置
   */
  const parseProxyResponse = (rawProxy) => {
    if (!rawProxy) {
      return null
    }

    let proxyObject = rawProxy
    if (typeof rawProxy === 'string') {
      try {
        proxyObject = JSON.parse(rawProxy)
      } catch (error) {
        console.warn('代理配置解析失败:', error)
        return null
      }
    }

    // 处理嵌套的 {proxy: {...}} 结构
    if (
      proxyObject &&
      typeof proxyObject === 'object' &&
      proxyObject.proxy &&
      typeof proxyObject.proxy === 'object'
    ) {
      proxyObject = proxyObject.proxy
    }

    if (!proxyObject || typeof proxyObject !== 'object') {
      return null
    }

    // 提取并标准化字段
    const host =
      typeof proxyObject.host === 'string'
        ? proxyObject.host.trim()
        : proxyObject.host !== undefined && proxyObject.host !== null
          ? String(proxyObject.host).trim()
          : ''

    const port =
      proxyObject.port !== undefined && proxyObject.port !== null
        ? String(proxyObject.port).trim()
        : ''

    const type =
      typeof proxyObject.type === 'string' && proxyObject.type.trim()
        ? proxyObject.type.trim()
        : 'socks5'

    const username =
      typeof proxyObject.username === 'string'
        ? proxyObject.username
        : proxyObject.username !== undefined && proxyObject.username !== null
          ? String(proxyObject.username)
          : ''

    const password =
      typeof proxyObject.password === 'string'
        ? proxyObject.password
        : proxyObject.password !== undefined && proxyObject.password !== null
          ? String(proxyObject.password)
          : ''

    return {
      type,
      host,
      port,
      username,
      password
    }
  }

  /**
   * 标准化代理表单状态
   * @param {string|Object} rawProxy - 原始代理数据
   * @returns {Object} 标准化的表单状态
   */
  const normalizeProxyFormState = (rawProxy) => {
    const parsed = parseProxyResponse(rawProxy)

    if (parsed && parsed.host && parsed.port) {
      return {
        enabled: true,
        type: parsed.type || 'socks5',
        host: parsed.host,
        port: parsed.port,
        username: parsed.username || '',
        password: parsed.password || ''
      }
    }

    return createDefaultProxyState()
  }

  /**
   * 构建代理请求负载
   * @param {Object} proxyState - 代理状态
   * @returns {Object|null} 请求负载对象
   */
  const buildProxyPayload = (proxyState) => {
    if (!proxyState || !proxyState.enabled) {
      return null
    }

    const host = (proxyState.host || '').trim()
    const portNumber = Number.parseInt(proxyState.port, 10)

    if (!host || Number.isNaN(portNumber) || portNumber <= 0) {
      return null
    }

    const username = proxyState.username ? proxyState.username.trim() : ''
    const password = proxyState.password ? proxyState.password.trim() : ''

    return {
      type: proxyState.type || 'socks5',
      host,
      port: portNumber,
      username: username || null,
      password: password || null
    }
  }

  /**
   * 验证代理配置
   * @param {Object} proxyState - 代理状态
   * @returns {Object} { valid: boolean, errors: Array }
   */
  const validateProxy = (proxyState) => {
    const errors = []

    if (!proxyState || !proxyState.enabled) {
      return { valid: true, errors: [] }
    }

    // 验证主机地址
    const host = (proxyState.host || '').trim()
    if (!host) {
      errors.push('代理主机地址不能为空')
    }

    // 验证端口
    const portNumber = Number.parseInt(proxyState.port, 10)
    if (!proxyState.port || proxyState.port.trim() === '') {
      errors.push('代理端口不能为空')
    } else if (Number.isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
      errors.push('代理端口必须是1-65535之间的数字')
    }

    // 验证代理类型
    const validTypes = ['socks5', 'socks4', 'http', 'https']
    if (!validTypes.includes(proxyState.type)) {
      errors.push(`代理类型必须是 ${validTypes.join(', ')} 之一`)
    }

    // 验证用户名和密码（如果提供了其中一个，另一个应该也提供）
    const hasUsername = proxyState.username && proxyState.username.trim()
    const hasPassword = proxyState.password && proxyState.password.trim()
    if (hasUsername && !hasPassword) {
      errors.push('已提供用户名，请同时提供密码')
    }
    if (!hasUsername && hasPassword) {
      errors.push('已提供密码，请同时提供用户名')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 代理状态
  const proxyState = reactive(normalizeProxyFormState(initialProxy))

  /**
   * 代理是否已启用
   */
  const isProxyEnabled = computed(() => proxyState.enabled)

  /**
   * 代理是否需要认证
   */
  const requiresAuth = computed(() => {
    return !!(proxyState.username && proxyState.username.trim())
  })

  /**
   * 代理配置的显示字符串
   */
  const proxyDisplayString = computed(() => {
    if (!proxyState.enabled) {
      return '未配置代理'
    }

    const { type, host, port, username } = proxyState
    if (username && username.trim()) {
      return `${type}://${username}@${host}:${port}`
    }
    return `${type}://${host}:${port}`
  })

  /**
   * 更新代理状态
   * @param {Object} updates - 要更新的字段
   */
  const updateProxy = (updates) => {
    Object.assign(proxyState, updates)
    triggerProxyChange()
  }

  /**
   * 启用代理
   */
  const enableProxy = () => {
    proxyState.enabled = true
    triggerProxyChange()
  }

  /**
   * 禁用代理
   */
  const disableProxy = () => {
    proxyState.enabled = false
    triggerProxyChange()
  }

  /**
   * 切换代理启用状态
   */
  const toggleProxy = () => {
    proxyState.enabled = !proxyState.enabled
    triggerProxyChange()
  }

  /**
   * 重置代理配置
   */
  const resetProxy = () => {
    Object.assign(proxyState, createDefaultProxyState())
    triggerProxyChange()
  }

  /**
   * 设置代理配置
   * @param {string|Object} rawProxy - 代理数据
   */
  const setProxy = (rawProxy) => {
    const normalized = normalizeProxyFormState(rawProxy)
    Object.assign(proxyState, normalized)
    triggerProxyChange()
  }

  /**
   * 获取代理配置（用于API请求）
   * @returns {Object|null}
   */
  const getProxyPayload = () => {
    return buildProxyPayload(proxyState)
  }

  /**
   * 触发代理变化回调
   */
  const triggerProxyChange = () => {
    if (typeof onProxyChange === 'function') {
      onProxyChange(proxyState)
    }
  }

  /**
   * 验证当前代理配置
   * @returns {Object} { valid: boolean, errors: Array }
   */
  const validate = () => {
    return validateProxy(proxyState)
  }

  return {
    // 状态
    proxyState,
    isProxyEnabled,
    requiresAuth,
    proxyDisplayString,

    // 方法
    parseProxyResponse,
    normalizeProxyFormState,
    buildProxyPayload,
    validateProxy,
    updateProxy,
    enableProxy,
    disableProxy,
    toggleProxy,
    resetProxy,
    setProxy,
    getProxyPayload,
    validate
  }
}

/**
 * 代理类型选项
 */
export const PROXY_TYPES = [
  { label: 'SOCKS5', value: 'socks5' },
  { label: 'SOCKS4', value: 'socks4' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' }
]

/**
 * 格式化代理URL字符串
 * @param {Object} proxy - 代理配置
 * @returns {string}
 */
export function formatProxyUrl(proxy) {
  if (!proxy || !proxy.host || !proxy.port) {
    return ''
  }

  const { type = 'socks5', host, port, username, password } = proxy

  if (username && password) {
    return `${type}://${username}:${password}@${host}:${port}`
  }

  return `${type}://${host}:${port}`
}

/**
 * 从URL字符串解析代理配置
 * @param {string} proxyUrl - 代理URL字符串
 * @returns {Object|null}
 */
export function parseProxyUrl(proxyUrl) {
  if (!proxyUrl || typeof proxyUrl !== 'string') {
    return null
  }

  try {
    // 匹配格式: protocol://[username:password@]host:port
    const regex = /^(socks5|socks4|http|https):\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)$/
    const match = proxyUrl.match(regex)

    if (!match) {
      return null
    }

    const [, type, username, password, host, port] = match

    return {
      type,
      host,
      port: Number.parseInt(port, 10),
      username: username || '',
      password: password || ''
    }
  } catch (error) {
    console.warn('代理URL解析失败:', error)
    return null
  }
}
