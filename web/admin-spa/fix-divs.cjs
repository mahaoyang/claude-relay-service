const fs = require('fs')
const content = fs.readFileSync('src/views/ApiKeysView.vue', 'utf8')

const lines = content.split('\n')
let depth = 0
let inTemplate = false
const linesToRemove = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const lineNum = i + 1

  if (line.includes('<template>')) {
    inTemplate = true
    continue
  }
  if (line.includes('</template>')) {
    inTemplate = false
    break
  }

  if (!inTemplate) continue

  // 统计当前行的 div 标签（排除自闭合）
  const openMatches = line.match(/<div(?:\s[^>]*)?>(?![\s\S]*\/>)/g)
  const closeMatches = line.match(/<\/div>/g)

  const openDivs = openMatches ? openMatches.length : 0
  const closeDivs = closeMatches ? closeMatches.length : 0

  depth += openDivs
  depth -= closeDivs

  // 如果闭合后深度为负，说明这行有多余的闭标签
  if (depth < 0) {
    console.log(`第 ${lineNum} 行有多余的 </div>: ${line.trim()}`)
    linesToRemove.push(i)
    depth = 0 // 重置
  }
}

// 删除多余的 </div> 行（只包含 </div> 和空格的行）
if (linesToRemove.length > 0) {
  const fixed = lines.filter((line, i) => {
    if (linesToRemove.includes(i) && line.trim() === '</div>') {
      console.log(`删除第 ${i + 1} 行: ${line}`)
      return false
    }
    return true
  })

  fs.writeFileSync('src/views/ApiKeysView.vue', fixed.join('\n'), 'utf8')
  console.log(`\n已删除 ${linesToRemove.length} 个多余的 </div> 标签`)
} else {
  console.log('没有发现多余的 </div> 标签')
}
