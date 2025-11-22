/**
 * useTheme - 主题访问 Composable
 * 提供主题 tokens 和组件样式的访问接口
 */

import { tokens } from '@/themes/tokens'
import { componentStyles } from '@/themes/components'

/**
 * 条件类名合并工具函数
 * 类似于 clsx 或 classnames
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * 从对象路径获取值
 * 例如: get(obj, 'a.b.c') 返回 obj.a.b.c
 */
function get(obj, path) {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return undefined
    }
  }

  return result
}

/**
 * 主题 Composable
 * @param {string} component - 组件名称（可选）
 * @returns {Object} 主题工具和样式
 */
export function useTheme(component = null) {
  // 获取指定组件的样式配置
  const styles = component ? componentStyles[component] || {} : componentStyles

  /**
   * 获取 token 值
   * @param {string} path - token 路径，如 'colors.primary.DEFAULT'
   * @returns {string|undefined} token 值
   */
  const getToken = (path) => {
    return get(tokens, path)
  }

  /**
   * 变体选择器
   * 根据当前变体返回对应的样式类
   *
   * @param {string} baseClass - 基础类名
   * @param {Object} variants - 变体样式映射
   * @param {string} currentVariant - 当前变体
   * @returns {string} 组合后的类名
   */
  const variant = (baseClass, variants, currentVariant) => {
    const variantClass = variants[currentVariant] || variants.default || ''
    return cn(baseClass, variantClass)
  }

  /**
   * 尺寸选择器
   * @param {Object} sizes - 尺寸样式映射
   * @param {string} currentSize - 当前尺寸
   * @returns {string} 尺寸类名
   */
  const size = (sizes, currentSize) => {
    return sizes[currentSize] || sizes.md || ''
  }

  return {
    // 原始数据
    tokens,
    styles,

    // 工具函数
    cn,
    getToken,
    variant,
    size
  }
}

export default useTheme
