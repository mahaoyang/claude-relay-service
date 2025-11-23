const fs = require('fs')
const path = require('path')

const uiDir = path.join(__dirname, 'src/components/ui')

// More aggressive color class patterns
const colorPatterns = [
  // Text colors
  /\btext-gray-\d+\b/g,
  /\btext-blue-\d+\b/g,
  /\btext-teal-\d+\b/g,
  /\btext-green-\d+\b/g,
  /\btext-red-\d+\b/g,
  /\btext-yellow-\d+\b/g,
  /\btext-white\b/g,

  // Background colors
  /\bbg-gray-\d+\b/g,
  /\bbg-blue-\d+\b/g,
  /\bbg-teal-\d+\b/g,
  /\bbg-green-\d+\b/g,
  /\bbg-red-\d+\b/g,
  /\bbg-yellow-\d+\b/g,
  /\bbg-white\b/g,

  // Border colors
  /\bborder-gray-\d+\b/g,
  /\bborder-blue-\d+\b/g,
  /\bborder-teal-\d+\b/g,
  /\bborder-green-\d+\b/g,
  /\bborder-red-\d+\b/g,
  /\bborder-yellow-\d+\b/g,

  // Ring colors
  /\bring-gray-\d+\b/g,
  /\bring-blue-\d+\b/g,
  /\bring-teal-\d+\b/g,
  /\bring-green-\d+\b/g,
  /\bring-red-\d+\b/g,

  // Border-l colors (for Alert)
  /\bborder-l-\d+\s+border-[a-z]+-\d+\b/g,
]

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  // Apply all color patterns
  colorPatterns.forEach(pattern => {
    content = content.replace(pattern, '')
  })

  // Clean up extra spaces
  content = content.replace(/\s{2,}/g, ' ')
  content = content.replace(/\s+'/g, "'")
  content = content.replace(/'\s+/g, "'")
  content = content.replace(/\s+"/g, '"')
  content = content.replace(/"\s+/g, '"')
  content = content.replace(/\(\s+'/g, "('")
  content = content.replace(/'\s+\)/g, "')")

  // Clean empty strings in cn() calls
  content = content.replace(/cn\(\s*['"][\s]*['"]\s*\)/g, 'cn()')
  content = content.replace(/cn\(\s*['"][\s]*['"],\s*/g, 'cn(')
  content = content.replace(/,\s*['"][\s]*['"]\s*\)/g, ')')
  content = content.replace(/,\s*['"][\s]*['"],/g, ',')

  if (content !== original) {
    fs.writeFileSync(filePath, content)
    return true
  }
  return false
}

// Process all .vue files in ui directory
const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.vue'))
let changedCount = 0

files.forEach(file => {
  const filePath = path.join(uiDir, file)
  if (cleanFile(filePath)) {
    console.log(`✓ Cleaned ${file}`)
    changedCount++
  }
})

console.log(`\nCleaned ${changedCount} UI component files`)
