<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  description?: string;
}>();
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.empty-description {
  color: #666;
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto;
}
</style>