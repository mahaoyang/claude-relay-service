<template>
  <Teleport to="body">
    <div>
      <div>
        <div>
          <div>
            <div></div>
            <h3>批量编辑 API Keys ({{ selectedCount }} 个)</h3>
          </div>
          <button @click="$emit('close')"></button>
        </div>

        <form @submit.prevent="batchUpdateApiKeys">
          <!-- 说明文本 -->
          <div>
            <div>
              <div>
                <p>批量编辑说明</p>
                <p>
                  以下设置将应用到所选的 {{ selectedCount }} 个 API
                  Key。只有填写或修改的字段才会被更新，空白字段将保持原值不变。
                </p>
              </div>
            </div>
          </div>

          <!-- 标签编辑 -->
          <div>
            <label> 标签 (批量操作) </label>
            <div>
              <!-- 标签操作模式选择 -->
              <div>
                <label>
                  <input v-model="tagOperation" type="radio" value="replace" />
                  <span>替换标签</span>
                </label>
                <label>
                  <input v-model="tagOperation" type="radio" value="add" />
                  <span>添加标签</span>
                </label>
                <label>
                  <input v-model="tagOperation" type="radio" value="remove" />
                  <span>移除标签</span>
                </label>
                <label>
                  <input v-model="tagOperation" type="radio" value="none" />
                  <span>不修改标签</span>
                </label>
              </div>

              <!-- 标签编辑区域 -->
              <div v-if="tagOperation !== 'none'">
                <!-- 已选择的标签 -->
                <div v-if="form.tags.length > 0">
                  <div>
                    {{
                      tagOperation === 'replace'
                        ? '新标签列表:'
                        : tagOperation === 'add'
                          ? '要添加的标签:'
                          : '要移除的标签:'
                    }}
                  </div>
                  <div>
                    <span v-for="(tag, index) in form.tags" :key="'selected-' + index">
                      {{ tag }}
                      <button type="button" @click="removeTag(index)"></button>
                    </span>
                  </div>
                </div>

                <!-- 可选择的已有标签 -->
                <div v-if="unselectedTags.length > 0">
                  <div>点击选择已有标签:</div>
                  <div>
                    <button
                      v-for="tag in unselectedTags"
                      :key="'available-' + tag"
                      type="button"
                      @click="selectTag(tag)"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </div>

                <!-- 创建新标签 -->
                <div>
                  <div>创建新标签:</div>
                  <div>
                    <input
                      v-model="newTag"
                      placeholder="输入新标签名称"
                      type="text"
                      @keypress.enter.prevent="addTag"
                    />
                    <button type="button" @click="addTag"></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 速率限制设置 -->
          <div>
            <div>
              <div></div>
              <h4>速率限制设置</h4>
            </div>

            <div>
              <div>
                <div>
                  <label> 时间窗口 (分钟) </label>
                  <input
                    v-model="form.rateLimitWindow"
                    min="1"
                    placeholder="不修改"
                    type="number"
                  />
                </div>

                <div>
                  <label>请求次数限制</label>
                  <input
                    v-model="form.rateLimitRequests"
                    min="1"
                    placeholder="不修改"
                    type="number"
                  />
                </div>

                <div>
                  <label>费用限制 (美元)</label>
                  <input
                    v-model="form.rateLimitCost"
                    min="0"
                    placeholder="不修改"
                    step="0.01"
                    type="number"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 每日费用限制 -->
          <div>
            <label> 每日费用限制 (美元) </label>
            <input
              v-model="form.dailyCostLimit"
              min="0"
              placeholder="不修改 (0 表示无限制)"
              step="0.01"
              type="number"
            />
          </div>

          <div>
            <label> 总费用限制 (美元) </label>
            <input
              v-model="form.totalCostLimit"
              min="0"
              placeholder="不修改 (0 表示无限制)"
              step="0.01"
              type="number"
            />
          </div>

          <!-- Opus 模型周费用限制 -->
          <div>
            <label> Opus 模型周费用限制 (美元) </label>
            <input
              v-model="form.weeklyOpusCostLimit"
              min="0"
              placeholder="不修改 (0 表示无限制)"
              step="0.01"
              type="number"
            />
            <p>设置 Opus 模型的周费用限制（周一到周日），仅限 Claude 官方账户</p>
          </div>

          <!-- 并发限制 -->
          <div>
            <label>并发限制</label>
            <input
              v-model="form.concurrencyLimit"
              min="0"
              placeholder="不修改 (0 表示无限制)"
              type="number"
            />
          </div>

          <!-- 激活状态 -->
          <div>
            <div>
              <label>激活状态</label>
              <div>
                <label>
                  <input v-model="form.isActive" type="radio" :value="true" />
                  <span>激活</span>
                </label>
                <label>
                  <input v-model="form.isActive" type="radio" :value="false" />
                  <span>禁用</span>
                </label>
                <label>
                  <input v-model="form.isActive" type="radio" :value="null" />
                  <span>不修改</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 服务权限 -->
          <div>
            <label>服务权限</label>
            <div>
              <label>
                <input v-model="form.permissions" type="radio" value="" />
                <span>不修改</span>
              </label>
              <label>
                <input v-model="form.permissions" type="radio" value="all" />
                <span>全部服务</span>
              </label>
              <label>
                <input v-model="form.permissions" type="radio" value="claude" />
                <span>仅 Claude</span>
              </label>
              <label>
                <input v-model="form.permissions" type="radio" value="gemini" />
                <span>仅 Gemini</span>
              </label>
              <label>
                <input v-model="form.permissions" type="radio" value="openai" />
                <span>仅 OpenAI</span>
              </label>
              <label>
                <input v-model="form.permissions" type="radio" value="droid" />
                <span>仅 Droid</span>
              </label>
            </div>
          </div>

          <!-- 专属账号绑定 -->
          <div>
            <div>
              <label>专属账号绑定</label>
              <button
                :disabled="accountsLoading"
                title="刷新账号列表"
                type="button"
                @click="refreshAccounts"
              >
                <i />
                <span>{{ accountsLoading ? '刷新中...' : '刷新账号' }}</span>
              </button>
            </div>
            <div>
              <div>
                <label>Claude 专属账号</label>
                <AccountSelector
                  v-model="claudeAccountSelectorValue"
                  :accounts="localAccounts.claude"
                  default-option-text="请选择Claude账号"
                  :disabled="!isServiceSelectable('claude')"
                  :groups="localAccounts.claudeGroups"
                  placeholder="请选择Claude账号"
                  platform="claude"
                  :special-options="accountSpecialOptions"
                />
              </div>
              <div>
                <label>Gemini 专属账号</label>
                <AccountSelector
                  v-model="geminiAccountSelectorValue"
                  :accounts="localAccounts.gemini"
                  default-option-text="请选择Gemini账号"
                  :disabled="!isServiceSelectable('gemini')"
                  :groups="localAccounts.geminiGroups"
                  placeholder="请选择Gemini账号"
                  platform="gemini"
                  :special-options="accountSpecialOptions"
                />
              </div>
              <div>
                <label>OpenAI 专属账号</label>
                <AccountSelector
                  v-model="openaiAccountSelectorValue"
                  :accounts="localAccounts.openai"
                  default-option-text="请选择OpenAI账号"
                  :disabled="!isServiceSelectable('openai')"
                  :groups="localAccounts.openaiGroups"
                  placeholder="请选择OpenAI账号"
                  platform="openai"
                  :special-options="accountSpecialOptions"
                />
              </div>
              <div>
                <label>Bedrock 专属账号</label>
                <AccountSelector
                  v-model="bedrockAccountSelectorValue"
                  :accounts="localAccounts.bedrock"
                  default-option-text="请选择Bedrock账号"
                  :disabled="!isServiceSelectable('openai')"
                  :groups="[]"
                  placeholder="请选择Bedrock账号"
                  platform="bedrock"
                  :special-options="accountSpecialOptions"
                />
              </div>
              <div>
                <label>Droid 专属账号</label>
                <AccountSelector
                  v-model="droidAccountSelectorValue"
                  :accounts="localAccounts.droid"
                  default-option-text="请选择Droid账号"
                  :disabled="!isServiceSelectable('droid')"
                  :groups="localAccounts.droidGroups"
                  placeholder="请选择Droid账号"
                  platform="droid"
                  :special-options="accountSpecialOptions"
                />
              </div>
            </div>
          </div>

          <div>
            <button type="button" @click="$emit('close')">取消</button>
            <button :disabled="loading" type="submit">
              <div v-if="loading" />

              {{ loading ? '保存中...' : '批量保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast } from '@/utils/toast'
import { useApiKeysStore } from '@/stores/apiKeys'
import { apiClient } from '@/config/api'
import AccountSelector from '@/components/common/AccountSelector.vue'

const props = defineProps({
  selectedKeys: {
    type: Array,
    required: true
  },
  accounts: {
    type: Object,
    default: () => ({
      claude: [],
      gemini: [],
      openai: [],
      openaiResponses: [],
      bedrock: [],
      droid: [],
      claudeGroups: [],
      geminiGroups: [],
      openaiGroups: [],
      droidGroups: []
    })
  }
})

const emit = defineEmits(['close', 'success'])

const apiKeysStore = useApiKeysStore()
const loading = ref(false)
const accountsLoading = ref(false)
const localAccounts = ref({
  claude: [],
  gemini: [],
  openai: [],
  bedrock: [],
  droid: [],
  claudeGroups: [],
  geminiGroups: [],
  openaiGroups: [],
  droidGroups: []
})

// 标签相关
const newTag = ref('')
const availableTags = ref([])
const tagOperation = ref('none') // 'replace', 'add', 'remove', 'none'

const selectedCount = computed(() => props.selectedKeys.length)

// 计算未选择的标签
const unselectedTags = computed(() => {
  return availableTags.value.filter((tag) => !form.tags.includes(tag))
})

// 表单数据
const form = reactive({
  rateLimitCost: '', // 费用限制替代token限制
  rateLimitWindow: '',
  rateLimitRequests: '',
  concurrencyLimit: '',
  dailyCostLimit: '',
  totalCostLimit: '',
  weeklyOpusCostLimit: '', // 新增Opus周费用限制
  permissions: '', // 空字符串表示不修改
  claudeAccountId: '',
  geminiAccountId: '',
  openaiAccountId: '',
  bedrockAccountId: '',
  droidAccountId: '',
  tags: [],
  isActive: null // null表示不修改
})

const UNCHANGED_OPTION_VALUE = '__KEEP_ORIGINAL__'

const accountSpecialOptions = [
  { value: UNCHANGED_OPTION_VALUE, label: '不修改' },
  { value: 'SHARED_POOL', label: '使用共享账号池' }
]

const createAccountSelectorModel = (field) =>
  computed({
    get: () => (form[field] === '' ? UNCHANGED_OPTION_VALUE : form[field]),
    set: (value) => {
      if (!value || value === UNCHANGED_OPTION_VALUE) {
        form[field] = ''
      } else {
        form[field] = value
      }
    }
  })

const claudeAccountSelectorValue = createAccountSelectorModel('claudeAccountId')
const geminiAccountSelectorValue = createAccountSelectorModel('geminiAccountId')
const openaiAccountSelectorValue = createAccountSelectorModel('openaiAccountId')
const bedrockAccountSelectorValue = createAccountSelectorModel('bedrockAccountId')
const droidAccountSelectorValue = createAccountSelectorModel('droidAccountId')

const isServiceSelectable = (service) => {
  if (!form.permissions) return true
  if (form.permissions === 'all') return true
  return form.permissions === service
}

// 标签管理方法
const addTag = () => {
  if (newTag.value && newTag.value.trim()) {
    const tag = newTag.value.trim()
    if (!form.tags.includes(tag)) {
      form.tags.push(tag)
    }
    newTag.value = ''
  }
}

const selectTag = (tag) => {
  if (!form.tags.includes(tag)) {
    form.tags.push(tag)
  }
}

const removeTag = (index) => {
  form.tags.splice(index, 1)
}

// 刷新账号列表
const refreshAccounts = async () => {
  accountsLoading.value = true
  try {
    const [
      claudeData,
      claudeConsoleData,
      geminiData,
      geminiApiData,
      openaiData,
      openaiResponsesData,
      bedrockData,
      droidData,
      groupsData
    ] = await Promise.all([
      apiClient.get('/admin/claude-accounts'),
      apiClient.get('/admin/claude-console-accounts'),
      apiClient.get('/admin/gemini-accounts'),
      apiClient.get('/admin/gemini-api-accounts'), // 获取 Gemini-API 账号
      apiClient.get('/admin/openai-accounts'),
      apiClient.get('/admin/openai-responses-accounts'),
      apiClient.get('/admin/bedrock-accounts'),
      apiClient.get('/admin/droid-accounts'),
      apiClient.get('/admin/account-groups')
    ])

    // 合并Claude OAuth账户和Claude Console账户
    const claudeAccounts = []

    if (claudeData.success) {
      claudeData.data?.forEach((account) => {
        claudeAccounts.push({
          ...account,
          platform: 'claude-oauth',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    if (claudeConsoleData.success) {
      claudeConsoleData.data?.forEach((account) => {
        claudeAccounts.push({
          ...account,
          platform: 'claude-console',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    localAccounts.value.claude = claudeAccounts

    // 合并 Gemini OAuth 和 Gemini API 账号
    const geminiAccounts = []

    if (geminiData.success) {
      ;(geminiData.data || []).forEach((account) => {
        geminiAccounts.push({
          ...account,
          platform: 'gemini',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    if (geminiApiData.success) {
      ;(geminiApiData.data || []).forEach((account) => {
        geminiAccounts.push({
          ...account,
          platform: 'gemini-api',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    localAccounts.value.gemini = geminiAccounts

    const openaiAccounts = []

    if (openaiData.success) {
      ;(openaiData.data || []).forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    if (openaiResponsesData.success) {
      ;(openaiResponsesData.data || []).forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai-responses',
          isDedicated: account.accountType === 'dedicated'
        })
      })
    }

    localAccounts.value.openai = openaiAccounts

    if (bedrockData.success) {
      localAccounts.value.bedrock = (bedrockData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    if (droidData.success) {
      localAccounts.value.droid = (droidData.data || []).map((account) => ({
        ...account,
        platform: 'droid',
        isDedicated: account.accountType === 'dedicated'
      }))
    }

    // 处理分组数据
    if (groupsData.success) {
      const allGroups = groupsData.data || []
      localAccounts.value.claudeGroups = allGroups.filter((g) => g.platform === 'claude')
      localAccounts.value.geminiGroups = allGroups.filter((g) => g.platform === 'gemini')
      localAccounts.value.openaiGroups = allGroups.filter((g) => g.platform === 'openai')
      localAccounts.value.droidGroups = allGroups.filter((g) => g.platform === 'droid')
    }

    showToast('账号列表已刷新', 'success')
  } catch (error) {
    showToast('刷新账号列表失败', 'error')
  } finally {
    accountsLoading.value = false
  }
}

// 批量更新API Keys
const batchUpdateApiKeys = async () => {
  loading.value = true

  try {
    // 准备提交的数据
    const updates = {}

    // 只有非空值才添加到更新对象中
    if (form.rateLimitCost !== '' && form.rateLimitCost !== null) {
      updates.rateLimitCost = parseFloat(form.rateLimitCost)
    }
    if (form.rateLimitWindow !== '' && form.rateLimitWindow !== null) {
      updates.rateLimitWindow = parseInt(form.rateLimitWindow)
    }
    if (form.rateLimitRequests !== '' && form.rateLimitRequests !== null) {
      updates.rateLimitRequests = parseInt(form.rateLimitRequests)
    }
    if (form.concurrencyLimit !== '' && form.concurrencyLimit !== null) {
      updates.concurrencyLimit = parseInt(form.concurrencyLimit)
    }
    if (form.dailyCostLimit !== '' && form.dailyCostLimit !== null) {
      updates.dailyCostLimit = parseFloat(form.dailyCostLimit)
    }
    if (form.totalCostLimit !== '' && form.totalCostLimit !== null) {
      updates.totalCostLimit = parseFloat(form.totalCostLimit)
    }
    if (form.weeklyOpusCostLimit !== '' && form.weeklyOpusCostLimit !== null) {
      updates.weeklyOpusCostLimit = parseFloat(form.weeklyOpusCostLimit)
    }

    // 权限设置
    if (form.permissions !== '') {
      updates.permissions = form.permissions
    }

    // 账户绑定
    if (form.claudeAccountId !== '') {
      if (form.claudeAccountId === 'SHARED_POOL') {
        updates.claudeAccountId = null
        updates.claudeConsoleAccountId = null
      } else if (form.claudeAccountId.startsWith('console:')) {
        updates.claudeConsoleAccountId = form.claudeAccountId.substring(8)
        updates.claudeAccountId = null
      } else if (!form.claudeAccountId.startsWith('group:')) {
        updates.claudeAccountId = form.claudeAccountId
        updates.claudeConsoleAccountId = null
      } else {
        updates.claudeAccountId = form.claudeAccountId
        updates.claudeConsoleAccountId = null
      }
    }

    if (form.geminiAccountId !== '') {
      if (form.geminiAccountId === 'SHARED_POOL') {
        updates.geminiAccountId = null
      } else {
        updates.geminiAccountId = form.geminiAccountId
      }
    }

    if (form.openaiAccountId !== '') {
      if (form.openaiAccountId === 'SHARED_POOL') {
        updates.openaiAccountId = null
      } else {
        updates.openaiAccountId = form.openaiAccountId
      }
    }

    if (form.bedrockAccountId !== '') {
      if (form.bedrockAccountId === 'SHARED_POOL') {
        updates.bedrockAccountId = null
      } else {
        updates.bedrockAccountId = form.bedrockAccountId
      }
    }

    if (form.droidAccountId !== '') {
      if (form.droidAccountId === 'SHARED_POOL') {
        updates.droidAccountId = null
      } else {
        updates.droidAccountId = form.droidAccountId
      }
    }

    // 激活状态
    if (form.isActive !== null) {
      updates.isActive = form.isActive
    }

    // 标签处理
    if (tagOperation.value !== 'none') {
      updates.tags = form.tags
      updates.tagOperation = tagOperation.value
    }

    const result = await apiClient.put('/admin/api-keys/batch', {
      keyIds: props.selectedKeys,
      updates
    })

    if (result.success) {
      const { successCount, failedCount, errors } = result.data

      if (successCount > 0) {
        showToast(`成功批量编辑 ${successCount} 个 API Keys`, 'success')

        if (failedCount > 0) {
          const errorMessages = errors.map((e) => `${e.keyId}: ${e.error}`).join('\n')
          showToast(`${failedCount} 个编辑失败:\n${errorMessages}`, 'warning')
        }
      } else {
        showToast('所有 API Keys 编辑失败', 'error')
      }

      emit('success')
      emit('close')
    } else {
      showToast(result.message || '批量编辑失败', 'error')
    }
  } catch (error) {
    showToast('批量编辑失败', 'error')
    console.error('批量编辑 API Keys 失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 加载已存在的标签
  availableTags.value = await apiKeysStore.fetchTags()

  // 初始化账号数据
  if (props.accounts) {
    // props.accounts.gemini 已经包含了 OAuth 和 API 两种类型的账号（父组件已合并）
    // 保留原有的 platform 属性，不要覆盖
    const geminiAccounts = (props.accounts.gemini || []).map((account) => ({
      ...account,
      platform: account.platform || 'gemini' // 保留原有 platform，只在没有时设默认值
    }))

    // props.accounts.openai 只包含 openai 类型，openaiResponses 需要单独处理
    const openaiAccounts = []
    if (props.accounts.openai) {
      props.accounts.openai.forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: account.platform || 'openai'
        })
      })
    }
    if (props.accounts.openaiResponses) {
      props.accounts.openaiResponses.forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: account.platform || 'openai-responses'
        })
      })
    }

    localAccounts.value = {
      claude: props.accounts.claude || [],
      gemini: geminiAccounts,
      openai: openaiAccounts,
      bedrock: props.accounts.bedrock || [],
      droid: (props.accounts.droid || []).map((account) => ({
        ...account,
        platform: account.platform || 'droid'
      })),
      claudeGroups: props.accounts.claudeGroups || [],
      geminiGroups: props.accounts.geminiGroups || [],
      openaiGroups: props.accounts.openaiGroups || [],
      droidGroups: props.accounts.droidGroups || []
    }
  }
})
</script>
