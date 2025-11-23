<template>
  <component :is="iconComponent" v-bind="$attrs" />
</template>

<script setup>
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const iconComponent = computed(() => {
  const iconName = props.name
  return LucideIcons[iconName] || LucideIcons.HelpCircle
})
</script>
