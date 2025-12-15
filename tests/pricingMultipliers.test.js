// Mock logger to avoid console output during tests
jest.mock('../src/utils/logger', () => ({
  api: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  database: jest.fn(),
  security: jest.fn(),
  success: jest.fn()
}))

describe('Pricing multipliers', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete process.env.COST_MULTIPLIER
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('applies 0.71 multiplier to Codex series models', () => {
    const pricingService = require('../src/services/pricingService')
    expect(pricingService.getCostMultiplier('gpt-5')).toBeCloseTo(0.71, 10)
    expect(pricingService.getCostMultiplier('gpt-5.1-2025-11-13')).toBeCloseTo(0.71, 10)
  })

  it('applies Codex 0.71 after global multiplier', () => {
    process.env.COST_MULTIPLIER = '2'
    const pricingService = require('../src/services/pricingService')
    expect(pricingService.getCostMultiplier('gpt-5')).toBeCloseTo(1.42, 10)
  })

  it('CostCalculator legacy path includes Codex multiplier in costs', () => {
    process.env.COST_MULTIPLIER = '1'
    const pricingService = require('../src/services/pricingService')
    const CostCalculator = require('../src/utils/costCalculator')

    pricingService.pricingData = {
      'gpt-5': {
        input_cost_per_token: 0.000002, // $2 / 1M
        output_cost_per_token: 0.000004, // $4 / 1M
        cache_creation_input_token_cost: 0.000002,
        cache_read_input_token_cost: 0.0000002,
        litellm_provider: 'openai'
      }
    }

    const result = CostCalculator.calculateCost(
      { input_tokens: 1_000_000, output_tokens: 0 },
      'gpt-5'
    )
    expect(result.costMultiplier).toBeCloseTo(0.71, 10)
    expect(result.costs.total).toBeCloseTo(1.42, 10)
  })
})
