<template>
  <div class="pagination">
    <button
      @click="$emit('first')"
      :disabled="currentPage === 1 || disabled"
      class="btn-pagination"
      title="First page"
      aria-label="Go to first page"
    >
      ««
    </button>
    <button
      @click="$emit('previous')"
      :disabled="currentPage === 1 || disabled"
      class="btn-pagination"
      aria-label="Go to previous page"
    >
      ‹ Prev
    </button>
    <span class="page-indicator">Page {{ currentPage }}</span>
    <button
      @click="$emit('next')"
      :disabled="!hasMore || disabled"
      class="btn-pagination"
      aria-label="Go to next page"
    >
      Next ›
    </button>
  </div>
</template>

<script setup lang="ts">
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

.btn-pagination {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 2px solid #000;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 70px;
}

.btn-pagination:hover:not(:disabled) {
  background: #000;
  color: #fff;
}

.btn-pagination:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: #ccc;
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