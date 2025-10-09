<template>
  <div class="error-banner">
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <p class="error-message">{{ message }}</p>
    </div>
    <button v-if="dismissible" @click="$emit('dismiss')" class="dismiss-btn" aria-label="Dismiss error">
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
  dismissible?: boolean;
}>();

defineEmits<{
  dismiss: [];
}>();
</script>

<style scoped>
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #fff;
  border: 2px solid #000;
  border-left: 6px solid #000;
  margin-bottom: 1.5rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 1.5rem;
}

.error-message {
  font-weight: 500;
  color: #000;
  margin: 0;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  color: #000;
}

.dismiss-btn:hover {
  transform: scale(1.2);
}
</style>