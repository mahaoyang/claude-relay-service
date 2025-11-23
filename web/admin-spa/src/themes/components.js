/**
 * Component Styles - 组件样式配置
 * 基于 Design Tokens 定义各个组件的样式
 */

export const componentStyles = {
  // Dialog 对话框
  dialog: {
    overlay: 'fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity',
    container: 'fixed inset-0 overflow-y-auto p-4 flex items-center justify-center',
    panel:
      'relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all',
    title: 'text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4',
    description: 'text-sm text-gray-600 dark:text-gray-400 mb-6',
    footer: 'mt-6 flex items-center justify-end gap-3',
    closeButton:
      'absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
  },

  // ConfirmDialog 确认对话框
  confirmDialog: {
    // 继承 dialog 的基础样式
    overlay: 'fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity',
    container: 'fixed inset-0 overflow-y-auto p-4 flex items-center justify-center',
    panel:
      'relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all',
    header: 'flex items-center gap-3 mb-4',
    iconWrapper: 'flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full',
    title: 'text-lg font-semibold leading-6',
    message: 'text-sm mt-3 mb-6',
    footer: 'flex items-center justify-end gap-3',
    // 不同变体的样式
    variants: {
      default: {
        iconWrapper: 'bg-gray-100 dark:bg-gray-700',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-100',
        message: 'text-gray-600 dark:text-gray-400'
      },
      info: {
        iconWrapper: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-gray-900 dark:text-gray-100',
        message: 'text-gray-600 dark:text-gray-400'
      },
      success: {
        iconWrapper: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-gray-900 dark:text-gray-100',
        message: 'text-gray-600 dark:text-gray-400'
      },
      warning: {
        iconWrapper: 'bg-amber-100 dark:bg-amber-900/30',
        icon: 'text-amber-600 dark:text-amber-400',
        title: 'text-gray-900 dark:text-gray-100',
        message: 'text-gray-600 dark:text-gray-400'
      },
      danger: {
        iconWrapper: 'bg-red-100 dark:bg-red-900/30',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100',
        message: 'text-gray-600 dark:text-gray-400'
      }
    }
  },

  // Button 按钮
  button: {
    base: 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    // 尺寸
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg'
    },
    // 变体
    variants: {
      primary:
        'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm focus:ring-teal-500 dark:bg-indigo-500 dark:hover:bg-indigo-600',
      secondary:
        'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
      danger:
        'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus:ring-red-500',
      success:
        'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm focus:ring-green-500',
      ghost:
        'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
      outline:
        'border-2 border-gray-300 hover:border-gray-400 bg-transparent text-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300'
    },
    // Loading 状态
    loading: 'relative pointer-events-none',
    loadingIcon: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    loadingContent: 'opacity-0'
  },

  // Menu 下拉菜单
  menu: {
    button:
      'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors',
    items:
      'absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none',
    item: 'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer first:rounded-t-md last:rounded-b-md',
    itemActive: 'bg-teal-50 dark:bg-indigo-900/30 text-teal-900 dark:text-indigo-200',
    itemDisabled: 'opacity-50 cursor-not-allowed',
    separator: 'my-1 h-px bg-gray-200 dark:bg-gray-700',
    icon: 'w-5 h-5 flex-shrink-0'
  },

  // Input 输入框
  input: {
    wrapper: 'w-full',
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
    input:
      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600',
    error: 'border-red-500 dark:border-red-500 focus:ring-red-500',
    disabled: 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed',
    helperText: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
    errorText: 'mt-1 text-xs text-red-600 dark:text-red-400',
    icon: 'absolute inset-y-0 flex items-center pointer-events-none',
    iconLeft: 'left-3',
    iconRight: 'right-3'
  },

  // Select 选择器
  select: {
    button:
      'relative w-full cursor-pointer rounded-md bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-indigo-500 text-gray-900 dark:text-gray-100',
    buttonText: 'block truncate',
    buttonIcon: 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2',
    options:
      'absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50',
    option: 'relative cursor-pointer select-none py-2 pl-10 pr-4 text-gray-900 dark:text-gray-100',
    optionActive: 'bg-teal-100 dark:bg-indigo-900/30 text-teal-900 dark:text-indigo-200',
    optionSelected: 'font-semibold',
    optionCheck: 'absolute inset-y-0 left-0 flex items-center pl-3'
  },

  // Switch 开关
  switch: {
    wrapper: 'inline-flex items-center gap-3',
    button:
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-indigo-500 focus:ring-offset-2',
    buttonOff: 'bg-gray-200 dark:bg-gray-700',
    buttonOn: 'bg-teal-600 dark:bg-indigo-500',
    toggle: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
    toggleOff: 'translate-x-1',
    toggleOn: 'translate-x-6',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300'
  },

  // Tabs 标签页
  tabs: {
    list: 'flex gap-2 border-b border-gray-200 dark:border-gray-700',
    tab: 'px-4 py-2 text-sm font-medium transition-colors focus:outline-none',
    tabDefault: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
    tabSelected:
      'text-teal-600 dark:text-indigo-400 border-b-2 border-teal-600 dark:border-indigo-400',
    panel: 'py-4'
  },

  // Badge 徽章
  badge: {
    base: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
    variants: {
      default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
      error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
      info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
    },
    sizes: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm'
    },
    dot: 'w-2 h-2 rounded-full'
  },

  // Alert 警告提示
  alert: {
    base: 'rounded-lg p-4 mb-4',
    variants: {
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    title: 'text-sm font-semibold mb-1',
    message: 'text-sm',
    icon: 'w-5 h-5 flex-shrink-0',
    closeButton:
      'ml-auto -mr-1 -mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
  },

  // Card 卡片
  card: {
    base: 'rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700',
    hover: 'transition-shadow hover:shadow-md',
    header: 'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
    body: 'px-6 py-4',
    footer: 'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
  },

  // Popover 弹出框
  popover: {
    panel:
      'absolute z-50 mt-2 w-max max-w-sm transform rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10',
    arrow: 'absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 rotate-45'
  }
}

export default componentStyles
