<template>
  <div v-if="show">
    <div>
      <div>
        <div>
          <h3>Change User Role</h3>
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

        <div v-if="user">
          <!-- User Info -->
          <div>
            <div>
              <div>
                <div>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p>
                  {{ user.displayName || user.username }}
                </p>
                <p>@{{ user.username }}</p>
                <div>
                  <span> Current: {{ user.role }} </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Role Selection -->
          <form @submit.prevent="handleSubmit">
            <div>
              <label> New Role </label>
              <div>
                <label>
                  <input v-model="selectedRole" :disabled="loading" type="radio" value="user" />
                  <div>
                    <div>User</div>
                    <div>Regular user with basic permissions</div>
                  </div>
                </label>
                <label>
                  <input v-model="selectedRole" :disabled="loading" type="radio" value="admin" />
                  <div>
                    <div>Administrator</div>
                    <div>Full access to manage users and system</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Warning for role changes -->
            <div v-if="selectedRole !== user.role">
              <div>
                <div>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clip-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      fill-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3>Role Change Warning</h3>
                  <div>
                    <p v-if="selectedRole === 'admin'">
                      Granting admin privileges will give this user full access to the system,
                      including the ability to manage other users and their API keys.
                    </p>
                    <p v-else>
                      Removing admin privileges will restrict this user to only managing their own
                      API keys and viewing their own usage statistics.
                    </p>
                  </div>
                </div>
              </div>
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
              <button :disabled="loading" type="button" @click="$emit('close')">Cancel</button>
              <button :disabled="loading || selectedRole === user.role" type="submit">
                <span v-if="loading">
                  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  Updating...
                </span>
                <span v-else>Update Role</span>
              </button>
            </div>
          </form>
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

const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const error = ref('')
const selectedRole = ref('')

const handleSubmit = async () => {
  if (!props.user || selectedRole.value === props.user.role) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.patch(`/users/${props.user.id}/role`, {
      role: selectedRole.value
    })

    if (response.success) {
      showToast(`User role updated to ${selectedRole.value}`, 'success')
      emit('updated')
    } else {
      error.value = response.message || 'Failed to update user role'
    }
  } catch (err) {
    console.error('Update user role error:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to update user role'
  } finally {
    loading.value = false
  }
}

// Reset form when modal is shown
watch([() => props.show, () => props.user], ([show, user]) => {
  if (show && user) {
    selectedRole.value = user.role
    error.value = ''
    loading.value = false
  }
})
</script>
