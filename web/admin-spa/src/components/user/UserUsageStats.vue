<template>
  <div>
    <div>
      <div>
        <h1>Usage Statistics</h1>
        <p>View your API usage statistics and costs</p>
      </div>
      <div>
        <select v-model="selectedPeriod" @change="loadUsageStats">
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
        </select>
      </div>
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

    <!-- Stats Cards -->
    <div v-else>
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
                <dt>Total Requests</dt>
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

    <!-- Daily Usage Chart -->
    <div v-if="!loading && usageStats">
      <div>
        <h3>Daily Usage Trend</h3>

        <!-- Placeholder for chart - you can integrate Chart.js or similar -->
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
            <p>Daily usage trends would be displayed here</p>
            <p>(Chart integration can be added with Chart.js, D3.js, or similar library)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Model Usage Breakdown -->
    <div v-if="!loading && usageStats && usageStats.modelStats?.length > 0">
      <div>
        <h3>Usage by Model</h3>
        <div>
          <div v-for="model in usageStats.modelStats" :key="model.name">
            <div>
              <div>
                <div></div>
              </div>
              <div>
                <p>{{ model.name }}</p>
              </div>
            </div>
            <div>
              <p>{{ formatNumber(model.requests) }} requests</p>
              <p>${{ model.cost.toFixed(4) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Usage Table -->
    <div v-if="!loading && userApiKeys.length > 0">
      <div>
        <h3>Usage by API Key</h3>
        <div>
          <table>
            <thead>
              <tr>
                <th scope="col">API Key</th>
                <th scope="col">Requests</th>
                <th scope="col">Input Tokens</th>
                <th scope="col">Output Tokens</th>
                <th scope="col">Cost</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apiKey in userApiKeys" :key="apiKey.id">
                <td>
                  <div>{{ apiKey.name }}</div>
                  <div>{{ apiKey.keyPreview }}</div>
                </td>
                <td>
                  {{ formatNumber(apiKey.usage?.requests || 0) }}
                </td>
                <td>
                  {{ formatNumber(apiKey.usage?.inputTokens || 0) }}
                </td>
                <td>
                  {{ formatNumber(apiKey.usage?.outputTokens || 0) }}
                </td>
                <td>${{ (apiKey.usage?.totalCost || 0).toFixed(4) }}</td>
                <td>
                  <span>
                    {{
                      apiKey.isDeleted === 'true' || apiKey.deletedAt
                        ? 'Deleted'
                        : apiKey.isActive
                          ? 'Active'
                          : 'Disabled'
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-if="!loading && (!usageStats || usageStats.totalRequests === 0)">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
      </svg>
      <h3>No usage data</h3>
      <p>
        You haven't made any API requests yet. Create an API key and start using the service to see
        usage statistics.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'

const userStore = useUserStore()

const loading = ref(true)
const selectedPeriod = ref('week')
const usageStats = ref(null)
const userApiKeys = ref([])

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const loadUsageStats = async () => {
  loading.value = true
  try {
    const [stats, apiKeys] = await Promise.all([
      userStore.getUserUsageStats({ period: selectedPeriod.value }),
      userStore.getUserApiKeys(true) // Include deleted keys
    ])

    usageStats.value = stats
    userApiKeys.value = apiKeys
  } catch (error) {
    console.error('Failed to load usage stats:', error)
    showToast('Failed to load usage statistics', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsageStats()
})
</script>
