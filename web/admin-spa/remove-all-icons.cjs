const fs = require('fs')
const glob = require('glob')
const path = require('path')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })

let totalChanges = 0
let totalFiles = 0

function cleanFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content
  let changes = 0

  // 1. 删除 <Icon /> 组件（单标签）
  const iconSelfClosingPattern = /<Icon[^>]*\/>/g
  const iconMatches = content.match(iconSelfClosingPattern)
  if (iconMatches) {
    content = content.replace(iconSelfClosingPattern, '')
    changes += iconMatches.length
  }

  // 2. 删除 <Icon></Icon> 组件（双标签）
  const iconPairPattern = /<Icon[^>]*>[\s\S]*?<\/Icon>/g
  const iconPairMatches = content.match(iconPairPattern)
  if (iconPairMatches) {
    content = content.replace(iconPairPattern, '')
    changes += iconPairMatches.length
  }

  // 3. 删除 FontAwesome <i> 标签
  const faIconPattern = /<i\s+[^>]*class="[^"]*fa[sbrld]?\s+fa-[^"]*"[^>]*><\/i>/g
  const faMatches = content.match(faIconPattern)
  if (faMatches) {
    content = content.replace(faIconPattern, '')
    changes += faMatches.length
  }

  // 4. 删除自闭合的 <i> 标签
  const faSelfClosingPattern = /<i\s+[^>]*class="[^"]*fa[sbrld]?\s+fa-[^"]*"[^>]*\/>/g
  const faSelfMatches = content.match(faSelfClosingPattern)
  if (faSelfMatches) {
    content = content.replace(faSelfClosingPattern, '')
    changes += faSelfMatches.length
  }

  // 5. 删除 icon 相关的 props 和属性
  // icon="..." 或 :icon="..."
  content = content.replace(/\s+:?icon="[^"]*"/g, '')
  content = content.replace(/\s+:?icon-name="[^"]*"/g, '')
  content = content.replace(/\s+:?icon-color="[^"]*"/g, '')
  content = content.replace(/\s+:?icon-class="[^"]*"/g, '')

  // 6. 删除 JavaScript 中的 icon 导入
  // import { Icon1, Icon2 } from 'lucide-vue-next'
  const lucideImportPattern = /import\s+{[^}]*}\s+from\s+['"]lucide-vue-next['"]\s*\n?/g
  if (content.match(lucideImportPattern)) {
    content = content.replace(lucideImportPattern, '')
    changes++
  }

  // 7. 清理空行
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n')

  // 8. 清理多余的空格和空属性
  content = content.replace(/\s{2,}/g, ' ')
  content = content.replace(/<([a-zA-Z][a-zA-Z0-9]*)\s+>/g, '<$1>')

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath} (${changes} changes)`)
    totalChanges += changes
    totalFiles++
    return true
  }

  return false
}

console.log('清理所有 icon...\n')

vueFiles.forEach(file => {
  cleanFile(file)
})

console.log(`\n完成！共清理 ${totalFiles} 个文件，${totalChanges} 处修改`)
