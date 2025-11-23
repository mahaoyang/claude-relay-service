<template>
  <Teleport to="body">
    <div>
      <div>
        <div>
          <div>
            <div></div>
            <h3>续期 API Key</h3>
          </div>
          <button @click="$emit('close')"></button>
        </div>

        <div>
          <div>
            <div>
              <div></div>
              <div>
                <h4>API Key 信息</h4>
                <p>
                  {{ apiKey.name }}
                </p>
                <p>
                  当前过期时间：{{
                    apiKey.expiresAt ? formatExpireDate(apiKey.expiresAt) : '永不过期'
                  }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label>续期时长</label>
            <select v-model="form.renewDuration" @change="updateRenewExpireAt">
              <option value="7d">延长 7 天</option>
              <option value="30d">延长 30 天</option>
              <option value="90d">延长 90 天</option>
              <option value="180d">延长 180 天</option>
              <option value="365d">延长 365 天</option>
              <option value="custom">自定义日期</option>
              <option value="permanent">设为永不过期</option>
            </select>
            <div v-if="form.renewDuration === 'custom'">
              <input
                v-model="form.customExpireDate"
                :min="minDateTime"
                type="datetime-local"
                @change="updateCustomRenewExpireAt"
              />
            </div>
            <p v-if="form.newExpiresAt">新的过期时间：{{ formatExpireDate(form.newExpiresAt) }}</p>
          </div>
        </div>

        <div>
          <button type="button" @click="$emit('close')">取消</button>
          <button :disabled="loading || !form.renewDuration" type="button" @click="renewApiKey">
            <div v-if="loading" />

            {{ loading ? '续期中...' : '确认续期' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'

const props = defineProps({
  apiKey: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)

// 表单数据
const form = reactive({
  renewDuration: '30d',
  customExpireDate: '',
  newExpiresAt: null
})

// 计算最小日期时间
const minDateTime = computed(() => {
  const now = new Date()
  // 如果有当前过期时间且未过期，从当前过期时间开始
  if (props.apiKey.expiresAt && new Date(props.apiKey.expiresAt) > now) {
    return new Date(props.apiKey.expiresAt).toISOString().slice(0, 16)
  }
  // 否则从现在开始
  now.setMinutes(now.getMinutes() + 1)
  return now.toISOString().slice(0, 16)
})

// 格式化过期日期
const formatExpireDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 更新续期后的过期时间
const updateRenewExpireAt = () => {
  if (!form.renewDuration) {
    form.newExpiresAt = null
    return
  }

  if (form.renewDuration === 'permanent') {
    form.newExpiresAt = null
    return
  }

  if (form.renewDuration === 'custom') {
    return
  }

  // 计算新的过期时间
  const baseDate =
    props.apiKey.expiresAt && new Date(props.apiKey.expiresAt) > new Date()
      ? new Date(props.apiKey.expiresAt)
      : new Date()

  const duration = form.renewDuration
  const match = duration.match(/(\d+)([dhmy])/)

  if (match) {
    const [, value, unit] = match
    const num = parseInt(value)

    switch (unit) {
      case 'd':
        baseDate.setDate(baseDate.getDate() + num)
        break
      case 'h':
        baseDate.setHours(baseDate.getHours() + num)
        break
      case 'm':
        baseDate.setMonth(baseDate.getMonth() + num)
        break
      case 'y':
        baseDate.setFullYear(baseDate.getFullYear() + num)
        break
    }

    form.newExpiresAt = baseDate.toISOString()
  }
}

// 更新自定义续期时间
const updateCustomRenewExpireAt = () => {
  if (form.customExpireDate) {
    form.newExpiresAt = new Date(form.customExpireDate).toISOString()
  }
}

// 续期 API Key
const renewApiKey = async () => {
  loading.value = true

  try {
    const data = {
      expiresAt: form.renewDuration === 'permanent' ? null : form.newExpiresAt
    }

    const result = await apiClient.put(`/admin/api-keys/${props.apiKey.id}`, data)

    if (result.success) {
      showToast('API Key 续期成功', 'success')
      emit('success')
      emit('close')
    } else {
      showToast(result.message || '续期失败', 'error')
    }
  } catch (error) {
    showToast('续期失败', 'error')
  } finally {
    loading.value = false
  }
}

// 初始化
updateRenewExpireAt()
</script>
