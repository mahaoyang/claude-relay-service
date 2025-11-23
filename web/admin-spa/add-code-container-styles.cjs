const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src/views/TutorialView.vue')
let content = fs.readFileSync(filePath, 'utf-8')

// 定位包含多行代码的 div 容器并添加背景样式
// 使用更精确的模式：查找包含命令行的连续div块

// 模式1: 包含 "# " 注释的代码块
content = content.replace(
  /(<div class="font-mono text-sm text-gray-400"># [^<]+<\/div>\s*<div)/g,
  function (match, p1) {
    // 在前面添加容器开始标签
    const preceding = content.substring(
      Math.max(0, content.indexOf(match) - 200),
      content.indexOf(match)
    )
    if (!preceding.includes('bg-gray-900')) {
      return (
        '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto space-y-1">\n            ' +
        match
      )
    }
    return match
  }
)

// 为每个独立的代码块组添加容器
const codeBlockPatterns = [
  // npm/node 命令
  {
    start: /<p class="text-gray-600 mb-3 leading-relaxed">.*?输入以下命令：<\/p>\s*<div>/,
    replacement:
      '<p class="text-gray-600 mb-3 leading-relaxed">$&</p>\n          <div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto space-y-1">'
  }
]

// 手动标记主要的代码块位置
const manualReplacements = [
  // Windows Chocolatey 代码块
  {
    find: '如果你安装了 Chocolatey 或 Scoop，可以使用命令行安装：</p>\n            <div>',
    replace:
      '如果你安装了 Chocolatey 或 Scoop，可以使用命令行安装：</p>\n            <div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto space-y-1">'
  },
  // node/npm version
  {
    find: '安装完成后，打开 PowerShell 或 CMD，输入以下命令：</p>\n          <div>',
    replace:
      '安装完成后，打开 PowerShell 或 CMD，输入以下命令：</p>\n          <div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto space-y-1">'
  },
  // claude version
  {
    find: '安装完成后，输入以下命令检查是否安装成功：</p>\n          <div>',
    replace:
      '安装完成后，输入以下命令检查是否安装成功：</p>\n          <div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto space-y-1">'
  }
]

manualReplacements.forEach(({ find, replace }) => {
  content = content.replace(find, replace)
})

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8')
console.log('✅ Code container backgrounds added!')
