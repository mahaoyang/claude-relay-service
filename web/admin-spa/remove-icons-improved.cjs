const fs = require('fs')
const glob = require('glob')
const path = require('path')

console.log('安全清理所有图标（改进版）...\n')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })
let totalChanges = 0
let totalFiles = 0

function cleanFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content
  let changes = 0

  // 1. 删除 Lucide 图标导入
  content = content.replace(/import\s+{[^}]*}\s+from\s+['"]lucide-vue-next['"]\s*\n?/g, () => {
    changes++
    return ''
  })

  // 2. 删除单个自闭合 Icon 组件（不删除容器 div）
  content = content.replace(/<Icon\s+[^/>]*\/>/g, () => {
    changes++
    return ''
  })

  // 3. 删除 Icon 组件（开闭标签，不删除容器 div）
  content = content.replace(/<Icon\s+[^>]*>.*?<\/Icon>/gs, () => {
    changes++
    return ''
  })

  // 4. 删除 FontAwesome 图标（包括开闭标签）
  // 先删除自闭合的
  content = content.replace(/<i\s+[^>]*class="[^"]*\b(?:fa[srbl]?\s+fa-[^"]*|fas|far|fab|fal)"[^>]*\/>/g, () => {
    changes++
    return ''
  })
  // 再删除开闭标签对
  content = content.replace(/<i\s+[^>]*class="[^"]*\b(?:fa[srbl]?\s+fa-[^"]*|fas|far|fab|fal)"[^>]*>.*?<\/i>/gs, () => {
    changes++
    return ''
  })

  // 5. 删除 component :is 用法（Lucide 图标）
  content = content.replace(/<component\s+:is="[A-Z][a-zA-Z0-9]*"[^>]*\/>/g, () => {
    changes++
    return ''
  })

  // 6. 清理多余的空行（连续3个以上空行变成2个）
  content = content.replace(/\n\n\n+/g, '\n\n')

  // 7. 清理空的 class 属性
  content = content.replace(/\s*class=""\s*/g, ' ')

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
