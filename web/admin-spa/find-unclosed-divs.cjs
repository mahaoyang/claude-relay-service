const fs = require('fs')

const content = fs.readFileSync('src/views/DashboardView.vue', 'utf8')
const lines = content.split('\n')

let depth = 0
let inTemplate = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const lineNum = i + 1

  if (line.includes('<template>')) {
    inTemplate = true
    continue
  }
  if (line.includes('</template>')) {
    console.log('Template ends at depth:', depth)
    if (depth !== 0) {
      console.log('UNBALANCED! Missing', depth, 'closing tags')
    }
    break
  }

  if (!inTemplate) continue

  const openMatches = line.match(/<div(?:\s[^/>]*)?>/g)
  const closeMatches = line.match(/<\/div>/g)
  const openCount = openMatches ? openMatches.length : 0
  const closeCount = closeMatches ? closeMatches.length : 0

  const prevDepth = depth
  depth += openCount
  depth -= closeCount

  if (openCount > 0 || closeCount > 0) {
    const indicator = depth > prevDepth ? 'OPEN' : depth < prevDepth ? 'CLOSE' : 'SAME'
    console.log('Line', lineNum, ':', prevDepth, '->', depth, indicator, line.trim().substring(0, 60))
  }

  if (depth < 0) {
    console.log('ERROR: Extra closing tags at line', lineNum)
    depth = 0
  }
}

console.log('\nFinal result: need to add', depth, 'closing tags')
