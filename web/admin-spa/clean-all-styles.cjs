const fs = require('fs')
const glob = require('glob')
const path = require('path')

console.log('彻底清理所有样式（颜色、边框、圆角、阴影）...\n')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })
let totalChanges = 0
let totalFiles = 0

// 所有要删除的 Tailwind 类模式
const stylePatterns = [
  // === 颜色类 ===
  // 文本颜色
  /\btext-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-(?:\d+|inherit|transparent)\b/g,
  /\btext-current\b/g,

  // 背景颜色
  /\bbg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)-(?:\d+|inherit|transparent)\b/g,
  /\bbg-transparent\b/g,
  /\bbg-current\b/g,
  /\bbg-gradient-to-[trblxy]+\b/g,
  /\bfrom-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:\d+)\b/g,
  /\bto-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:\d+)\b/g,
  /\bvia-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:\d+)\b/g,

  // 边框颜色
  /\bborder-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)-(?:\d+|inherit|transparent)\b/g,

  // === 边框样式 ===
  /\bborder\b(?!-none)/g,
  /\bborder-(?:0|2|4|8)\b/g,
  /\bborder-[trblxy](?:-\d+)?\b/g,
  /\bborder-(?:solid|dashed|dotted|double|hidden|none)\b/g,

  // === 圆角 ===
  /\brounded(?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?\b/g,
  /\brounded-[trbl](?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?\b/g,
  /\brounded-[trbl][trbl](?:-(?:none|sm|md|lg|xl|2xl|3xl|full))?\b/g,

  // === 阴影 ===
  /\bshadow(?:-(?:sm|md|lg|xl|2xl|inner|none))?\b/g,
  /\bdrop-shadow(?:-(?:sm|md|lg|xl|2xl|none))?\b/g,

  // === Ring ===
  /\bring(?:-\d+)?\b/g,
  /\bring-inset\b/g,
  /\bring-offset-\d+\b/g,
  /\bring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|transparent|current)-(?:\d+|inherit|transparent)\b/g,
  /\bring-offset-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:\d+)\b/g,

  // === Outline ===
  /\boutline(?:-(?:\d+|none|dashed|dotted|double|hidden))?\b/g,
  /\boutline-offset-\d+\b/g,
  /\boutline-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:\d+)\b/g,

  // === Divide ===
  /\bdivide-[xy](?:-\d+)?\b/g,
  /\bdivide-(?:solid|dashed|dotted|double|none)\b/g,
  /\bdivide-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:\d+)\b/g
]

function cleanClasses(classString) {
  let cleaned = classString

  // 应用所有模式
  stylePatterns.forEach((pattern) => {
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

  // 1. 清理 class="..." 中的样式类
  content = content.replace(/class="([^"]*)"/g, (match, classes) => {
    const cleaned = cleanClasses(classes)
    if (cleaned !== classes) changes++
    return cleaned ? `class="${cleaned}"` : ''
  })

  // 2. 清理 :class="..." 中的样式类
  content = content.replace(/:class="([^"]*)"/g, (match, classes) => {
    const cleaned = cleanClasses(classes)
    if (cleaned !== classes) changes++
    return cleaned ? `:class="${cleaned}"` : ''
  })

  // 3. 清理 :class="[...]" 数组中的字符串
  content = content.replace(/:class="\[([\s\S]*?)\]"/g, (match, arrayContent) => {
    const cleaned = arrayContent.replace(/'([^']*)'/g, (m, classes) => {
      const c = cleanClasses(classes)
      return c ? `'${c}'` : "''"
    })
    if (cleaned !== arrayContent) changes++
    return `:class="[${cleaned}]"`
  })

  // 4. 清理 CSS 样式中的相关属性
  const cssPatterns = [
    /^ *(?:background|bg|background-color|border|border-[a-z]+|box-shadow|text-shadow|outline|color|border-radius): [^;]+;?\s*$/gm
  ]
  cssPatterns.forEach((pattern) => {
    content = content.replace(pattern, (match) => {
      changes++
      return ''
    })
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

console.log('开始清理...\n')

vueFiles.forEach((file) => {
  cleanFile(file)
})

console.log(`\n完成！共清理 ${totalFiles} 个文件，${totalChanges} 处修改`)
