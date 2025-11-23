const fs = require('fs')
const glob = require('glob')
const path = require('path')

console.log('🧹 开始彻底清理所有样式和布局...\n')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })
let totalChanges = 0
let totalFiles = 0

vueFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  let content = fs.readFileSync(filePath, 'utf-8')
  const original = content
  let changes = 0

  // 1. 删除所有 class 属性（保留空的 class=""）
  // 匹配 class="..." 或 :class="..."
  content = content.replace(/\s+class="[^"]*"/g, (match) => {
    changes++
    return ''
  })

  // 删除 :class 绑定
  content = content.replace(/\s+:class="[^"]*"/g, (match) => {
    changes++
    return ''
  })

  // 删除 :class="{...}" 对象绑定
  content = content.replace(/\s+:class="\{[^}]*\}"/g, (match) => {
    changes++
    return ''
  })

  // 删除 :class="[...]" 数组绑定
  content = content.replace(/\s+:class="\[[^\]]*\]"/g, (match) => {
    changes++
    return ''
  })

  // 2. 删除所有内联样式
  content = content.replace(/\s+style="[^"]*"/g, (match) => {
    changes++
    return ''
  })
  content = content.replace(/\s+:style="[^"]*"/g, (match) => {
    changes++
    return ''
  })

  // 3. 删除所有 <style scoped> 标签及其内容
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (match) => {
    changes++
    return ''
  })

  // 4. 清理空行（多个连续空行变成一个）
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n')

  // 5. 清理多余的空格
  content = content.replace(/  +/g, ' ')

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8')
    totalChanges += changes
    totalFiles++
    console.log(`✅ ${file} - 清理了 ${changes} 处样式`)
  }
})

console.log(`\n✨ 完成！`)
console.log(`📁 处理了 ${totalFiles} 个文件`)
console.log(`🔧 总共清理了 ${totalChanges} 处样式`)
console.log(`\n⚠️  请运行 'npx prettier --write src/**/*.vue' 格式化代码`)
