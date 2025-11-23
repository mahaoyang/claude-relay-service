const fs = require('fs')
const glob = require('glob')
const path = require('path')

// Fix broken @apply directives by removing orphaned prefixes
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let originalContent = content
  let changes = 0

  // Remove orphaned prefixes like "focus:", "hover:", "dark:" at end of @apply
  // Pattern: @apply ... focus: ; or @apply ... hover: focus:;
  const patterns = [
    // Remove isolated prefixes at end
    /(@apply[^;]*?)\s+(?:focus:|hover:|dark:|sm:|md:|lg:|xl:|2xl:)\s*(?:(?:focus:|hover:|dark:|sm:|md:|lg:|xl:|2xl:)\s*)*;/g,
    // Remove broken @apply with only prefixes
    /@apply\s+(?:(?:focus:|hover:|dark:|sm:|md:|lg:|xl:|2xl:)\s*)+;/g,
    // Remove empty @apply
    /@apply\s*;/g,
    // Remove isolated prefixes in the middle
    /(@apply[^;]*?)\s+(?:focus:|hover:|dark:|sm:|md:|lg:|xl:|2xl:)\s+(\w)/g,
  ]

  // First pass: remove trailing orphaned prefixes
  content = content.replace(
    /(@apply[^;]*?)(\s+(?:(?:focus:|hover:|dark:|sm:|md:|lg:|xl:|2xl:)(?:\S*)?\s*)+);/g,
    (match, applyPart, prefixPart) => {
      // Check if prefix part contains valid classes (more than just prefix)
      const validClasses = prefixPart.match(/(?:focus:|hover:|dark:|sm:|md:|lg:|xl:|2xl:)(\S+)/g)
      if (!validClasses || validClasses.every(c => c.match(/^(focus:|hover:|dark:|sm:|md:|lg:|xl:|2xl:)$/))) {
        changes++
        return applyPart.trim() ? applyPart.trim() + ';' : ''
      }
      return match
    }
  )

  // Clean up @apply with only whitespace
  content = content.replace(/@apply\s+;/g, () => {
    changes++
    return ''
  })

  // Clean up lines with only @apply and nothing else
  content = content.replace(/^\s*@apply\s*;\s*$/gm, () => {
    changes++
    return ''
  })

  // Remove lines that are just empty CSS rules
  content = content.replace(/^(\s*)\.[^{]+\{\s*\}\s*$/gm, '')

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content)
    return changes
  }
  return 0
}

const files = glob.sync('src/**/*.vue', { cwd: __dirname })
let total = 0
for (const file of files) {
  const fullPath = path.join(__dirname, file)
  const changes = fixFile(fullPath)
  if (changes > 0) {
    console.log(`${file}: ${changes} fixes`)
    total += changes
  }
}
console.log(`\nTotal: ${total} fixes`)
