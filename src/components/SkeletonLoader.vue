<template>
  <div class="skeleton-loader">
    <div v-for="n in count" :key="n" class="skeleton-item" :class="variant">
      <div v-if="variant === 'repo-card'" class="skeleton-repo">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-text"></div>
        <div class="skeleton-line skeleton-text short"></div>
        <div class="skeleton-meta">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
      
      <div v-else-if="variant === 'commit-card'" class="skeleton-commit">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-meta">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
      </div>
      
      <div v-else class="skeleton-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count?: number;
  variant?: 'repo-card' | 'commit-card' | 'line';
}>();
</script>

<style scoped>
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-item {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-repo {
  border: 2px solid #e0e0e0;
  padding: 1.5rem;
  background: #fff;
}

.skeleton-commit {
  border: 2px solid #e0e0e0;
  padding: 1.5rem;
  background: #fff;
}

.skeleton-title {
  height: 1.5rem;
  width: 70%;
  margin-bottom: 1rem;
}

.skeleton-text {
  height: 1rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.skeleton-text.short {
  width: 60%;
}

.skeleton-meta {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.skeleton-badge {
  height: 1.5rem;
  width: 80px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
</style>