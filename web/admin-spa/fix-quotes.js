const fs = require('fs')
const path = './src/views/TutorialView.vue'

let content = fs.readFileSync(path, 'utf-8')

// 替换所有转义的双引号为单引号
content = content.replace(/\\"/g, "'")
// 替换所有三个反斜杠加引号为单引号
content = content.replace(/\\\\\\\"/g, "'")
// 替换双反斜杠加引号
content = content.replace(/\\\\\"/g, "'")

fs.writeFileSync(path, content)
console.log('Fixed quotes')
