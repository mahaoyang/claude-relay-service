const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/TutorialView.vue');
let content = fs.readFileSync(filePath, 'utf-8');

// 更安全的方法：只为代码块中的 div 添加样式，不破坏结构
// 1. 为包含代码行的 div 添加样式（不是容器）
content = content.replace(
  /<div>(# [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-gray-400">$1</div>'
);

content = content.replace(
  /<div>(npm [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-green-400">$1</div>'
);

content = content.replace(
  /<div>(node [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-green-400">$1</div>'
);

content = content.replace(
  /<div>(claude [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-green-400">$1</div>'
);

content = content.replace(
  /<div>(choco [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-green-400">$1</div>'
);

content = content.replace(
  /<div>(scoop [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-green-400">$1</div>'
);

content = content.replace(
  /<div>(export [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-cyan-400">$1</div>'
);

content = content.replace(
  /<div>(echo [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-cyan-400">$1</div>'
);

content = content.replace(
  /<div>(source [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-cyan-400">$1</div>'
);

content = content.replace(
  /<div>(set [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-cyan-400">$1</div>'
);

content = content.replace(
  /<div>(sudo [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-yellow-400">$1</div>'
);

// JSON 代码
content = content.replace(
  /<div>(\s*"[^"]+": [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-blue-300">$1</div>'
);

content = content.replace(
  /<div>(\s*\{)<\/div>/g,
  '<div class="font-mono text-sm text-yellow-300">$1</div>'
);

content = content.replace(
  /<div>(\s*\})<\/div>/g,
  '<div class="font-mono text-sm text-yellow-300">$1</div>'
);

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Code block text styles fixed safely!');
