<template>
  <div class="home-container">
    <header class="header">
      <h1>Git Commit Explorer</h1>
      <p class="subtitle">Explore GitHub repositories and commits</p>
    </header>

    <div class="search-section">
      <form @submit.prevent="handleSearch" class="search-form">
        <input
          v-model="username"
          type="text"
          placeholder="Enter GitHub username..."
          class="search-input"
          :disabled="store.loading"
          autofocus
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

    <div v-if="searched && !store.loading && !store.error && store.repositories.length === 0" class="results-section">
      <EmptyState
        icon="📁"
        title="No repositories found"
        description="This user doesn't have any public repositories."
      />
    </div>

    <div v-if="store.favorites.length > 0" class="quick-links">
      <h2>Quick Access</h2>
      <router-link to="/favorites" class="quick-link-card">
        <span class="quick-link-icon">⭐</span>
        <div class="quick-link-info">
          <h3>Your Favorites</h3>
          <p>{{ store.favoritesCount }} saved commits</p>
        </div>
      </router-link>
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
  
  if (!store.error) {
    router.push(`/users/${username.value.trim()}`);
  }
};
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 80px);
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
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
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
  margin-top: 2rem;
}

.quick-links {
  width: 100%;
  margin-top: 3rem;
}

.quick-links h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #000;
}

.quick-link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #000;
  background: #fff;
  text-decoration: none;
  color: #000;
  transition: all 0.2s;
}

.quick-link-card:hover {
  background: #000;
  color: #fff;
}

.quick-link-icon {
  font-size: 2rem;
}

.quick-link-info h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.quick-link-info p {
  font-size: 0.875rem;
  color: #666;
}

.quick-link-card:hover .quick-link-info p {
  color: #ccc;
}

@media (max-width: 640px) {
  h1 {
    font-size: 2rem;
  }
  
  .search-form {
    flex-direction: column;
  }
  
  .search-button {
    width: 100%;
  }
}
</style>