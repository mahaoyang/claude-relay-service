/**
 * Design Tokens - 设计系统的核心变量
 * 统一管理颜色、间距、字体、圆角等设计元素
 */

export const tokens = {
  // 颜色系统
  colors: {
    // 主色系（保持现有的teal主题）
    primary: {
      DEFAULT: 'teal-600',
      hover: 'teal-700',
      active: 'teal-800',
      light: 'teal-50',
      dark: 'teal-900'
    },
    // 暗黑模式主色（紫/靛蓝）
    primaryDark: {
      DEFAULT: 'indigo-400',
      hover: 'indigo-300',
      active: 'indigo-200'
    },
    // 次要色
    secondary: {
      DEFAULT: 'purple-500',
      hover: 'purple-600',
      light: 'purple-50',
      dark: 'purple-900'
    },
    // 中性色系
    neutral: {
      // 背景
      bg: {
        primary: 'bg-white dark:bg-gray-900',
        secondary: 'bg-gray-50 dark:bg-gray-800',
        tertiary: 'bg-gray-100 dark:bg-gray-700'
      },
      // 文本
      text: {
        primary: 'text-gray-900 dark:text-gray-100',
        secondary: 'text-gray-600 dark:text-gray-400',
        tertiary: 'text-gray-500 dark:text-gray-500',
        placeholder: 'text-gray-400 dark:text-gray-600'
      },
      // 边框
      border: {
        DEFAULT: 'border-gray-200 dark:border-gray-700',
        light: 'border-gray-100 dark:border-gray-800',
        strong: 'border-gray-300 dark:border-gray-600'
      }
    },
    // 状态色
    status: {
      success: {
        DEFAULT: 'green-600',
        light: 'green-50',
        dark: 'green-900',
        text: 'green-700 dark:green-400'
      },
      warning: {
        DEFAULT: 'amber-600',
        light: 'amber-50',
        dark: 'amber-900',
        text: 'amber-700 dark:amber-400'
      },
      error: {
        DEFAULT: 'red-600',
        light: 'red-50',
        dark: 'red-900',
        text: 'red-700 dark:red-400'
      },
      info: {
        DEFAULT: 'blue-600',
        light: 'blue-50',
        dark: 'blue-900',
        text: 'blue-700 dark:blue-400'
      }
    }
  },

  // 间距系统
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem' // 64px
  },

  // 圆角
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  },

  // 阴影
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner'
  },

  // 字体大小
  fontSize: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  },

  // 字体粗细
  fontWeight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  },

  // 过渡动画
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    base: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out'
  },

  // Z-index层级
  zIndex: {
    dropdown: 'z-40',
    overlay: 'z-50',
    modal: 'z-50',
    popover: 'z-60',
    tooltip: 'z-70'
  }
}

export default tokens
