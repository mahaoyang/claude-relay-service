<template>
 <div
 v-if="show"
 >
 <div
 >
 <div>
 <div>
 <h3>API Key Details</h3>
 <button @click="emit('close')">
 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M6 18L18 6M6 6l12 12"
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 />
 </svg>
 </button>
 </div>

 <div v-if="apiKey">
 <!-- API Key Name -->
 <div>
 <label>Name</label>
 <p>{{ apiKey.name }}</p>
 </div>

 <!-- Description -->
 <div v-if="apiKey.description">
 <label>Description</label>
 <p>{{ apiKey.description }}</p>
 </div>

 <!-- API Key -->
 <div>
 <label>API Key</label>
 <div>
 <div>
 <div v-if="showFullKey">
 <code>{{
 apiKey.key || 'Not available'
 }}</code>
 </div>
 <div v-else>
 <code>{{
 apiKey.keyPreview || 'cr_****'
 }}</code>
 </div>
 </div>
 <div>
 <button
 v-if="apiKey.key"
 @click="showFullKey = !showFullKey"
 >
 <svg
 v-if="showFullKey"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-1.122-2.122L12 12m-1.122-2.122l-4.243-4.242m6.879 6.878L15 15"
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 />
 </svg>
 <svg
 v-else
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 />
 <path
 d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 />
 </svg>
 {{ showFullKey ? 'Hide' : 'Show' }}
 </button>
 <button
 v-if="showFullKey && apiKey.key"
 @click="copyToClipboard(apiKey.key)"
 >
 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path
 d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 />
 </svg>
 Copy
 </button>
 </div>
 </div>
 <p v-if="!apiKey.key">
 Full API key is only shown when first created or regenerated
 </p>
 </div>

 <!-- Status -->
 <div>
 <label>Status</label>
 <div>
 <span
 >
 {{ apiKey.isActive ? 'Active' : 'Disabled' }}
 </span>
 </div>
 </div>

 <!-- Usage Stats -->
 <div v-if="apiKey.usage">
 <label>Usage Statistics</label>
 <div>
 <div>
 <span >Requests:</span>
 <span>{{ formatNumber(apiKey.usage.requests || 0) }}</span>
 </div>
 <div>
 <span >Input Tokens:</span>
 <span>{{
 formatNumber(apiKey.usage.inputTokens || 0)
 }}</span>
 </div>
 <div>
 <span >Output Tokens:</span>
 <span>{{
 formatNumber(apiKey.usage.outputTokens || 0)
 }}</span>
 </div>
 <div>
 <span >Total Cost:</span>
 <span
 >${{ (apiKey.usage.totalCost || 0).toFixed(4) }}</span
 >
 </div>
 </div>
 </div>

 <!-- Timestamps -->
 <div>
 <div>
 <span >Created:</span>
 <span >{{ formatDate(apiKey.createdAt) }}</span>
 </div>
 <div v-if="apiKey.lastUsedAt">
 <span >Last Used:</span>
 <span >{{ formatDate(apiKey.lastUsedAt) }}</span>
 </div>
 <div v-if="apiKey.expiresAt">
 <span >Expires:</span>
 <span
 >
 {{ formatDate(apiKey.expiresAt) }}
 </span>
 </div>
 </div>

 <div>
 <button
 @click="emit('close')"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from '@/utils/toast'

defineProps({
 show: {
 type: Boolean,
 default: false
 },
 apiKey: {
 type: Object,
 default: null
 }
})

const emit = defineEmits(['close'])

const showFullKey = ref(false)

const formatNumber = (num) => {
 if (num >= 1000000) {
 return (num / 1000000).toFixed(1) + 'M'
 } else if (num >= 1000) {
 return (num / 1000).toFixed(1) + 'K'
 }
 return num.toString()
}

const formatDate = (dateString) => {
 if (!dateString) return null
 return new Date(dateString).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })
}

const copyToClipboard = async (text) => {
 try {
 await navigator.clipboard.writeText(text)
 showToast('Copied to clipboard!', 'success')
 } catch (err) {
 console.error('Failed to copy:', err)
 showToast('Failed to copy to clipboard', 'error')
 }
}
</script>

