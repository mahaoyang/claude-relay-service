const fs = require('fs')
const glob = require('glob')
const path = require('path')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })

let totalChanges = 0
let totalFiles = 0

// 完整的 border 相关 Tailwind 类名列表
const borderClassPatterns = [
  // Basic border
  /\bborder\b(?!-)/g,
  /\bborder-0\b/g,
  /\bborder-2\b/g,
  /\bborder-4\b/g,
  /\bborder-8\b/g,

  // Border sides with width
  /\bborder-[trblxy]-\d+\b/g,
  /\bborder-[trblxy]\b/g,

  // Border style
  /\bborder-solid\b/g,
  /\bborder-dashed\b/g,
  /\bborder-dotted\b/g,
  /\bborder-double\b/g,
  /\bborder-hidden\b/g,
  /\bborder-none\b/g,

  // Border color (包含所有颜色)
  /\bborder-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)-(?:\d+|inherit|transparent)\b/g,

  // Border radius
  /\brounded(?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?\b/g,
  /\brounded-[trbl](?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?\b/g,
  /\brounded-[trbl][trbl](?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?\b/g,

  // Divide (border between elements)
  /\bdivide-[xy](?:-\d+)?\b/g,
  /\bdivide-(?:solid|dashed|dotted|double|none)\b/g,
  /\bdivide-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)-(?:\d+|inherit|transparent)\b/g,

  // Ring (focus rings)
  /\bring\b(?!-)/g,
  /\bring-\d+\b/g,
  /\bring-inset\b/g,
  /\bring-offset-\d+\b/g,
  /\bring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)-(?:\d+|inherit|transparent)\b/g,
  /\bring-offset-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)-(?:\d+|inherit|transparent)\b/g,

  // Outline
  /\boutline\b(?!-)/g,
  /\boutline-\d+\b/g,
  /\boutline-(?:none|dashed|dotted|double|hidden)\b/g,
  /\boutline-offset-\d+\b/g,
  /\boutline-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)-(?:\d+|inherit|transparent)\b/g
]

function cleanClasses(classString) {
  let cleaned = classString

  // 应用所有模式
  borderClassPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '')
  })

  // 清理多余空格
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

function cleanFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content
  let changes = 0

  // 1. 清理 class="..." 中的边框类
  content = content.replace(/class="([^"]*)"/g, (match, classes) => {
    const cleaned = cleanClasses(classes)
    if (cleaned !== classes) {
      changes++
    }
    return cleaned ? `class="${cleaned}"` : ''
  })

  // 2. 清理 :class="..." 中的边框类（简单字符串）
  content = content.replace(/:class="([^"]*)"/g, (match, classes) => {
    const cleaned = cleanClasses(classes)
    if (cleaned !== classes) {
      changes++
    }
    return cleaned ? `:class="${cleaned}"` : ''
  })

  // 3. 清理 :class="[...]" 数组中的字符串
  content = content.replace(/:class="\[([\s\S]*?)\]"/g, (match, arrayContent) => {
    const cleaned = arrayContent.replace(/'([^']*)'/g, (m, classes) => {
      const c = cleanClasses(classes)
      return c ? `'${c}'` : "''"
    })
    if (cleaned !== arrayContent) {
      changes++
    }
    return `:class="[${cleaned}]"`
  })

  // 4. 清理 CSS 样式中的 border 属性（删除整行）
  content = content.replace(/^ *border(?:-[a-z]+)*: [^;]+;?\s*$/gm, (match) => {
    changes++
    return ''
  })

  // 5. 清理空的 class 属性
  content = content.replace(/\s*class=""\s*/g, ' ')
  content = content.replace(/\s*:class=""\s*/g, ' ')
  content = content.replace(/\s*:class="\[\s*\]"\s*/g, ' ')

  // 6. 清理多余空行
  content = content.replace(/\n\n\n+/g, '\n\n')

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath} (${changes} 处修改)`)
    totalChanges += changes
    totalFiles++
    return true
  }

  return false
}

console.log('清理所有 border 相关类（改进版）...\n')

vueFiles.forEach((file) => {
  cleanFile(file)
})

console.log(`\n完成！共清理 ${totalFiles} 个文件，${totalChanges} 处修改`)
