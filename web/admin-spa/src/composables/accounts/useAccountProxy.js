// 账户表单代理配置相关的纯函数，集中处理解析、标准化与构建请求载荷
export const createDefaultProxyState = () => ({
  enabled: false,
  type: 'socks5',
  host: '',
  port: '',
  username: '',
  password: ''
})

// 将后端返回的代理配置解析为表单可用的对象
export const parseProxyResponse = (rawProxy) => {
  if (!rawProxy) {
    return null
  }

  let proxyObject = rawProxy
  if (typeof rawProxy === 'string') {
    try {
      proxyObject = JSON.parse(rawProxy)
    } catch (error) {
      return null
    }
  }

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

// 将后端代理配置标准化为表单状态
export const normalizeProxyFormState = (rawProxy) => {
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

// 将表单代理状态转换为接口需要的载荷
export const buildProxyPayload = (proxyState) => {
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
