<template>
  <div>
    <!-- 导航栏 -->
    <nav>
      <div>
        <div>
          <div>
            <div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
              <span>Claude Relay</span>
            </div>
            <div>
              <div>
                <button @click="handleTabChange('overview')">Overview</button>
                <button @click="handleTabChange('api-keys')">API Keys</button>
                <button @click="handleTabChange('usage')">Usage Stats</button>
                <button @click="handleTabChange('tutorial')">Tutorial</button>
              </div>
            </div>
          </div>
          <div>
            <div>
              Welcome, <span>{{ userStore.userName }}</span>
            </div>

            <!-- 主题切换按钮 -->
            <ThemeToggle mode="icon" />

            <button @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main>
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome to your Claude Relay dashboard</p>
        </div>

        <!-- Stats Cards -->
        <div>
          <div>
            <div>
              <div>
                <div>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h-6m6 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                </div>
                <div>
                  <dl>
                    <dt>Active API Keys</dt>
                    <dd>
                      {{ apiKeysStats.active }}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                </div>
                <div>
                  <dl>
                    <dt>Deleted API Keys</dt>
                    <dd>
                      {{ apiKeysStats.deleted }}
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
                      {{ formatNumber(userProfile?.totalUsage?.requests || 0) }}
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
                      {{ formatNumber(userProfile?.totalUsage?.inputTokens || 0) }}
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
                    <dd>${{ (userProfile?.totalUsage?.totalCost || 0).toFixed(4) }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Info -->
        <div>
          <div>
            <h3>Account Information</h3>
            <div>
              <dl>
                <div>
                  <dt>Username</dt>
                  <dd>
                    {{ userProfile?.username }}
                  </dd>
                </div>
                <div>
                  <dt>Display Name</dt>
                  <dd>
                    {{ userProfile?.displayName || 'N/A' }}
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    {{ userProfile?.email || 'N/A' }}
                  </dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>
                    <span>
                      {{ userProfile?.role || 'user' }}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Member Since</dt>
                  <dd>
                    {{ formatDate(userProfile?.createdAt) }}
                  </dd>
                </div>
                <div>
                  <dt>Last Login</dt>
                  <dd>
                    {{ formatDate(userProfile?.lastLoginAt) || 'N/A' }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- API Keys Tab -->
      <div v-else-if="activeTab === 'api-keys'">
        <UserApiKeysManager />
      </div>

      <!-- Usage Stats Tab -->
      <div v-else-if="activeTab === 'usage'">
        <UserUsageStats />
      </div>

      <!-- Tutorial Tab -->
      <div v-else-if="activeTab === 'tutorial'">
        <TutorialView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { showToast } from '@/utils/toast'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import UserApiKeysManager from '@/components/user/UserApiKeysManager.vue'
import UserUsageStats from '@/components/user/UserUsageStats.vue'
import TutorialView from '@/views/TutorialView.vue'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const activeTab = ref('overview')
const userProfile = ref(null)
const apiKeysStats = ref({ active: 0, deleted: 0 })

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

const handleTabChange = (tab) => {
  activeTab.value = tab
  // Refresh API keys stats when switching to overview tab
  if (tab === 'overview') {
    loadApiKeysStats()
  }
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    showToast('Logged out successfully', 'success')
    router.push('/user-login')
  } catch (error) {
    showToast('Logout failed', 'error')
  }
}

const loadUserProfile = async () => {
  try {
    userProfile.value = await userStore.getUserProfile()
  } catch (error) {
    console.error('Failed to load user profile:', error)
    showToast('Failed to load user profile', 'error')
  }
}

const loadApiKeysStats = async () => {
  try {
    const allApiKeys = await userStore.getUserApiKeys(true) // Include deleted keys
    console.log('All API Keys received:', allApiKeys)

    const activeKeys = allApiKeys.filter(
      (key) => !(key.isDeleted === 'true' || key.deletedAt) && key.isActive
    )
    const deletedKeys = allApiKeys.filter((key) => key.isDeleted === 'true' || key.deletedAt)

    console.log('Active keys:', activeKeys)
    console.log('Deleted keys:', deletedKeys)
    console.log('Active count:', activeKeys.length)
    console.log('Deleted count:', deletedKeys.length)

    apiKeysStats.value = { active: activeKeys.length, deleted: deletedKeys.length }
  } catch (error) {
    console.error('Failed to load API keys stats:', error)
    apiKeysStats.value = { active: 0, deleted: 0 }
  }
}

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  loadUserProfile()
  loadApiKeysStats()
})
</script>
