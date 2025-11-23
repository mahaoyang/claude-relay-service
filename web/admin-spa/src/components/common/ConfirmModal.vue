<template>
  <Teleport to="body">
    <div v-if="show">
      <div>
        <div>
          <div></div>
          <div>
            <h3>
              {{ title }}
            </h3>
            <p>
              {{ message }}
            </p>
          </div>
        </div>

        <div>
          <button @click="$emit('cancel')">
            {{ cancelText }}
          </button>
          <button @click="$emit('confirm')">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '继续'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

defineEmits(['confirm', 'cancel'])
</script>
