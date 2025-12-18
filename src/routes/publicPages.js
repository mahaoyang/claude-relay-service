const express = require('express')
const path = require('path')
const fs = require('fs')
const logger = require('../utils/logger')

const router = express.Router()

// 静态资源目录
const publicPagesDir = path.join(__dirname, '../../web/public-pages')

// 提供静态资源（CSS, JS等）- 只对 /public-pages 路径生效，不影响其他路由
router.use('/public-pages/assets', express.static(path.join(publicPagesDir, 'assets')))

// 首页（根路径）
router.get('/', (req, res) => {
  const indexPath = path.join(publicPagesDir, 'index.html')

  if (fs.existsSync(indexPath)) {
    // SEO 优化：设置缓存策略
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📄 Serving Home page')
    return res.sendFile(indexPath)
  }

  logger.warn('❌ Home page not found at:', indexPath)
  res.status(404).send('Home page not found')
})

// 网关页面（隐藏入口）
router.get('/api-gateway', (req, res) => {
  const gatewayPath = path.join(publicPagesDir, 'api-gateway.html')

  if (fs.existsSync(gatewayPath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('🧩 Serving API Gateway page')
    return res.sendFile(gatewayPath)
  }

  logger.warn('❌ API Gateway page not found at:', gatewayPath)
  res.status(404).send('API Gateway page not found')
})

// 统计/额度查询页面（可公开）
router.get('/api-gateway-stats', (req, res) => {
  const statsPath = path.join(publicPagesDir, 'api-gateway-stats.html')

  if (fs.existsSync(statsPath)) {
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📊 Serving API Gateway Stats page')
    return res.sendFile(statsPath)
  }

  logger.warn('❌ API Gateway Stats page not found at:', statsPath)
  res.status(404).send('API Gateway Stats page not found')
})

// 使用文档页面（CLI）
router.get('/docs', (req, res) => {
  const docsPath = path.join(publicPagesDir, 'docs.html')

  if (fs.existsSync(docsPath)) {
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📚 Serving CLI Docs page')
    return res.sendFile(docsPath)
  }

  logger.warn('❌ Docs page not found at:', docsPath)
  res.status(404).send('Docs page not found')
})

// 价格页面
router.get('/price', (req, res) => {
  const pricePath = path.join(publicPagesDir, 'price.html')

  if (fs.existsSync(pricePath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('💳 Serving Price page')
    return res.sendFile(pricePath)
  }

  logger.warn('❌ Price page not found at:', pricePath)
  res.status(404).send('Price page not found')
})

// 网关文档页面（隐藏入口）
router.get('/api-gateway-docs', (req, res) => {
  const docsPath = path.join(publicPagesDir, 'api-gateway-docs.html')

  if (fs.existsSync(docsPath)) {
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('📚 Serving API Gateway Docs page')
    return res.sendFile(docsPath)
  }

  logger.warn('❌ API Gateway Docs page not found at:', docsPath)
  res.status(404).send('API Gateway Docs page not found')
})

// 关于页面
router.get('/about', (req, res) => {
  const aboutPath = path.join(publicPagesDir, 'about.html')

  if (fs.existsSync(aboutPath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    logger.info('👋 Serving About page')
    return res.sendFile(aboutPath)
  }

  logger.warn('❌ About page not found at:', aboutPath)
  res.status(404).send('About page not found')
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
