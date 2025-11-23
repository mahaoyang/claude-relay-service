const fs = require('fs')
const path = require('path')
const glob = require('glob')

console.log('安全清理所有图标...\n')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })
let totalChanges = 0
let totalFiles = 0

function cleanFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content
  let changes = 0

  // 1. 删除 Lucide 图标导入
  // 匹配: import { Icon1, Icon2, ... } from 'lucide-vue-next'
  content = content.replace(
    /import\s+{[^}]*}\s+from\s+['"]lucide-vue-next['"]\s*\n?/g,
    match => {
      changes++
      return ''
    }
  )

  // 2. 删除单个 Icon 组件（自关闭标签）
  // 匹配: <Icon ... />
  content = content.replace(
    /<Icon\s+[^>]*\/>/g,
    match => {
      changes++
      return ''
    }
  )

  // 3. 删除 Icon 组件（开闭标签）
  // 匹配: <Icon ...>...</Icon>
  content = content.replace(
    /<Icon\s+[^>]*>.*?<\/Icon>/gs,
    match => {
      changes++
      return ''
    }
  )

  // 4. 删除 FontAwesome 图标
  // 匹配: <i class="fa-..." />
  content = content.replace(
    /<i\s+[^>]*class="[^"]*\bfa[s|b|r]?\s+fa-[^"]*"[^>]*\/>/g,
    match => {
      changes++
      return ''
    }
  )

  // 5. 删除 component :is 用法（Lucide 图标）
  // 匹配: <component :is="SomeIcon" ... />
  content = content.replace(
    /<component\s+:is="[A-Z][a-zA-Z0-9]*Icon[^"]*"[^>]*\/>/g,
    match => {
      changes++
      return ''
    }
  )

  // 6. 删除 <div> 中只包含图标的情况
  // 匹配: <div ...> <Icon.../> </div> 或类似结构
  content = content.replace(
    /<div[^>]*>\s*<(?:Icon|i|component)[^>]*\/>\s*<\/div>/g,
    match => {
      changes++
      return ''
    }
  )

  // 7. 清理多余的空行（连续3个以上空行变成2个）
  content = content.replace(/\n\n\n+/g, '\n\n')

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8')
    totalChanges += changes
    totalFiles++
    console.log(`✓ ${filePath} (${changes} 处修改)`)
  }
}

// 处理所有文件
vueFiles.forEach(cleanFile)

console.log(`\n完成！共修改 ${totalFiles} 个文件，${totalChanges} 处改动`)
console.log('\n现在运行格式化：')
console.log('npx prettier --write "src/**/*.vue"')
