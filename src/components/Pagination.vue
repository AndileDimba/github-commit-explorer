<template>
  <div class="pagination">
    <AnimatedButton
      variant="secondary"
      :disabled="currentPage === 1 || disabled"
      @click="$emit('first')"
      aria-label="Go to first page"
    >
      ««
    </AnimatedButton>
    <AnimatedButton
      variant="secondary"
      :disabled="currentPage === 1 || disabled"
      @click="$emit('previous')"
      aria-label="Go to previous page"
    >
      ‹ Prev
    </AnimatedButton>
    <span class="page-indicator">Page {{ currentPage }}</span>
    <AnimatedButton
      variant="secondary"
      :disabled="!hasMore || disabled"
      @click="$emit('next')"
      aria-label="Go to next page"
    >
      Next ›
    </AnimatedButton>
  </div>
</template>

<script setup lang="ts">
import AnimatedButton from './AnimatedButton.vue'

defineProps<{
  currentPage: number;
  hasMore: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  first: [];
  previous: [];
  next: [];
}>();
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
  flex-wrap: wrap;
}

.page-indicator {
  padding: 0.5rem 1.25rem;
  background: #000;
  color: #fff;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid #000;
  min-width: 100px;
  text-align: center;
}
</style>