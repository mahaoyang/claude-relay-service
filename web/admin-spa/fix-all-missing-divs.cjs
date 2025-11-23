const fs = require('fs')

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  let depth = 0
  let inTemplate = false
  const fixes = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    if (line.includes('<template>')) {
      inTemplate = true
      continue
    }
    if (line.includes('</template>')) {
      // 在 template 结束前，如果还有未闭合的 div，记录位置
      if (depth > 0) {
        console.log(`Template 结束时还有 ${depth} 个未闭合的 div`)
        // 在 template 结束前添加缺失的闭标签
        for (let j = 0; j < depth; j++) {
          fixes.push({ line: i, indent: '  ', add: '</div>' })
        }
      }
      break
    }

    if (!inTemplate) continue

    // 匹配开标签（非自闭合）
    const openMatches = line.match(/<div(?:\s[^/>]*)?>/g)
    // 匹配闭标签
    const closeMatches = line.match(/<\/div>/g)

    const openCount = openMatches ? openMatches.length : 0
    const closeCount = closeMatches ? closeMatches.length : 0

    const prevDepth = depth
    depth += openCount
    depth -= closeCount

    // 如果这一行之后深度变负，说明缺少开标签
    if (depth < 0) {
      console.log(`第 ${lineNum} 行有 ${-depth} 个多余的闭标签: ${line.trim().substring(0, 60)}`)
      // 删除多余的闭标签
      let fixed = line
      for (let j = 0; j < -depth; j++) {
        fixed = fixed.replace('</div>', '')
      }
      lines[i] = fixed
      depth = 0
    }
  }

  // 应用修复
  if (fixes.length > 0) {
    console.log(`\n添加 ${fixes.length} 个缺失的 </div> 标签`)
    for (const fix of fixes.reverse()) {
      lines.splice(fix.line, 0, fix.indent + fix.add)
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
  console.log(`✓ 已修复 ${filePath}`)
}

// 修复所有可能有问题的文件
const files = [
  'src/views/ApiKeysView.vue',
  'src/views/AccountsView.vue',
  'src/views/SettingsView.vue',
  'src/views/DashboardView.vue'
]

files.forEach((file) => {
  try {
    fixFile(file)
  } catch (e) {
    console.error(`修复 ${file} 失败:`, e.message)
  }
})
