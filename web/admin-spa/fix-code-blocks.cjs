const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/TutorialView.vue');
let content = fs.readFileSync(filePath, 'utf-8');

// 识别代码块模式：连续的 <div>...</div> 被另一个 div 包裹
// 查找所有包含注释或命令的代码行

// 1. 为代码块容器添加样式 - 查找包含代码行的父div
content = content.replace(
  /(<div>)\s*(<div># )/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-gray-300"># '
);

content = content.replace(
  /(<div>)\s*(<div>node --version<\/div>)/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-green-400">node --version</div>'
);

content = content.replace(
  /(<div>)\s*(<div>npm --version<\/div>)/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-green-400">npm --version</div>'
);

content = content.replace(
  /(<div>)\s*(<div>claude --version<\/div>)/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-green-400">claude --version</div>'
);

content = content.replace(
  /(<div>)\s*(<div>export )/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-cyan-400">export '
);

content = content.replace(
  /(<div>)\s*(<div>echo )/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-cyan-400">echo '
);

content = content.replace(
  /(<div>)\s*(<div>set )/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-cyan-400">set '
);

content = content.replace(
  /(<div>)\s*(<div>sudo )/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-yellow-400">sudo '
);

content = content.replace(
  /(<div>)\s*(<div>choco install)/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-green-400">choco install'
);

content = content.replace(
  /(<div>)\s*(<div>scoop install)/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-green-400">scoop install'
);

content = content.replace(
  /(<div>)\s*(<div>npm install)/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-green-400">npm install'
);

// 2. 为代码块中的单行添加样式（如果还没有class）
content = content.replace(
  /<div>(npm run [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-green-400">$1</div>'
);

content = content.replace(
  /<div>(source [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-cyan-400">$1</div>'
);

// 3. 为 JSON/配置文件块添加样式
content = content.replace(
  /(<div>)\s*(<div>\{<\/div>)/g,
  '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">\n            <div class="font-mono text-sm text-yellow-300">{'
);

content = content.replace(
  /<div>(\s*"[^"]+": [^<]+)<\/div>/g,
  '<div class="font-mono text-sm text-blue-300">$1</div>'
);

content = content.replace(
  /<div>(\s*\})<\/div>/g,
  '<div class="font-mono text-sm text-yellow-300">$1</div>'
);

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Code block styles fixed!');
