const fs = require('fs')
const glob = require('glob')
const path = require('path')

console.log('修复边框清理脚本造成的残留问题...\n')

const vueFiles = glob.sync('src/**/*.vue', { cwd: __dirname })
let totalChanges = 0
let totalFiles = 0

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content
  let changes = 0

  // 1. 删除孤立的 `: { ... solid ... }`（border 对象定义）
  const borderObjPattern = /^ *: \{[^}]*solid[^}]*\}/gm
  const borderMatches = content.match(borderObjPattern)
  if (borderMatches) {
    content = content.replace(borderObjPattern, '')
    changes += borderMatches.length
  }

  // 2. 删除残留的 CSS 属性（以 `: value` 开头）
  content = content.replace(/^ *: [0-9].*solid.*;?$/gm, '')

  // 3. 删除不完整的 CSS 属性
  content = content.replace(/^ *-collapse:.*;?$/gm, '')
  content = content.replace(/^ *-radius:.*;?$/gm, '')
  content = content.replace(/^ *-top:.*;?$/gm, '')
  content = content.replace(/^ *-bottom:.*;?$/gm, '')
  content = content.replace(/^ *-left:.*;?$/gm, '')
  content = content.replace(/^ *-right:.*;?$/gm, '')
  content = content.replace(/^ *-width:.*;?$/gm, '')
  content = content.replace(/^ *-style:.*;?$/gm, '')
  content = content.replace(/^ *-color:.*;?$/gm, '')

  // 4. 删除残留的 border Tailwind 类（被破坏的）
  content = content.replace(/ -b-\d+/g, '')
  content = content.replace(/ -t-\d+/g, '')
  content = content.replace(/ -r-\d+/g, '')
  content = content.replace(/ -l-\d+/g, '')
  content = content.replace(/ -x-\d+/g, '')
  content = content.replace(/ -y-\d+/g, '')
  content = content.replace(/ -\w+-\d+/g, '') // -blue-500, -gray-300 等
  content = content.replace(/ -transparent/g, '')
  content = content.replace(/ -inset-[\d.]+/g, '')

  // 5. 删除孤立的 focus
  content = content.replace(/ focus focus/g, '')
  content = content.replace(/ focus;/g, ';')
  content = content.replace(/ focus$/gm, '')

  // 6. 清理空行（多于 2 个连续空行）
  content = content.replace(/\n\n\n+/g, '\n\n')

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`✓ ${filePath}`)
    totalFiles++
    return true
  }

  return false
}

vueFiles.forEach((file) => {
  fixFile(file)
})

console.log(`\n完成！共修复 ${totalFiles} 个文件`)
