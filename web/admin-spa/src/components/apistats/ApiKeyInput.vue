<template>
 <div>
 <!-- 标题区域 -->
 <div>
 <h2>
 
 使用统计查询
 </h2>
 <p>查询您的 API Key 使用情况和统计数据</p>
 </div>

 <!-- 输入区域 -->
 <div>
 <!-- 控制栏 -->
 <div>
 <!-- API Key 标签 -->
 <label>
 
 {{ multiKeyMode ? '输入您的 API Keys（每行一个或用逗号分隔）' : '输入您的 API Key' }}
 </label>

 <!-- 模式切换和查询按钮组 -->
 <div>
 <!-- 模式切换 -->
 <div
 >
 <button
 title="单一模式"
 @click="multiKeyMode = false"
 >
 
 <span>单一</span>
 </button>
 <button
 title="聚合模式"
 @click="multiKeyMode = true"
 >
 
 <span>聚合</span>
 <span
 v-if="multiKeyMode && parsedApiKeys.length > 0"
 >
 {{ parsedApiKeys.length }}
 </span>
 </button>
 </div>
 </div>
 </div>

 <div>
 <!-- API Key 输入 -->
 <div>
 <!-- 单 Key 模式输入框 -->
 <input
 v-if="!multiKeyMode"
 v-model="apiKey"
 :disabled="loading"
 placeholder="请输入您的 API Key (cr_...)"
 type="password"
 @keyup.enter="queryStats"
 />

 <!-- 多 Key 模式输入框 -->
 <div v-else>
 <textarea
 v-model="apiKey"
 :disabled="loading"
 placeholder="请输入您的 API Keys，支持以下格式：&#10;cr_xxx&#10;cr_yyy&#10;或&#10;cr_xxx, cr_yyy"
 rows="4"
 @keyup.ctrl.enter="queryStats"
 />
 <button
 v-if="apiKey && !loading"
 title="清空输入"
 @click="clearInput"
 >
 
 </button>
 </div>
 </div>

 <!-- 查询按钮 -->
 <div>
 <button
 :disabled="loading || !hasValidInput"
 @click="queryStats"
 >

 {{ loading ? '查询中...' : '查询统计' }}
 </button>
 </div>
 </div>

 <!-- 安全提示 -->
 <div>
 
 {{
 multiKeyMode
 ? '您的 API Keys 仅用于查询统计数据，不会被存储。聚合模式下部分个体化信息将不显示。'
 : '您的 API Key 仅用于查询自己的统计数据，不会被存储或用于其他用途'
 }}
 </div>

 <!-- 多 Key 模式额外提示 -->
 <div
 v-if="multiKeyMode"
 >
 
 <span>提示：最多支持同时查询 30 个 API Keys。使用 Ctrl+Enter 快速查询。</span>
 </div>
 </div>
 </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const { apiKey, loading, multiKeyMode } = storeToRefs(apiStatsStore)
const { queryStats, clearInput } = apiStatsStore

// 解析输入的 API Keys
const parsedApiKeys = computed(() => {
 if (!multiKeyMode.value || !apiKey.value) return []

 // 支持逗号和换行符分隔
 const keys = apiKey.value
 .split(/[,\n]+/)
 .map((key) => key.trim())
 .filter((key) => key.length > 0)

 // 去重并限制最多30个
 const uniqueKeys = [...new Set(keys)]
 return uniqueKeys.slice(0, 30)
})

// 判断是否有有效输入
const hasValidInput = computed(() => {
 if (multiKeyMode.value) {
 return parsedApiKeys.value.length > 0
 }
 return apiKey.value && apiKey.value.trim().length > 0
})
</script>

