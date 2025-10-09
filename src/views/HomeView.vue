<template>
  <div class="home-container">
    <header class="header">
      <h1>Git Commit Explorer</h1>
      <p class="subtitle">Search for any GitHub user's repositories</p>
    </header>

    <div class="search-section">
      <form @submit.prevent="handleSearch" class="search-form">
        <input
          v-model="username"
          type="text"
          placeholder="Enter GitHub username..."
          class="search-input"
          :disabled="store.loading"
        />
        <button type="submit" class="search-button" :disabled="store.loading || !username.trim()">
          {{ store.loading ? 'Searching...' : 'Search' }}
        </button>
      </form>
    </div>

    <ErrorBanner
      v-if="store.error"
      :message="store.error"
      :dismissible="true"
      @dismiss="store.clearError()"
    />

    <div v-if="searched && !store.loading && !store.error" class="results-section">
      <EmptyState
        v-if="!store.repositories.length"
        icon="📁"
        title="No repositories found"
        description="This user doesn't have any public repositories."
      />
      <div v-else>
        <p class="results-count">Found {{ store.repositories.length }} repositories</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRepositoryStore } from '../stores/repository';
import ErrorBanner from '../components/ErrorBanner.vue';
import EmptyState from '../components/EmptyState.vue';

const router = useRouter();
const store = useRepositoryStore();
const username = ref('');
const searched = ref(false);

const handleSearch = async () => {
  if (!username.value.trim()) return;
  
  searched.value = true;
  await store.loadRepositories(username.value.trim());
  
  if (!store.error && store.repositories.length > 0) {
    router.push(`/repos/${username.value.trim()}`);
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.subtitle {
  font-size: 1.125rem;
  color: #666;
}

.search-section {
  width: 100%;
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.search-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #000;
  font-size: 1rem;
  background: #fff;
}

.search-input:focus {
  outline: none;
  border-color: #000;
}

.search-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-button {
  padding: 1rem 2rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  background: #fff;
  color: #000;
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-section {
  width: 100%;
}

.results-count {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}
</style>