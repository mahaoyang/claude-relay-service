<script setup>
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'

defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: [String, Number],
    default: null
  },
  vertical: Boolean
})

defineEmits(['update:modelValue'])
</script>

<template>
  <TabGroup
    as="div"
    :selected-index="tabs.findIndex((tab) => tab.key === modelValue)"
    @change="(index) => $emit('update:modelValue', tabs[index].key)"
  >
    <TabList
      class="flex border-b border-gray-200 dark:border-secondary-700/50"
      :class="vertical ? 'flex-col border-b-0 border-r' : 'space-x-2'"
    >
      <Tab
        v-for="tab in tabs"
        :key="tab.key"
        v-slot="{ selected }"
        :class="[
          'relative px-4 py-2.5 text-sm font-medium outline-none ring-0 transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
          selected
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-secondary-400 dark:hover:bg-secondary-800/30 dark:hover:text-white',
          vertical ? 'w-full rounded-l-lg text-left' : 'rounded-t-lg'
        ]"
      >
        <span class="relative z-10">{{ tab.label }}</span>
        <div
          v-if="selected"
          :class="[
            'absolute rounded-full bg-primary-500',
            vertical ? 'right-0 top-0 h-full w-0.5' : 'bottom-0 left-0 h-0.5 w-full'
          ]"
        ></div>
      </Tab>
    </TabList>

    <TabPanels class="mt-4">
      <TabPanel v-for="tab in tabs" :key="tab.key" class="focus:outline-none">
        <slot :name="`panel-${tab.key}`"></slot>
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>
