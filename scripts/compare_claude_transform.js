#!/usr/bin/env node

/**
 * Helper script for test parity between the original Node relay and the new Rust port.
 * Reads a JSON payload from stdin:
 * {
 *   "body": { ... Anthropic request body ... },
 *   "headers": { ... incoming headers ... }
 * }
 *
 * Outputs JSON containing the processed body and filtered headers as produced by
 * claudeRelayService.
 */

const fs = require('fs')
const path = require('path')

// Silence default console output from the main service logger to keep JSON clean
console.log = () => {}
console.warn = () => {}
const originalStdoutWrite = process.stdout.write.bind(process.stdout)
process.stdout.write = () => true

function ensureConfig() {
  const configDir = path.join(__dirname, '..', 'config')
  const configFile = path.join(configDir, 'config.js')
  if (fs.existsSync(configFile)) {
    return
  }
  const exampleFile = path.join(configDir, 'config.example.js')
  fs.copyFileSync(exampleFile, configFile)
}

function readInput() {
  const raw = fs.readFileSync(0, 'utf8')
  if (!raw.trim()) {
    throw new Error('Empty stdin payload')
  }
  return JSON.parse(raw)
}

function main() {
  ensureConfig()
  const input = readInput()
  const service = require('../src/services/claudeRelayService')

  if (typeof process.env.CRS_TEST_SYSTEM_PROMPT === 'string') {
    service.systemPrompt = process.env.CRS_TEST_SYSTEM_PROMPT
  }

  const processed = service._processRequestBody(JSON.parse(JSON.stringify(input.body)), null)
  const filteredHeaders = service._filterClientHeaders(input.headers || {})

  const output = {
    body: processed,
    headers: filteredHeaders
  }
  process.stdout.write = originalStdoutWrite
  process.stdout.write(JSON.stringify(output))
  process.exit(0)
}

main()
