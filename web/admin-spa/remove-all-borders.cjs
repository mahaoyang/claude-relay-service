const fs = require('fs')
const glob = require('glob')
const path = require('path')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })

let totalChanges = 0
let totalFiles = 0

// Border 相关的 Tailwind 类模式
const borderPatterns = [
  // Border width
  /\bborder\s/g, // border (单独的类，后面有空格)
  /\bborder-0\b/g,
  /\bborder-2\b/g,
  /\bborder-4\b/g,
  /\bborder-8\b/g,
  /\bborder\b(?!-none)/g, // border 但不是 border-none

  // Border sides
  /\bborder-[trblxy]-\d+\b/g, // border-t-2, border-r-4, etc.
  /\bborder-[trblxy]\b/g, // border-t, border-r, etc.

  // Border style
  /\bborder-solid\b/g,
  /\bborder-dashed\b/g,
  /\bborder-dotted\b/g,
  /\bborder-double\b/g,

  // Border radius (rounded)
  /\brounded(?:-[a-z]+)?\b/g, // rounded, rounded-md, rounded-lg, etc.

  // Divide (between elements)
  /\bdivide-[xy]-\d+\b/g,
  /\bdivide-[xy]\b/g,
  /\bdivide-solid\b/g,
  /\bdivide-dashed\b/g,

  // Ring (focus rings)
  /\bring(?:-\d+)?\b/g,
  /\bring-offset-\d+\b/g,
  /\bring-inset\b/g
]

function cleanFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content
  let changes = 0

  // 应用所有 border 模式清理
  borderPatterns.forEach((pattern) => {
    const matches = content.match(pattern)
    if (matches) {
      content = content.replace(pattern, '')
      changes += matches.length
    }
  })

  // 清理多余空格
  content = content.replace(/class="([^"]*)"/g, (match, classes) => {
    const cleaned = classes.replace(/\s{2,}/g, ' ').trim()
    return cleaned ? `class="${cleaned}"` : ''
  })

  // 清理 :class 中的空格
  content = content.replace(/:class="([^"]*)"/g, (match, classes) => {
    const cleaned = classes.replace(/\s{2,}/g, ' ').trim()
    return cleaned ? `:class="${cleaned}"` : ''
  })

  // 清理空的 class 属性
  content = content.replace(/\s*class=""\s*/g, ' ')
  content = content.replace(/\s*:class=""\s*/g, ' ')

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath} (${changes} changes)`)
    totalChanges += changes
    totalFiles++
    return true
  }

  return false
}

console.log('清理所有 border 相关类...\n')

vueFiles.forEach((file) => {
  cleanFile(file)
})

console.log(`\n完成！共清理 ${totalFiles} 个文件，${totalChanges} 处修改`)
