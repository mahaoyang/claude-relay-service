<template>
  <Teleport to="body">
    <div>
      <div>
        <div>
          <div>
            <div></div>
            <h3>创建新的 API Key</h3>
          </div>
          <button @click="$emit('close')"></button>
        </div>

        <form @submit.prevent="createApiKey">
          <!-- 创建类型选择 -->
          <div>
            <div>
              <label>创建类型</label>
              <div>
                <label>
                  <input v-model="form.createType" type="radio" value="single" />
                  <span> 单个创建 </span>
                </label>
                <label>
                  <input v-model="form.createType" type="radio" value="batch" />
                  <span> 批量创建 </span>
                </label>
              </div>
            </div>

            <!-- 批量创建数量输入 -->
            <div v-if="form.createType === 'batch'">
              <div>
                <div>
                  <label>创建数量</label>
                  <div>
                    <input
                      v-model.number="form.batchCount"
                      max="500"
                      min="2"
                      placeholder="输入数量 (2-500)"
                      required
                      type="number"
                    />
                    <div>最大支持 500 个</div>
                  </div>
                </div>
              </div>
              <p>
                <span
                  >批量创建时，每个 Key 的名称会自动添加序号后缀，例如：{{
                    form.name || 'MyKey'
                  }}_1, {{ form.name || 'MyKey' }}_2 ...</span
                >
              </p>
            </div>
          </div>

          <div>
            <label>名称 <span>*</span></label>
            <div>
              <input
                v-model="form.name"
                :placeholder="
                  form.createType === 'batch'
                    ? '输入基础名称（将自动添加序号）'
                    : '为您的 API Key 取一个名称'
                "
                required
                type="text"
                @input="errors.name = ''"
              />
            </div>
            <p v-if="errors.name">
              {{ errors.name }}
            </p>
          </div>

          <!-- 标签 -->
          <div>
            <label>标签</label>
            <div>
              <!-- 已选择的标签 -->
              <div v-if="form.tags.length > 0">
                <div>已选择的标签:</div>
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

              <p>用于标记不同团队或用途，方便筛选管理</p>
            </div>
          </div>

          <!-- 速率限制设置 -->
          <div>
            <div>
              <div></div>
              <h4>速率限制设置 (可选)</h4>
            </div>

            <div>
              <div>
                <div>
                  <label>时间窗口 (分钟)</label>
                  <input
                    v-model="form.rateLimitWindow"
                    min="1"
                    placeholder="无限制"
                    type="number"
                  />
                  <p>时间段单位</p>
                </div>

                <div>
                  <label>请求次数限制</label>
                  <input
                    v-model="form.rateLimitRequests"
                    min="1"
                    placeholder="无限制"
                    type="number"
                  />
                  <p>窗口内最大请求</p>
                </div>

                <div>
                  <label>费用限制 (美元)</label>
                  <input
                    v-model="form.rateLimitCost"
                    min="0"
                    placeholder="无限制"
                    step="0.01"
                    type="number"
                  />
                  <p>窗口内最大费用</p>
                </div>
              </div>

              <!-- 示例说明 -->
              <div>
                <h5>💡 使用示例</h5>
                <div>
                  <div>
                    <strong>示例1:</strong> 时间窗口=60，请求次数=1000 → 每60分钟最多1000次请求
                  </div>
                  <div><strong>示例2:</strong> 时间窗口=1，费用=0.1 → 每分钟最多$0.1费用</div>
                  <div>
                    <strong>示例3:</strong> 窗口=30，请求=50，费用=5 → 每30分钟50次请求且不超$5费用
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label>每日费用限制 (美元)</label>
            <div>
              <div>
                <button type="button" @click="form.dailyCostLimit = '50'">$50</button>
                <button type="button" @click="form.dailyCostLimit = '100'">$100</button>
                <button type="button" @click="form.dailyCostLimit = '200'">$200</button>
                <button type="button" @click="form.dailyCostLimit = ''">自定义</button>
              </div>
              <input
                v-model="form.dailyCostLimit"
                min="0"
                placeholder="0 表示无限制"
                step="0.01"
                type="number"
              />
              <p>设置此 API Key 每日的费用限制，超过限制将拒绝请求，0 或留空表示无限制</p>
            </div>
          </div>

          <div>
            <label>总费用限制 (美元)</label>
            <div>
              <div>
                <button type="button" @click="form.totalCostLimit = '100'">$100</button>
                <button type="button" @click="form.totalCostLimit = '500'">$500</button>
                <button type="button" @click="form.totalCostLimit = '1000'">$1000</button>
                <button type="button" @click="form.totalCostLimit = ''">自定义</button>
              </div>
              <input
                v-model="form.totalCostLimit"
                min="0"
                placeholder="0 表示无限制"
                step="0.01"
                type="number"
              />
              <p>
                设置此 API Key 的累计总费用限制，达到限制后将拒绝所有后续请求，0 或留空表示无限制
              </p>
            </div>
          </div>

          <div>
            <label>Opus 模型周费用限制 (美元)</label>
            <div>
              <div>
                <button type="button" @click="form.weeklyOpusCostLimit = '100'">$100</button>
                <button type="button" @click="form.weeklyOpusCostLimit = '500'">$500</button>
                <button type="button" @click="form.weeklyOpusCostLimit = '1000'">$1000</button>
                <button type="button" @click="form.weeklyOpusCostLimit = ''">自定义</button>
              </div>
              <input
                v-model="form.weeklyOpusCostLimit"
                min="0"
                placeholder="0 表示无限制"
                step="0.01"
                type="number"
              />
              <p>
                设置 Opus 模型的周费用限制（周一到周日），仅限 Claude 官方账户，0 或留空表示无限制
              </p>
            </div>
          </div>

          <div>
            <label>并发限制 (可选)</label>
            <input
              v-model="form.concurrencyLimit"
              min="0"
              placeholder="0 表示无限制"
              type="number"
            />
            <p>设置此 API Key 可同时处理的最大请求数，0 或留空表示无限制</p>
          </div>

          <div>
            <label>备注 (可选)</label>
            <textarea v-model="form.description" placeholder="描述此 API Key 的用途..." rows="2" />
          </div>

          <div>
            <label>过期设置</label>
            <!-- 过期模式选择 -->
            <div>
              <div>
                <label>
                  <input v-model="form.expirationMode" type="radio" value="fixed" />
                  <span>固定时间过期</span>
                </label>
                <label>
                  <input v-model="form.expirationMode" type="radio" value="activation" />
                  <span>首次使用后激活</span>
                </label>
              </div>
              <p>
                <span v-if="form.expirationMode === 'fixed'">
                  固定时间模式：Key 创建后立即生效，按设定时间过期（支持小时和天数）
                </span>
                <span v-else>
                  激活模式：Key 首次使用时激活，激活后按设定时间过期（支持小时和天数，适合批量销售）
                </span>
              </p>
            </div>

            <!-- 固定时间模式 -->
            <div v-if="form.expirationMode === 'fixed'">
              <select v-model="form.expireDuration" @change="updateExpireAt">
                <option value="">永不过期</option>
                <option value="1h">1 小时</option>
                <option value="3h">3 小时</option>
                <option value="6h">6 小时</option>
                <option value="12h">12 小时</option>
                <option value="1d">1 天</option>
                <option value="7d">7 天</option>
                <option value="30d">30 天</option>
                <option value="90d">90 天</option>
                <option value="180d">180 天</option>
                <option value="365d">365 天</option>
                <option value="custom">自定义日期</option>
              </select>
              <div v-if="form.expireDuration === 'custom'">
                <input
                  v-model="form.customExpireDate"
                  :min="minDateTime"
                  type="datetime-local"
                  @change="updateCustomExpireAt"
                />
              </div>
              <p v-if="form.expiresAt">将于 {{ formatExpireDate(form.expiresAt) }} 过期</p>
            </div>

            <!-- 激活模式 -->
            <div v-else>
              <div>
                <input
                  v-model.number="form.activationDays"
                  :max="form.activationUnit === 'hours' ? 8760 : 3650"
                  min="1"
                  :placeholder="form.activationUnit === 'hours' ? '输入小时数' : '输入天数'"
                  type="number"
                />
                <select v-model="form.activationUnit" @change="updateActivationValue">
                  <option value="hours">小时</option>
                  <option value="days">天</option>
                </select>
              </div>
              <div>
                <button
                  v-for="value in getQuickTimeOptions()"
                  :key="value.value"
                  type="button"
                  @click="form.activationDays = value.value"
                >
                  {{ value.label }}
                </button>
              </div>
              <p>
                Key 将在首次使用后激活，激活后
                {{ form.activationDays || (form.activationUnit === 'hours' ? 24 : 30) }}
                {{ form.activationUnit === 'hours' ? '小时' : '天' }}过期
              </p>
            </div>
          </div>

          <div>
            <label>服务权限</label>
            <div>
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
            <p>控制此 API Key 可以访问哪些服务</p>
          </div>

          <div>
            <div>
              <label>专属账号绑定 (可选)</label>
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
                  v-model="form.claudeAccountId"
                  :accounts="localAccounts.claude"
                  default-option-text="使用共享账号池"
                  :disabled="form.permissions !== 'all' && form.permissions !== 'claude'"
                  :groups="localAccounts.claudeGroups"
                  placeholder="请选择Claude账号"
                  platform="claude"
                />
              </div>
              <div>
                <label>Gemini 专属账号</label>
                <AccountSelector
                  v-model="form.geminiAccountId"
                  :accounts="localAccounts.gemini"
                  default-option-text="使用共享账号池"
                  :disabled="form.permissions !== 'all' && form.permissions !== 'gemini'"
                  :groups="localAccounts.geminiGroups"
                  placeholder="请选择Gemini账号"
                  platform="gemini"
                />
              </div>
              <div>
                <label>OpenAI 专属账号</label>
                <AccountSelector
                  v-model="form.openaiAccountId"
                  :accounts="localAccounts.openai"
                  default-option-text="使用共享账号池"
                  :disabled="form.permissions !== 'all' && form.permissions !== 'openai'"
                  :groups="localAccounts.openaiGroups"
                  placeholder="请选择OpenAI账号"
                  platform="openai"
                />
              </div>
              <div>
                <label>Bedrock 专属账号</label>
                <AccountSelector
                  v-model="form.bedrockAccountId"
                  :accounts="localAccounts.bedrock"
                  default-option-text="使用共享账号池"
                  :disabled="form.permissions !== 'all' && form.permissions !== 'openai'"
                  :groups="[]"
                  placeholder="请选择Bedrock账号"
                  platform="bedrock"
                />
              </div>
              <div>
                <label>Droid 专属账号</label>
                <AccountSelector
                  v-model="form.droidAccountId"
                  :accounts="localAccounts.droid"
                  default-option-text="使用共享账号池"
                  :disabled="form.permissions !== 'all' && form.permissions !== 'droid'"
                  :groups="localAccounts.droidGroups"
                  placeholder="请选择Droid账号"
                  platform="droid"
                />
              </div>
            </div>
            <p>选择专属账号后，此API Key将只使用该账号，不选择则使用共享账号池</p>
          </div>

          <div>
            <div>
              <input
                id="enableModelRestriction"
                v-model="form.enableModelRestriction"
                type="checkbox"
              />
              <label for="enableModelRestriction"> 启用模型限制 </label>
            </div>

            <div v-if="form.enableModelRestriction">
              <div>
                <label>限制的模型列表</label>
                <div>
                  <span v-for="(model, index) in form.restrictedModels" :key="index">
                    {{ model }}
                    <button type="button" @click="removeRestrictedModel(index)"></button>
                  </span>
                  <span v-if="form.restrictedModels.length === 0"> 暂无限制的模型 </span>
                </div>
                <div>
                  <!-- 快速添加按钮 -->
                  <div>
                    <button
                      v-for="model in availableQuickModels"
                      :key="model"
                      type="button"
                      @click="quickAddRestrictedModel(model)"
                    >
                      {{ model }}
                    </button>
                    <span v-if="availableQuickModels.length === 0">
                      所有常用模型已在限制列表中
                    </span>
                  </div>

                  <!-- 手动输入 -->
                  <div>
                    <input
                      v-model="form.modelInput"
                      placeholder="输入模型名称，按回车添加"
                      type="text"
                      @keydown.enter.prevent="addRestrictedModel"
                    />
                    <button type="button" @click="addRestrictedModel"></button>
                  </div>
                </div>
                <p>设置此API Key无法访问的模型，例如：claude-opus-4-20250514</p>
              </div>
            </div>
          </div>

          <!-- 客户端限制 -->
          <div>
            <div>
              <input
                id="enableClientRestriction"
                v-model="form.enableClientRestriction"
                type="checkbox"
              />
              <label for="enableClientRestriction"> 启用客户端限制 </label>
            </div>

            <div v-if="form.enableClientRestriction">
              <div>
                <label>允许的客户端</label>
                <div>
                  <div v-for="client in supportedClients" :key="client.id">
                    <input
                      :id="`client_${client.id}`"
                      v-model="form.allowedClients"
                      type="checkbox"
                      :value="client.id"
                    />
                    <label :for="`client_${client.id}`">
                      <span>{{ client.name }}</span>
                      <span>{{ client.description }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button type="button" @click="$emit('close')">取消</button>
            <button :disabled="loading" type="submit">
              <div v-if="loading" />

              {{ loading ? '创建中...' : '创建' }}
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
import { useClientsStore } from '@/stores/clients'
import { useApiKeysStore } from '@/stores/apiKeys'
import { apiClient } from '@/config/api'
import AccountSelector from '@/components/common/AccountSelector.vue'

const props = defineProps({
  accounts: {
    type: Object,
    default: () => ({
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
  }
})

const emit = defineEmits(['close', 'success', 'batch-success'])

const clientsStore = useClientsStore()
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

// 表单验证状态
const errors = ref({
  name: ''
})

// 标签相关
const newTag = ref('')
const availableTags = ref([])

// 计算未选择的标签
const unselectedTags = computed(() => {
  return availableTags.value.filter((tag) => !form.tags.includes(tag))
})

// 支持的客户端列表
const supportedClients = ref([])

// 表单数据
const form = reactive({
  createType: 'single',
  batchCount: 10,
  name: '',
  description: '',
  rateLimitWindow: '',
  rateLimitRequests: '',
  rateLimitCost: '', // 新增：费用限制
  concurrencyLimit: '',
  dailyCostLimit: '',
  totalCostLimit: '',
  weeklyOpusCostLimit: '',
  expireDuration: '',
  customExpireDate: '',
  expiresAt: null,
  expirationMode: 'fixed', // 过期模式：fixed(固定) 或 activation(激活)
  activationDays: 30, // 激活后有效天数
  activationUnit: 'days', // 激活时间单位：hours 或 days
  permissions: 'all',
  claudeAccountId: '',
  geminiAccountId: '',
  openaiAccountId: '',
  bedrockAccountId: '',
  droidAccountId: '',
  enableModelRestriction: false,
  restrictedModels: [],
  modelInput: '',
  enableClientRestriction: false,
  allowedClients: [],
  tags: []
})

// 加载支持的客户端和已存在的标签
onMounted(async () => {
  supportedClients.value = await clientsStore.loadSupportedClients()
  availableTags.value = await apiKeysStore.fetchTags()
  // 初始化账号数据
  if (props.accounts) {
    // 合并 OpenAI 和 OpenAI-Responses 账号
    const openaiAccounts = []
    if (props.accounts.openai) {
      props.accounts.openai.forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai'
        })
      })
    }
    if (props.accounts.openaiResponses) {
      props.accounts.openaiResponses.forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai-responses'
        })
      })
    }

    localAccounts.value = {
      claude: props.accounts.claude || [],
      gemini: props.accounts.gemini || [],
      openai: openaiAccounts,
      bedrock: props.accounts.bedrock || [],
      droid: (props.accounts.droid || []).map((account) => ({
        ...account,
        platform: 'droid'
      })),
      claudeGroups: props.accounts.claudeGroups || [],
      geminiGroups: props.accounts.geminiGroups || [],
      openaiGroups: props.accounts.openaiGroups || [],
      droidGroups: props.accounts.droidGroups || []
    }
  }

  // 使用缓存的账号数据，不自动刷新（用户可点击"刷新账号"按钮手动刷新）
})

// 刷新账号列表
const refreshAccounts = async () => {
  accountsLoading.value = true
  try {
    const [
      claudeData,
      claudeConsoleData,
      geminiData,
      openaiData,
      openaiResponsesData,
      bedrockData,
      droidData,
      groupsData
    ] = await Promise.all([
      apiClient.get('/admin/claude-accounts'),
      apiClient.get('/admin/claude-console-accounts'),
      apiClient.get('/admin/gemini-accounts'),
      apiClient.get('/admin/openai-accounts'),
      apiClient.get('/admin/openai-responses-accounts'), // 获取 OpenAI-Responses 账号
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
          isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
        })
      })
    }

    if (claudeConsoleData.success) {
      claudeConsoleData.data?.forEach((account) => {
        claudeAccounts.push({
          ...account,
          platform: 'claude-console',
          isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
        })
      })
    }

    localAccounts.value.claude = claudeAccounts

    if (geminiData.success) {
      localAccounts.value.gemini = (geminiData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
      }))
    }

    // 合并 OpenAI 和 OpenAI-Responses 账号
    const openaiAccounts = []

    if (openaiData.success) {
      ;(openaiData.data || []).forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai',
          isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
        })
      })
    }

    if (openaiResponsesData.success) {
      ;(openaiResponsesData.data || []).forEach((account) => {
        openaiAccounts.push({
          ...account,
          platform: 'openai-responses',
          isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
        })
      })
    }

    localAccounts.value.openai = openaiAccounts

    if (bedrockData.success) {
      localAccounts.value.bedrock = (bedrockData.data || []).map((account) => ({
        ...account,
        isDedicated: account.accountType === 'dedicated' // 保留以便向后兼容
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

// 计算最小日期时间
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1)
  return now.toISOString().slice(0, 16)
})

// 更新过期时间
const updateExpireAt = () => {
  if (!form.expireDuration) {
    form.expiresAt = null
    return
  }

  if (form.expireDuration === 'custom') {
    return
  }

  const now = new Date()
  const duration = form.expireDuration
  const match = duration.match(/(\d+)([dhmy])/)

  if (match) {
    const [, value, unit] = match
    const num = parseInt(value)

    switch (unit) {
      case 'd':
        now.setDate(now.getDate() + num)
        break
      case 'h':
        now.setHours(now.getHours() + num)
        break
      case 'm':
        now.setMonth(now.getMonth() + num)
        break
      case 'y':
        now.setFullYear(now.getFullYear() + num)
        break
    }

    form.expiresAt = now.toISOString()
  }
}

// 更新自定义过期时间
const updateCustomExpireAt = () => {
  if (form.customExpireDate) {
    form.expiresAt = new Date(form.customExpireDate).toISOString()
  }
}

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

// 添加限制的模型
const addRestrictedModel = () => {
  if (form.modelInput && !form.restrictedModels.includes(form.modelInput)) {
    form.restrictedModels.push(form.modelInput)
    form.modelInput = ''
  }
}

// 移除限制的模型
const removeRestrictedModel = (index) => {
  form.restrictedModels.splice(index, 1)
}

// 常用模型列表
const commonModels = ref(['claude-opus-4-20250514', 'claude-opus-4-1-20250805'])

// 可用的快捷模型（过滤掉已在限制列表中的）
const availableQuickModels = computed(() => {
  return commonModels.value.filter((model) => !form.restrictedModels.includes(model))
})

// 快速添加限制的模型
const quickAddRestrictedModel = (model) => {
  if (!form.restrictedModels.includes(model)) {
    form.restrictedModels.push(model)
  }
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

// 获取快捷时间选项
const getQuickTimeOptions = () => {
  if (form.activationUnit === 'hours') {
    return [
      { value: 1, label: '1小时' },
      { value: 3, label: '3小时' },
      { value: 6, label: '6小时' },
      { value: 12, label: '12小时' }
    ]
  } else {
    return [
      { value: 30, label: '30天' },
      { value: 90, label: '90天' },
      { value: 180, label: '180天' },
      { value: 365, label: '365天' }
    ]
  }
}

// 单位变化时更新数值
const updateActivationValue = () => {
  if (form.activationUnit === 'hours') {
    // 从天切换到小时，设置一个合理的默认值
    if (form.activationDays > 24) {
      form.activationDays = 24
    }
  } else {
    // 从小时切换到天，设置一个合理的默认值
    if (form.activationDays < 1) {
      form.activationDays = 1
    }
  }
}

// 创建 API Key
const createApiKey = async () => {
  // 验证表单
  errors.value.name = ''

  if (!form.name || !form.name.trim()) {
    errors.value.name = '请输入API Key名称'
    return
  }

  // 批量创建时验证数量
  if (form.createType === 'batch') {
    if (!form.batchCount || form.batchCount < 2 || form.batchCount > 500) {
      showToast('批量创建数量必须在 2-500 之间', 'error')
      return
    }
  }

  // 检查是否设置了时间窗口但费用限制为0
  if (form.rateLimitWindow && (!form.rateLimitCost || parseFloat(form.rateLimitCost) === 0)) {
    let confirmed = false
    if (window.showConfirm) {
      confirmed = await window.showConfirm(
        '费用限制提醒',
        '您设置了时间窗口但费用限制为0，这意味着不会有费用限制。\n\n是否继续？',
        '继续创建',
        '返回修改'
      )
    } else {
      // 降级方案
      confirmed = confirm('您设置了时间窗口但费用限制为0，这意味着不会有费用限制。\n是否继续？')
    }
    if (!confirmed) {
      return
    }
  }

  loading.value = true

  try {
    // 准备提交的数据
    const baseData = {
      description: form.description || undefined,
      tokenLimit: 0, // 设置为0，清除历史token限制
      rateLimitWindow:
        form.rateLimitWindow !== '' && form.rateLimitWindow !== null
          ? parseInt(form.rateLimitWindow)
          : null,
      rateLimitRequests:
        form.rateLimitRequests !== '' && form.rateLimitRequests !== null
          ? parseInt(form.rateLimitRequests)
          : null,
      rateLimitCost:
        form.rateLimitCost !== '' && form.rateLimitCost !== null
          ? parseFloat(form.rateLimitCost)
          : null,
      concurrencyLimit:
        form.concurrencyLimit !== '' && form.concurrencyLimit !== null
          ? parseInt(form.concurrencyLimit)
          : 0,
      dailyCostLimit:
        form.dailyCostLimit !== '' && form.dailyCostLimit !== null
          ? parseFloat(form.dailyCostLimit)
          : 0,
      totalCostLimit:
        form.totalCostLimit !== '' && form.totalCostLimit !== null
          ? parseFloat(form.totalCostLimit)
          : 0,
      weeklyOpusCostLimit:
        form.weeklyOpusCostLimit !== '' && form.weeklyOpusCostLimit !== null
          ? parseFloat(form.weeklyOpusCostLimit)
          : 0,
      expiresAt: form.expirationMode === 'fixed' ? form.expiresAt || undefined : undefined,
      expirationMode: form.expirationMode,
      activationDays: form.expirationMode === 'activation' ? form.activationDays : undefined,
      activationUnit: form.expirationMode === 'activation' ? form.activationUnit : undefined,
      permissions: form.permissions,
      tags: form.tags.length > 0 ? form.tags : undefined,
      enableModelRestriction: form.enableModelRestriction,
      restrictedModels: form.restrictedModels,
      enableClientRestriction: form.enableClientRestriction,
      allowedClients: form.allowedClients
    }

    // 处理Claude账户绑定（区分OAuth和Console）
    if (form.claudeAccountId) {
      if (form.claudeAccountId.startsWith('console:')) {
        // Claude Console账户
        baseData.claudeConsoleAccountId = form.claudeAccountId.substring(8)
        // 确保不会同时设置OAuth账号
        delete baseData.claudeAccountId
      } else {
        // Claude OAuth账户或分组
        baseData.claudeAccountId = form.claudeAccountId
        // 确保不会同时设置Console账号
        delete baseData.claudeConsoleAccountId
      }
    }

    // Gemini账户绑定
    if (form.geminiAccountId) {
      baseData.geminiAccountId = form.geminiAccountId
    }

    // OpenAI账户绑定
    if (form.openaiAccountId) {
      baseData.openaiAccountId = form.openaiAccountId
    }

    // Bedrock账户绑定
    if (form.bedrockAccountId) {
      baseData.bedrockAccountId = form.bedrockAccountId
    }
    if (form.droidAccountId) {
      baseData.droidAccountId = form.droidAccountId
    }

    if (form.createType === 'single') {
      // 单个创建
      const data = {
        ...baseData,
        name: form.name
      }

      const result = await apiClient.post('/admin/api-keys', data)

      if (result.success) {
        showToast('API Key 创建成功', 'success')
        emit('success', result.data)
        emit('close')
      } else {
        showToast(result.message || '创建失败', 'error')
      }
    } else {
      // 批量创建
      const data = {
        ...baseData,
        createType: 'batch',
        baseName: form.name,
        count: form.batchCount
      }

      const result = await apiClient.post('/admin/api-keys/batch', data)

      if (result.success) {
        showToast(`成功创建 ${result.data.length} 个 API Key`, 'success')
        emit('batch-success', result.data)
        emit('close')
      } else {
        showToast(result.message || '批量创建失败', 'error')
      }
    }
  } catch (error) {
    showToast('创建失败', 'error')
  } finally {
    loading.value = false
  }
}
</script>
