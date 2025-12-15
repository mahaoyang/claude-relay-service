const express = require('express')
const path = require('path')
const fs = require('fs')
const logger = require('../utils/logger')

const router = express.Router()

// 静态资源目录
const publicPagesDir = path.join(__dirname, '../../web/public-pages')

// 提供静态资源（CSS, JS等）- 只对 /public-pages 路径生效，不影响其他路由
router.use('/public-pages/assets', express.static(path.join(publicPagesDir, 'assets')))

// Hero 页面（根路径）
router.get('/', (req, res) => {
  const indexPath = path.join(publicPagesDir, 'index.html')

  if (fs.existsSync(indexPath)) {
    // SEO 优化：设置缓存策略
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📄 Serving Hero page')
    return res.sendFile(indexPath)
  }

  logger.warn('❌ Hero page not found at:', indexPath)
  res.status(404).send('Hero page not found')
})

// 统计页面
router.get('/stats', (req, res) => {
  const statsPath = path.join(publicPagesDir, 'stats.html')

  if (fs.existsSync(statsPath)) {
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📊 Serving Stats page')
    return res.sendFile(statsPath)
  }

  logger.warn('❌ Stats page not found at:', statsPath)
  res.status(404).send('Stats page not found')
})

// 使用文档页面
router.get('/docs', (req, res) => {
  const docsPath = path.join(publicPagesDir, 'docs.html')

  if (fs.existsSync(docsPath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📚 Serving Docs page')
    return res.sendFile(docsPath)
  }

  logger.warn('❌ Docs page not found at:', docsPath)
  res.status(404).send('Docs page not found')
})

// 隐私协议页面
router.get('/privacy', (req, res) => {
  const privacyPath = path.join(publicPagesDir, 'privacy.html')

  if (fs.existsSync(privacyPath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('🔐 Serving Privacy page')
    return res.sendFile(privacyPath)
  }

  logger.warn('❌ Privacy page not found at:', privacyPath)
  res.status(404).send('Privacy page not found')
})

// 服务协议页面
router.get('/terms', (req, res) => {
  const termsPath = path.join(publicPagesDir, 'terms.html')

  if (fs.existsSync(termsPath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📜 Serving Terms page')
    return res.sendFile(termsPath)
  }

  logger.warn('❌ Terms page not found at:', termsPath)
  res.status(404).send('Terms page not found')
})

module.exports = router
