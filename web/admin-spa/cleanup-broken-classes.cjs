const fs = require('fs')
const glob = require('glob')
const path = require('path')

console.log('清理残留的破损样式类...\n')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })
let totalChanges = 0
let totalFiles = 0

function cleanBrokenClasses(classString) {
  let cleaned = classString

  // 删除所有孤立的 dark: 前缀（没有跟实际类名）
  cleaned = cleaned.replace(/\bdark:\s*/g, '')

  // 删除所有孤立的 hover: 前缀
  cleaned = cleaned.replace(/\bhover:\s*/g, '')

  // 删除所有孤立的 focus: 前缀
  cleaned = cleaned.replace(/\bfocus:\s*/g, '')

  // 删除所有孤立的 active: 前缀
  cleaned = cleaned.replace(/\bactive:\s*/g, '')

  // 删除所有孤立的 disabled: 前缀
  cleaned = cleaned.replace(/\bdisabled:\s*/g, '')

  // 删除所有孤立的响应式前缀
  cleaned = cleaned.replace(/\b(?:sm|md|lg|xl|2xl):\s*/g, '')

  // 删除所有残留的 -transparent、-offset-* 等不完整类
  cleaned = cleaned.replace(/\b-(?:transparent|offset-\d+|inset)\b/g, '')

  // 清理多余空格
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

function cleanFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content
  let changes = 0

  // 1. 清理 class="..." 中的破损类
  content = content.replace(/class="([^"]*)"/g, (match, classes) => {
    const cleaned = cleanBrokenClasses(classes)
    if (cleaned !== classes) {
      changes++
      return cleaned ? `class="${cleaned}"` : ''
    }
    return match
  })

  // 2. 清理 :class="..." 中的破损类
  content = content.replace(/:class="([^"]*)"/g, (match, classes) => {
    const cleaned = cleanBrokenClasses(classes)
    if (cleaned !== classes) {
      changes++
      return cleaned ? `:class="${cleaned}"` : ''
    }
    return match
  })

  // 3. 清理 :class="[...]" 数组中的字符串
  content = content.replace(/:class="\[([^\]]*)\]"/g, (match, arrayContent) => {
    const cleaned = arrayContent.replace(/'([^']*)'/g, (m, classes) => {
      const c = cleanBrokenClasses(classes)
      if (c !== classes) {
        changes++
      }
      return c ? `'${c}'` : "''"
    })
    return `:class="[${cleaned}]"`
  })

  // 4. 清理空的 class 属性
  content = content.replace(/\s*class=""\s*/g, ' ')
  content = content.replace(/\s*:class=""\s*/g, ' ')
  content = content.replace(/\s*:class="\[\s*\]"\s*/g, ' ')
  content = content.replace(/\s*:class="\[\s*''\s*\]"\s*/g, ' ')

  // 5. 清理多余空行
  content = content.replace(/\n\n\n+/g, '\n\n')

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath} (${changes} 处修改)`)
    totalChanges += changes
    totalFiles++
  }
}

console.log('开始清理...\n')

vueFiles.forEach(file => {
  cleanFile(file)
})

console.log(`\n完成！共清理 ${totalFiles} 个文件，${totalChanges} 处修改`)
