<template>
 <div
 v-if="show"
 >
 <div
 >
 <div>
 <div>
 <h3>Create New API Key</h3>
 <button @click="$emit('close')">
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

 <form @submit.prevent="handleSubmit">
 <div>
 <label for="name"> Name * </label>
 <input
 id="name"
 v-model="form.name"
 :disabled="loading"
 placeholder="Enter API key name"
 required
 type="text"
 />
 </div>

 <div>
 <label for="description">
 Description
 </label>
 <textarea
 id="description"
 v-model="form.description"
 :disabled="loading"
 placeholder="Optional description"
 rows="3"
 ></textarea>
 </div>

 <div v-if="error">
 <div>
 <div>
 <svg fill="currentColor" viewBox="0 0 20 20">
 <path
 clip-rule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
 fill-rule="evenodd"
 />
 </svg>
 </div>
 <div>
 <p>{{ error }}</p>
 </div>
 </div>
 </div>

 <div>
 <button
 :disabled="loading"
 type="button"
 @click="$emit('close')"
 >
 Cancel
 </button>
 <button
 :disabled="loading || !form.name.trim()"
 type="submit"
 >
 <span v-if="loading">
 <svg
 fill="none"
 viewBox="0 0 24 24"
 xmlns="http://www.w3.org/2000/svg"
 >
 <circle
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 stroke-width="4"
 ></circle>
 <path
 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
 fill="currentColor"
 ></path>
 </svg>
 Creating...
 </span>
 <span v-else>Create API Key</span>
 </button>
 </div>
 </form>

 <!-- Success Modal for showing the new API key -->
 <div v-if="newApiKey">
 <div>
 <div>
 <svg fill="currentColor" viewBox="0 0 20 20">
 <path
 clip-rule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
 fill-rule="evenodd"
 />
 </svg>
 </div>
 <div>
 <h4>API Key Created Successfully!</h4>
 <div>
 <p>
 <strong>Important:</strong> Copy your API key now. You won't be able to see it
 again!
 </p>
 <div>
 <div>
 <code>{{
 newApiKey.key
 }}</code>
 <button
 @click="copyToClipboard(newApiKey.key)"
 >
 <svg
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
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
 </div>
 <div>
 <button
 @click="handleClose"
 >
 Done
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'

const props = defineProps({
 show: {
 type: Boolean,
 default: false
 }
})

const emit = defineEmits(['close', 'created'])

const userStore = useUserStore()

const loading = ref(false)
const error = ref('')
const newApiKey = ref(null)

const form = reactive({
 name: '',
 description: ''
})

const resetForm = () => {
 form.name = ''
 form.description = ''
 error.value = ''
 newApiKey.value = null
}

const handleSubmit = async () => {
 if (!form.name.trim()) {
 error.value = 'API key name is required'
 return
 }

 loading.value = true
 error.value = ''

 try {
 const apiKeyData = {
 name: form.name.trim(),
 description: form.description.trim() || undefined
 }

 const result = await userStore.createApiKey(apiKeyData)

 if (result.success) {
 newApiKey.value = result.apiKey
 showToast('API key created successfully!', 'success')
 } else {
 error.value = result.message || 'Failed to create API key'
 }
 } catch (err) {
 console.error('Create API key error:', err)
 error.value = err.response?.data?.message || err.message || 'Failed to create API key'
 } finally {
 loading.value = false
 }
}

const copyToClipboard = async (text) => {
 try {
 await navigator.clipboard.writeText(text)
 showToast('API key copied to clipboard!', 'success')
 } catch (err) {
 console.error('Failed to copy:', err)
 showToast('Failed to copy to clipboard', 'error')
 }
}

const handleClose = () => {
 resetForm()
 emit('created')
 emit('close')
}

// Reset form when modal is shown
watch(
 () => props.show,
 (newValue) => {
 if (newValue) {
 resetForm()
 }
 }
)
</script>

