<template>
 <div>
 <!-- Logo区域 -->
 <div
 >
 <template v-if="!loading">
 <img
 v-if="logoSrc"
 alt="Logo"
 :src="logoSrc"
 @error="handleLogoError"
 />
 
 </template>
 <div v-else />
 </div>

 <!-- 标题区域 -->
 <div>
 <div>
 <template v-if="!loading && title">
 <h1>
 {{ title }}
 </h1>
 </template>
 <div
 v-else-if="loading"
 />
 <!-- 插槽用于版本信息等额外内容 -->
 <slot name="after-title" />
 </div>
 <p v-if="subtitle">
 {{ subtitle }}
 </p>
 </div>
 </div>
</template>

<script setup>
defineProps({
 loading: {
 type: Boolean,
 default: false
 },
 title: {
 type: String,
 default: ''
 },
 subtitle: {
 type: String,
 default: ''
 },
 logoSrc: {
 type: String,
 default: ''
 },
 titleClass: {
 type: String,
 default: ''
 }
})

// 处理图片加载错误
const handleLogoError = (e) => {
 e.target.style.display = 'none'
}
</script>

