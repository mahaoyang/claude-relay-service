const redis = require('../models/redis')

const DISGUISE_DISABLED_SET_KEY = 'disguise:disabled_accounts'

function normalizePlatform(platform) {
  return (platform || '').toString().trim().toLowerCase()
}

function buildMember(platform, accountId) {
  const normalizedPlatform = normalizePlatform(platform)
  const normalizedAccountId = (accountId || '').toString().trim()
  return `${normalizedPlatform}:${normalizedAccountId}`
}

class DisguiseSettingsService {
  async getDisabledMembers() {
    const client = redis.getClientSafe()
    return client.smembers(DISGUISE_DISABLED_SET_KEY)
  }

  async isDisguiseEnabled(platform, accountId) {
    const member = buildMember(platform, accountId)
    if (!member || member === ':') {
      return true
    }
    const client = redis.getClientSafe()
    const isDisabled = await client.sismember(DISGUISE_DISABLED_SET_KEY, member)
    return !isDisabled
  }

  async setDisguiseEnabled(platform, accountId, enabled) {
    const member = buildMember(platform, accountId)
    if (!member || member === ':') {
      return true
    }
    const client = redis.getClientSafe()
    if (enabled) {
      await client.srem(DISGUISE_DISABLED_SET_KEY, member)
      return true
    }
    await client.sadd(DISGUISE_DISABLED_SET_KEY, member)
    return false
  }

  async toggleDisguiseEnabled(platform, accountId) {
    const member = buildMember(platform, accountId)
    if (!member || member === ':') {
      return true
    }
    const client = redis.getClientSafe()
    const isDisabled = await client.sismember(DISGUISE_DISABLED_SET_KEY, member)
    const nextEnabled = !!isDisabled
    if (nextEnabled) {
      await client.srem(DISGUISE_DISABLED_SET_KEY, member)
    } else {
      await client.sadd(DISGUISE_DISABLED_SET_KEY, member)
    }
    return nextEnabled
  }
}

module.exports = new DisguiseSettingsService()
