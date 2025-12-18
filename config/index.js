// 智能配置加载器
// 生产环境使用 config.example.js，开发环境优先使用 config.js

const fs = require('fs')
const path = require('path')

const configPath = path.join(__dirname, 'config.js')
const exampleConfigPath = path.join(__dirname, 'config.example.js')

let config

// 如果 config.js 存在，优先使用（开发环境）
if (fs.existsSync(configPath)) {
  config = require('./config.js')
} else {
  // 否则使用 config.example.js（生产环境/Vercel部署）
  config = require('./config.example.js')
}

module.exports = config
