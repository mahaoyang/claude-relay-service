const fs = require('fs')
const path = require('path')
const glob = require('glob')

// 要清理的样式模式
const patterns = [
  // 渐变相关
  /\bbg-gradient-to-[trbl]+\b/g,
  /\bfrom-[\w-]+(?:\/\d+)?\b/g,
  /\bto-[\w-]+(?:\/\d+)?\b/g,
  /\bvia-[\w-]+(?:\/\d+)?\b/g,

  // 阴影相关
  /\bshadow(?:-[\w]+)*\b/g,
  /\bdrop-shadow(?:-[\w]+)*\b/g,

  // 发光效果
  /\bglow[\w-]*\b/g,
  /\bblur(?:-[\w]+)?\b/g,

  // 背景色 (更全面)
  /\bbg-[\w]+-\d+(?:\/\d+)?\b/g,
  /\bbg-white(?:\/\d+)?\b/g,
  /\bbg-black(?:\/\d+)?\b/g,
  /\bbg-transparent\b/g,
  /\bbg-current\b/g,
  /\bbg-inherit\b/g,

  // 边框颜色
  /\bborder-[\w]+-\d+(?:\/\d+)?\b/g,
  /\bborder-white(?:\/\d+)?\b/g,
  /\bborder-black(?:\/\d+)?\b/g,
  /\bborder-transparent\b/g,

  // 文字颜色
  /\btext-[\w]+-\d+(?:\/\d+)?\b/g,
  /\btext-white(?:\/\d+)?\b/g,
  /\btext-black(?:\/\d+)?\b/g,

  // 环形/轮廓颜色
  /\bring-[\w]+-\d+(?:\/\d+)?\b/g,
  /\boutline-[\w]+-\d+(?:\/\d+)?\b/g,

  // 分隔线颜色
  /\bdivide-[\w]+-\d+(?:\/\d+)?\b/g,

  // placeholder 颜色
  /\bplaceholder-[\w]+-\d+(?:\/\d+)?\b/g,
  /\bplaceholder:[\w-]+\b/g,

  // backdrop
  /\bbackdrop-blur(?:-[\w]+)?\b/g,
  /\bbackdrop-[\w]+-[\w]+\b/g,

  // 圆角 (保留基本的 rounded)
  /\brounded-[\w]+\b/g
]

// 处理文件
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let originalContent = content
  let changes = 0

  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) {
      changes += matches.length
      content = content.replace(pattern, '')
    }
  }

  // 清理多余空格
  content = content.replace(/class="([^"]*)"/g, (match, classes) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim()
    return `class="${cleaned}"`
  })

  // 清理空的 class 属性
  content = content.replace(/\s*class=""\s*/g, ' ')
  content = content.replace(/\s*:class=""\s*/g, ' ')

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content)
    return changes
  }
  return 0
}

// 主函数
const files = glob.sync('src/**/*.vue', { cwd: __dirname })
let totalChanges = 0
let filesModified = 0

for (const file of files) {
  const fullPath = path.join(__dirname, file)
  const changes = processFile(fullPath)
  if (changes > 0) {
    console.log(`${file}: ${changes} changes`)
    totalChanges += changes
    filesModified++
  }
}

console.log(`\nTotal: ${filesModified} files, ${totalChanges} changes`)
