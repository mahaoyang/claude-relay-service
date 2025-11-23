<template>
  <div>
    <!-- 限制配置 / 聚合模式提示 -->
    <div>
      <h3>
        {{ multiKeyMode ? '限制配置（聚合查询模式）' : '限制配置' }}
      </h3>

      <!-- 多 Key 模式下的聚合统计信息 -->
      <div v-if="multiKeyMode && aggregatedStats">
        <!-- API Keys 概况 -->
        <div>
          <div>
            <span> API Keys 概况 </span>
            <span> {{ aggregatedStats.activeKeys }}/{{ aggregatedStats.totalKeys }} </span>
          </div>
          <div>
            <div>
              <div>
                {{ aggregatedStats.totalKeys }}
              </div>
              <div>总计 Keys</div>
            </div>
            <div>
              <div>
                {{ aggregatedStats.activeKeys }}
              </div>
              <div>激活 Keys</div>
            </div>
          </div>
        </div>

        <!-- 聚合统计数据 -->
        <div>
          <div>
            <span>聚合统计摘要</span>
          </div>
          <div>
            <div>
              <span> 总请求数 </span>
              <span>
                {{ formatNumber(aggregatedStats.usage.requests) }}
              </span>
            </div>
            <div>
              <span> 总 Tokens </span>
              <span>
                {{ formatNumber(aggregatedStats.usage.allTokens) }}
              </span>
            </div>
            <div>
              <span> 总费用 </span>
              <span>
                {{ aggregatedStats.usage.formattedCost }}
              </span>
            </div>
          </div>
        </div>

        <!-- 无效 Keys 提示 -->
        <div v-if="invalidKeys && invalidKeys.length > 0">
          <span> {{ invalidKeys.length }} 个无效的 API Key </span>
        </div>

        <!-- 提示信息 -->
        <div>每个 API Key 有独立的限制设置，聚合模式下不显示单个限制配置</div>
      </div>

      <!-- 仅在单 Key 模式下显示限制配置 -->
      <div v-if="!multiKeyMode">
        <!-- 每日费用限制 -->
        <div>
          <div>
            <span>每日费用限制</span>
            <span>
              <span v-if="statsData.limits.dailyCostLimit > 0">
                ${{ statsData.limits.currentDailyCost.toFixed(4) }} / ${{
                  statsData.limits.dailyCostLimit.toFixed(2)
                }}
              </span>
              <span v-else> ${{ statsData.limits.currentDailyCost.toFixed(4) }} / </span>
            </span>
          </div>
          <div v-if="statsData.limits.dailyCostLimit > 0">
            <div />
          </div>
          <div v-else>
            <div />
          </div>
        </div>

        <!-- 总费用限制 -->
        <div>
          <div>
            <span>总费用限制</span>
            <span>
              <span v-if="statsData.limits.totalCostLimit > 0">
                ${{ statsData.limits.currentTotalCost.toFixed(4) }} / ${{
                  statsData.limits.totalCostLimit.toFixed(2)
                }}
              </span>
              <span v-else> ${{ statsData.limits.currentTotalCost.toFixed(4) }} / </span>
            </span>
          </div>
          <div v-if="statsData.limits.totalCostLimit > 0">
            <div />
          </div>
          <div v-else>
            <div />
          </div>
        </div>

        <!-- Opus 模型周费用限制 -->
        <div v-if="statsData.limits.weeklyOpusCostLimit > 0">
          <div>
            <span>Opus 模型周费用限制</span>
            <span>
              ${{ statsData.limits.weeklyOpusCost.toFixed(4) }} / ${{
                statsData.limits.weeklyOpusCostLimit.toFixed(2)
              }}
            </span>
          </div>
          <div>
            <div />
          </div>
        </div>

        <!-- 时间窗口限制 -->
        <div
          v-if="
            statsData.limits.rateLimitWindow > 0 &&
            (statsData.limits.rateLimitRequests > 0 ||
              statsData.limits.tokenLimit > 0 ||
              statsData.limits.rateLimitCost > 0)
          "
        >
          <WindowCountdown
            :cost-limit="statsData.limits.rateLimitCost"
            :current-cost="statsData.limits.currentWindowCost"
            :current-requests="statsData.limits.currentWindowRequests"
            :current-tokens="statsData.limits.currentWindowTokens"
            label="时间窗口限制"
            :rate-limit-window="statsData.limits.rateLimitWindow"
            :request-limit="statsData.limits.rateLimitRequests"
            :show-progress="true"
            :show-tooltip="true"
            :token-limit="statsData.limits.tokenLimit"
            :window-end-time="statsData.limits.windowEndTime"
            :window-remaining-seconds="statsData.limits.windowRemainingSeconds"
            :window-start-time="statsData.limits.windowStartTime"
          />

          <div>
            <span v-if="statsData.limits.rateLimitCost > 0">
              请求次数和费用限制为"或"的关系，任一达到限制即触发限流
            </span>
            <span v-else-if="statsData.limits.tokenLimit > 0">
              请求次数和Token使用量为"或"的关系，任一达到限制即触发限流
            </span>
            <span v-else> 仅限制请求次数 </span>
          </div>
        </div>

        <!-- 其他限制信息 -->
        <div>
          <div>
            <span>并发限制</span>
            <span>
              <span v-if="statsData.limits.concurrencyLimit > 0">
                {{ statsData.limits.concurrencyLimit }}
              </span>
              <span v-else> </span>
            </span>
          </div>
          <div>
            <span>模型限制</span>
            <span>
              <span v-if="hasModelRestrictions">
                限制 {{ statsData.restrictions.restrictedModels.length }} 个模型
              </span>
              <span v-else> 允许所有模型 </span>
            </span>
          </div>
          <div>
            <div>
              <span>客户端限制</span>
              <span>
                <span v-if="hasClientRestrictions">
                  限 {{ statsData.restrictions.allowedClients.length }} 种客户端使用
                </span>
                <span v-else> 允许所有客户端 </span>
              </span>
            </div>
            <div v-if="hasClientRestrictions">
              <span v-for="client in statsData.restrictions.allowedClients" :key="client">
                {{ client }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细限制信息 -->
    <div v-if="hasModelRestrictions">
      <h3>详细限制信息</h3>

      <div>
        <h4>受限模型列表</h4>
        <div>
          <div v-for="model in statsData.restrictions.restrictedModels" :key="model">
            <span>{{ model }}</span>
          </div>
        </div>
        <p>此 API Key 不能访问以上列出的模型</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import WindowCountdown from '@/components/apikeys/WindowCountdown.vue'

const apiStatsStore = useApiStatsStore()
const { statsData, multiKeyMode, aggregatedStats, invalidKeys } = storeToRefs(apiStatsStore)

const hasModelRestrictions = computed(() => {
  const restriction = statsData.value?.restrictions
  if (!restriction) return false
  return (
    restriction.enableModelRestriction === true &&
    Array.isArray(restriction.restrictedModels) &&
    restriction.restrictedModels.length > 0
  )
})

const hasClientRestrictions = computed(() => {
  const restriction = statsData.value?.restrictions
  if (!restriction) return false
  return (
    restriction.enableClientRestriction === true &&
    Array.isArray(restriction.allowedClients) &&
    restriction.allowedClients.length > 0
  )
})

// 获取每日费用进度
const getDailyCostProgress = () => {
  if (!statsData.value.limits.dailyCostLimit || statsData.value.limits.dailyCostLimit === 0)
    return 0
  const percentage =
    (statsData.value.limits.currentDailyCost / statsData.value.limits.dailyCostLimit) * 100
  return Math.min(percentage, 100)
}

// eslint-disable-next-line no-unused-vars
const getDailyCostProgressColor = () => {
  const progress = getDailyCostProgress()
  if (progress >= 100) return ''
  if (progress >= 80) return ''
  return ''
}

// eslint-disable-next-line no-unused-vars
const getTotalCostProgress = () => {
  if (!statsData.value.limits.totalCostLimit || statsData.value.limits.totalCostLimit === 0)
    return 0
  const percentage =
    (statsData.value.limits.currentTotalCost / statsData.value.limits.totalCostLimit) * 100
  return Math.min(percentage, 100)
}

// eslint-disable-next-line no-unused-vars
const getTotalCostProgressColor = () => {
  const progress = getTotalCostProgress()
  if (progress >= 100) return ''
  if (progress >= 80) return ''
  return ''
}

// eslint-disable-next-line no-unused-vars
const getOpusWeeklyCostProgress = () => {
  if (
    !statsData.value.limits.weeklyOpusCostLimit ||
    statsData.value.limits.weeklyOpusCostLimit === 0
  )
    return 0
  const percentage =
    (statsData.value.limits.weeklyOpusCost / statsData.value.limits.weeklyOpusCostLimit) * 100
  return Math.min(percentage, 100)
}

// eslint-disable-next-line no-unused-vars
const getOpusWeeklyCostProgressColor = () => {
  const progress = getOpusWeeklyCostProgress()
  if (progress >= 100) return ''
  if (progress >= 80) return ''
  return '' // 使用紫色表示Opus模型
}

// 格式化数字
const formatNumber = (num) => {
  if (typeof num !== 'number') {
    num = parseInt(num) || 0
  }

  if (num === 0) return '0'

  // 大数字使用简化格式
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString()
  }
}
</script>
