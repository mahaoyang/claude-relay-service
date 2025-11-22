<template>
 <!-- 顶部导航 -->
 <div
 >
 <div>
 <div
 >
 <LogoTitle
 :loading="oemLoading"
 :logo-src="oemSettings.siteIconData || oemSettings.siteIcon"
 subtitle="管理后台"
 :title="oemSettings.siteName"
 title- >
 <template #after-title>
 <!-- 版本信息 -->
 <div>
 <span
 >v{{ versionInfo.current || '...' }}</span
 >
 <!-- 更新提示 -->
 <a
 v-if="versionInfo.hasUpdate"
 :href="versionInfo.releaseInfo?.htmlUrl || '#'"
 target="_blank"
 title="有新版本可用"
 >
 
 <span>新版本</span>
 </a>
 </div>
 </template>
 </LogoTitle>
 </div>
 <!-- 主题切换和用户菜单 -->
 <div>
 <!-- 主题切换按钮 -->
 <div>
 <ThemeToggle mode="dropdown" />
 </div>

 <!-- 分隔线 -->
 <div
 />

 <!-- 用户菜单 -->
 <div>
 <button
 @click="userMenuOpen = !userMenuOpen"
 >
 
 <span>{{ currentUser.username || 'Admin' }}</span>
 
 </button>

 <!-- 悬浮菜单 -->
 <div
 v-if="userMenuOpen"
 @click.stop
 >
 <!-- 版本信息 -->
 <div>
 <div>
 <span >当前版本</span>
 <span
 >v{{ versionInfo.current || '...' }}</span
 >
 </div>
 <div v-if="versionInfo.hasUpdate">
 <div>
 <span>
 有新版本
 </span>
 <span
 >v{{ versionInfo.latest }}</span
 >
 </div>
 <a
 :href="versionInfo.releaseInfo?.htmlUrl || '#'"
 target="_blank"
 >
 查看更新
 </a>
 </div>
 <div
 v-else-if="versionInfo.checkingUpdate"
 >
 检查更新中...
 </div>
 <div v-else>
 <!-- 已是最新版提醒 -->
 <transition mode="out-in" name="fade">
 <div
 v-if="versionInfo.noUpdateMessage"
 key="message"
 >
 <p>
 当前已是最新版本
 </p>
 </div>
 <button
 v-else
 key="button"
 @click="checkForUpdates()"
 >
 检查更新
 </button>
 </transition>
 </div>
 </div>

 <button
 @click="openChangePasswordModal"
 >
 
 <span>修改账户信息</span>
 </button>

 <hr />

 <button
 @click="logout"
 >
 
 <span>退出登录</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- 修改账户信息模态框 -->
 <div
 v-if="showChangePasswordModal"
 >
 <div>
 <div>
 <div>
 <div
 >
 
 </div>
 <h3>修改账户信息</h3>
 </div>
 <button
 @click="closeChangePasswordModal"
 >
 
 </button>
 </div>

 <form
 @submit.prevent="changePassword"
 >
 <div>
 <label
 >当前用户名</label
 >
 <input
 disabled
 type="text"
 :value="currentUser.username || 'Admin'"
 />
 <p>
 当前用户名，输入新用户名以修改
 </p>
 </div>

 <div>
 <label
 >新用户名</label
 >
 <input
 v-model="changePasswordForm.newUsername"
 placeholder="输入新用户名（留空保持不变）"
 type="text"
 />
 <p>留空表示不修改用户名</p>
 </div>

 <div>
 <label
 >当前密码</label
 >
 <input
 v-model="changePasswordForm.currentPassword"
 placeholder="请输入当前密码"
 required
 type="password"
 />
 </div>

 <div>
 <label
 >新密码</label
 >
 <input
 v-model="changePasswordForm.newPassword"
 placeholder="请输入新密码"
 required
 type="password"
 />
 <p>密码长度至少8位</p>
 </div>

 <div>
 <label
 >确认新密码</label
 >
 <input
 v-model="changePasswordForm.confirmPassword"
 placeholder="请再次输入新密码"
 required
 type="password"
 />
 </div>

 <div>
 <button
 type="button"
 @click="closeChangePasswordModal"
 >
 取消
 </button>
 <button
 :disabled="changePasswordLoading"
 type="submit"
 >
 <div v-if="changePasswordLoading" />
 
 {{ changePasswordLoading ? '保存中...' : '保存修改' }}
 </button>
 </div>
 </form>
 </div>
 </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { showToast } from '@/utils/toast'
import { apiClient } from '@/config/api'
import LogoTitle from '@/components/common/LogoTitle.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()

// 当前用户信息
const currentUser = computed(() => authStore.user || { username: 'Admin' })

// OEM设置
const oemSettings = computed(() => authStore.oemSettings || {})
const oemLoading = computed(() => authStore.oemLoading)

// 版本信息
const versionInfo = ref({
 current: '...',
 latest: '',
 hasUpdate: false,
 checkingUpdate: false,
 lastChecked: null,
 releaseInfo: null,
 noUpdateMessage: false
})

// 用户菜单状态
const userMenuOpen = ref(false)

// 修改密码模态框
const showChangePasswordModal = ref(false)
const changePasswordLoading = ref(false)
const changePasswordForm = reactive({
 currentPassword: '',
 newPassword: '',
 confirmPassword: '',
 newUsername: ''
})

// 检查更新（同时获取版本信息）
const checkForUpdates = async () => {
 if (versionInfo.value.checkingUpdate) {
 return
 }

 versionInfo.value.checkingUpdate = true

 try {
 const result = await apiClient.get('/admin/check-updates')

 if (result.success) {
 const data = result.data

 versionInfo.value.current = data.current
 versionInfo.value.latest = data.latest
 versionInfo.value.hasUpdate = data.hasUpdate
 versionInfo.value.releaseInfo = data.releaseInfo
 versionInfo.value.lastChecked = new Date()

 // 保存到localStorage
 localStorage.setItem(
 'versionInfo',
 JSON.stringify({
 current: data.current,
 latest: data.latest,
 lastChecked: versionInfo.value.lastChecked,
 hasUpdate: data.hasUpdate,
 releaseInfo: data.releaseInfo
 })
 )

 // 如果没有更新，显示提醒
 if (!data.hasUpdate) {
 versionInfo.value.noUpdateMessage = true
 // 3秒后自动隐藏提醒
 setTimeout(() => {
 versionInfo.value.noUpdateMessage = false
 }, 3000)
 }
 }
 } catch (error) {
 console.error('Error checking for updates:', error)

 // 尝试从localStorage读取缓存的版本信息
 const cached = localStorage.getItem('versionInfo')
 if (cached) {
 const cachedInfo = JSON.parse(cached)
 versionInfo.value.current = cachedInfo.current || versionInfo.value.current
 versionInfo.value.latest = cachedInfo.latest
 versionInfo.value.hasUpdate = cachedInfo.hasUpdate
 versionInfo.value.releaseInfo = cachedInfo.releaseInfo
 versionInfo.value.lastChecked = new Date(cachedInfo.lastChecked)
 }
 } finally {
 versionInfo.value.checkingUpdate = false
 }
}

// 打开修改密码弹窗
const openChangePasswordModal = () => {
 changePasswordForm.currentPassword = ''
 changePasswordForm.newPassword = ''
 changePasswordForm.confirmPassword = ''
 changePasswordForm.newUsername = ''
 showChangePasswordModal.value = true
 userMenuOpen.value = false
}

// 关闭修改密码弹窗
const closeChangePasswordModal = () => {
 showChangePasswordModal.value = false
}

// 修改密码
const changePassword = async () => {
 if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
 showToast('两次输入的密码不一致', 'error')
 return
 }

 if (changePasswordForm.newPassword.length < 8) {
 showToast('新密码长度至少8位', 'error')
 return
 }

 changePasswordLoading.value = true

 try {
 const data = await apiClient.post('/web/auth/change-password', {
 currentPassword: changePasswordForm.currentPassword,
 newPassword: changePasswordForm.newPassword,
 newUsername: changePasswordForm.newUsername || undefined
 })

 if (data.success) {
 const message = changePasswordForm.newUsername
 ? '账户信息修改成功，请重新登录'
 : '密码修改成功，请重新登录'
 showToast(message, 'success')
 closeChangePasswordModal()

 // 延迟后退出登录
 setTimeout(() => {
 authStore.logout()
 router.push('/login')
 }, 1500)
 } else {
 showToast(data.message || '修改失败', 'error')
 }
 } catch (error) {
 showToast('修改密码失败', 'error')
 } finally {
 changePasswordLoading.value = false
 }
}

// 退出登录
const logout = () => {
 if (confirm('确定要退出登录吗？')) {
 authStore.logout()
 router.push('/login')
 showToast('已安全退出', 'success')
 }
 userMenuOpen.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
 const userMenuContainer = event.target.closest('.user-menu-container')
 if (!userMenuContainer && userMenuOpen.value) {
 userMenuOpen.value = false
 }
}

onMounted(() => {
 checkForUpdates()

 // 设置自动检查更新（每小时检查一次）
 setInterval(() => {
 checkForUpdates()
 }, 3600000) // 1小时

 document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
 document.removeEventListener('click', handleClickOutside)
})
</script>

