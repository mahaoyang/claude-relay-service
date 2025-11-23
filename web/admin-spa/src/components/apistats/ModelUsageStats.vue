<template>
  <div>
    <div>
      <h3>
        <span> 模型使用统计 </span>
        <span>({{ statsPeriod === 'daily' ? '今日' : '本月' }})</span>
      </h3>
    </div>

    <!-- 模型统计加载状态 -->
    <div v-if="modelStatsLoading">
      <p>加载模型统计数据中...</p>
    </div>

    <!-- 模型统计数据 -->
    <div v-else-if="modelStats.length > 0">
      <div v-for="(model, index) in modelStats" :key="index">
        <div>
          <div>
            <h4>
              {{ model.model }}
            </h4>
            <p>{{ model.requests }} 次请求</p>
          </div>
          <div>
            <div>
              {{ model.formatted?.total || '$0.000000' }}
            </div>
            <div>总费用</div>
          </div>
        </div>

        <div>
          <div>
            <div>输入 Token</div>
            <div>
              {{ formatNumber(model.inputTokens) }}
            </div>
          </div>
          <div>
            <div>输出 Token</div>
            <div>
              {{ formatNumber(model.outputTokens) }}
            </div>
          </div>
          <div>
            <div>缓存创建</div>
            <div>
              {{ formatNumber(model.cacheCreateTokens) }}
            </div>
          </div>
          <div>
            <div>缓存读取</div>
            <div>
              {{ formatNumber(model.cacheReadTokens) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无模型数据 -->
    <div v-else>
      <p>暂无{{ statsPeriod === 'daily' ? '今日' : '本月' }}模型使用数据</p>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const { statsPeriod, modelStats, modelStatsLoading } = storeToRefs(apiStatsStore)

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
