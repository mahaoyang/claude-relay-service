<template>
  <div v-if="show">
    <div>
      <div>
        <div>
          <div>
            <h3>Usage Statistics - {{ user?.displayName || user?.username }}</h3>
            <p>@{{ user?.username }} • {{ user?.role }}</p>
          </div>
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

        <!-- Period Selector -->
        <div>
          <select v-model="selectedPeriod" @change="loadUsageStats">
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
        </div>

        <!-- Loading State -->
        <div v-if="loading">
          <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            ></path>
          </svg>
          <p>Loading usage statistics...</p>
        </div>

        <!-- Stats Content -->
        <div v-else>
          <!-- Summary Cards -->
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <dl>
                      <dt>Requests</dt>
                      <dd>
                        {{ formatNumber(usageStats?.totalRequests || 0) }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div>
                <div>
                  <div>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <dl>
                      <dt>Input Tokens</dt>
                      <dd>
                        {{ formatNumber(usageStats?.totalInputTokens || 0) }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div>
                <div>
                  <div>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <dl>
                      <dt>Output Tokens</dt>
                      <dd>
                        {{ formatNumber(usageStats?.totalOutputTokens || 0) }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div>
                <div>
                  <div>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <dl>
                      <dt>Total Cost</dt>
                      <dd>${{ (usageStats?.totalCost || 0).toFixed(4) }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- User API Keys Table -->
          <div v-if="userDetails?.apiKeys?.length > 0">
            <div>
              <h4>API Keys Usage</h4>
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th scope="col">API Key</th>
                    <th scope="col">Status</th>
                    <th scope="col">Requests</th>
                    <th scope="col">Tokens</th>
                    <th scope="col">Cost</th>
                    <th scope="col">Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="apiKey in userDetails.apiKeys" :key="apiKey.id">
                    <td>
                      <div>{{ apiKey.name }}</div>
                      <div>{{ apiKey.keyPreview }}</div>
                    </td>
                    <td>
                      <span>
                        {{ apiKey.isActive ? 'Active' : 'Disabled' }}
                      </span>
                    </td>
                    <td>
                      {{ formatNumber(apiKey.usage?.requests || 0) }}
                    </td>
                    <td>
                      <div>In: {{ formatNumber(apiKey.usage?.inputTokens || 0) }}</div>
                      <div>Out: {{ formatNumber(apiKey.usage?.outputTokens || 0) }}</div>
                    </td>
                    <td>${{ (apiKey.usage?.totalCost || 0).toFixed(4) }}</td>
                    <td>
                      {{ apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : 'Never' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Chart Placeholder -->
          <div>
            <div>
              <h4>Usage Trend</h4>
            </div>
            <div>
              <div>
                <div>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                  <h3>Usage Chart</h3>
                  <p>Daily usage trends for {{ selectedPeriod }} period</p>
                  <p>(Chart integration can be added with Chart.js, D3.js, or similar library)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- No Data State -->
          <div v-if="usageStats && usageStats.totalRequests === 0">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
            <h3>No usage data</h3>
            <p>This user hasn't made any API requests in the selected period.</p>
          </div>
        </div>

        <div>
          <button @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const selectedPeriod = ref('week')
const usageStats = ref(null)
const userDetails = ref(null)

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

const loadUsageStats = async () => {
  if (!props.user) return

  loading.value = true
  try {
    const [statsResponse, userResponse] = await Promise.all([
      apiClient.get(`/users/${props.user.id}/usage-stats`, {
        params: { period: selectedPeriod.value }
      }),
      apiClient.get(`/users/${props.user.id}`)
    ])

    if (statsResponse.success) {
      usageStats.value = statsResponse.stats
    }

    if (userResponse.success) {
      userDetails.value = userResponse.user
    }
  } catch (error) {
    console.error('Failed to load user usage stats:', error)
    showToast('Failed to load usage statistics', 'error')
  } finally {
    loading.value = false
  }
}

// Watch for when modal is shown and user changes
watch([() => props.show, () => props.user], ([show, user]) => {
  if (show && user) {
    loadUsageStats()
  }
})
</script>
