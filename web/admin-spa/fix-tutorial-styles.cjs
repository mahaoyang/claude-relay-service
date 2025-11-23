const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src/views/TutorialView.vue')
let content = fs.readFileSync(filePath, 'utf-8')

// 添加样式类的映射规则
const styleRules = [
  // 标题样式
  { pattern: /<h3>/g, replacement: '<h3 class="text-2xl font-bold text-gray-900 mb-4">' },
  { pattern: /<h4>/g, replacement: '<h4 class="text-xl font-semibold text-gray-800 mb-3 mt-6">' },
  { pattern: /<h5>/g, replacement: '<h5 class="text-lg font-medium text-gray-700 mb-2 mt-4">' },
  { pattern: /<h6>/g, replacement: '<h6 class="text-base font-medium text-gray-700 mb-2">' },

  // 段落样式
  { pattern: /<p>/g, replacement: '<p class="text-gray-600 mb-3 leading-relaxed">' },

  // 列表样式
  {
    pattern: /<ol>/g,
    replacement: '<ol class="list-decimal list-inside space-y-2 text-gray-600 mb-4">'
  },
  {
    pattern: /<ul>/g,
    replacement: '<ul class="list-disc list-inside space-y-2 text-gray-600 mb-4">'
  },
  { pattern: /<li>/g, replacement: '<li class="text-gray-600">' },

  // 代码块样式
  {
    pattern: /<code>/g,
    replacement: '<code class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">'
  },

  // 按钮样式 (只针对没有class的button)
  {
    pattern: /<button\s+v-for/g,
    replacement:
      '<button class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors" v-for'
  },

  // 容器样式
  {
    pattern: /<div>\s*<div>\s*<h6>/g,
    replacement:
      '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">\n      <div>\n        <h6>'
  },
  {
    pattern: /<div>\s*<h6>提示/g,
    replacement:
      '<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">\n        <h6 class="text-base font-medium text-yellow-800 mb-2">提示'
  },
  {
    pattern: /<div>\s*<h6>注意/g,
    replacement:
      '<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">\n        <h6 class="text-base font-medium text-red-800 mb-2">注意'
  },

  // 步骤编号样式
  {
    pattern: /<span>(\d+)<\/span>/g,
    replacement:
      '<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold mr-2">$1</span>'
  }
]

// 应用所有规则
styleRules.forEach((rule) => {
  content = content.replace(rule.pattern, rule.replacement)
})

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8')
console.log('✅ Tutorial view styles fixed!')
