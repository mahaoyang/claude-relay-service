/**
 * Admin Routes - Disguise settings per account
 * Low-intrusion: stored in a dedicated Redis Set, default enabled.
 */

const express = require('express')
const router = express.Router()

const { authenticateAdmin } = require('../../middleware/auth')
const disguiseSettingsService = require('../../services/disguiseSettingsService')

const SUPPORTED_PLATFORMS = new Set([
  'claude',
  'claude-console',
  'bedrock',
  'ccr',
  'openai',
  'openai-responses'
])

function normalizeBoolean(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true
  if (value === false || value === 'false' || value === 0 || value === '0') return false
  return null
}

router.get('/disguise-settings', authenticateAdmin, async (req, res) => {
  try {
    const disabled = await disguiseSettingsService.getDisabledMembers()
    return res.json({ success: true, data: { disabled: disabled || [] } })
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to load disguise settings', message: error.message })
  }
})

router.put('/disguise-settings/:platform/:accountId', authenticateAdmin, async (req, res) => {
  try {
    const { platform, accountId } = req.params
    const normalizedPlatform = (platform || '').toLowerCase()

    if (!SUPPORTED_PLATFORMS.has(normalizedPlatform)) {
      return res.status(400).json({ success: false, error: 'Unsupported platform' })
    }
    if (!accountId) {
      return res.status(400).json({ success: false, error: 'Missing accountId' })
    }

    const enabled = normalizeBoolean(req.body?.enabled)
    if (enabled === null) {
      return res.status(400).json({ success: false, error: 'Missing or invalid enabled flag' })
    }

    const nextEnabled = await disguiseSettingsService.setDisguiseEnabled(
      normalizedPlatform,
      accountId,
      enabled
    )
    return res.json({
      success: true,
      data: { platform: normalizedPlatform, accountId, enabled: nextEnabled }
    })
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to update disguise setting', message: error.message })
  }
})

router.put('/disguise-settings/:platform/:accountId/toggle', authenticateAdmin, async (req, res) => {
  try {
    const { platform, accountId } = req.params
    const normalizedPlatform = (platform || '').toLowerCase()

    if (!SUPPORTED_PLATFORMS.has(normalizedPlatform)) {
      return res.status(400).json({ success: false, error: 'Unsupported platform' })
    }
    if (!accountId) {
      return res.status(400).json({ success: false, error: 'Missing accountId' })
    }

    const enabled = await disguiseSettingsService.toggleDisguiseEnabled(normalizedPlatform, accountId)
    return res.json({
      success: true,
      data: { platform: normalizedPlatform, accountId, enabled }
    })
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: 'Failed to toggle disguise setting', message: error.message })
  }
})

module.exports = router
