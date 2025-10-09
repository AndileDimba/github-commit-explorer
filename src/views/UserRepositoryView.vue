<template>
  <div class="user-repos-container">
    <header class="page-header">
      <div class="header-content">
        <h1>@{{ username }}'s Repositories</h1>
        <p class="repo-count" v-if="!store.loading && store.repositories.length > 0">
          {{ store.repositories.length }} repositories
        </p>
      </div>
    </header>

    <ErrorBanner
      v-if="store.error"
      :message="store.error"
      :dismissible="true"
      @dismiss="store.clearError()"
    />

    <LoadingSpinner 
      v-if="store.loading && !store.repositories.length" 
      message="Loading repositories..." 
    />

    <EmptyState
      v-else-if="!store.repositories.length && !store.loading"
      icon="📁"
      title="No repositories found"
      description="This user doesn't have any public repositories."
    />

    <div v-else class="repos-grid">
      <div
        v-for="repo in store.repositories"
        :key="repo.id"
        class="repo-card"
        @click="navigateToRepo(repo.name)"
      >
        <div class="repo-header">
          <h2>{{ repo.name }}</h2>
          <a 
            :href="repo.html_url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="github-link"
            @click.stop
            title="View on GitHub"
          >
            <span class="github-icon">↗</span>
          </a>
        </div>
        
        <p v-if="repo.description" class="repo-description">
          {{ repo.description }}
        </p>
        <p v-else class="repo-description no-description">
          No description available
        </p>

        <div class="repo-meta">
          <span v-if="repo.language" class="meta-item">
            <span class="meta-icon">●</span>
            {{ repo.language }}
          </span>
          <span class="meta-item">
            <span class="meta-icon">⭐</span>
            {{ repo.stargazers_count }}
          </span>
          <span class="meta-item">
            <span class="meta-icon">📅</span>
            {{ formatDate(repo.updated_at) }}
          </span>
        </div>

        <div class="repo-action">
          <span class="view-commits">View Commits →</span>
        </div>
      </div>
    </div>

    <Pagination
      v-if="store.repositories.length > 0"
      :current-page="store.currentRepoPage"
      :has-more="store.hasMoreRepos"
      :disabled="store.loading"
      @first="goToFirstRepoPage"
      @previous="previousRepoPage"
      @next="nextRepoPage"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRepositoryStore } from '../stores/repository';
import { formatDate } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorBanner from '../components/ErrorBanner.vue';
import Pagination from '../components/Pagination.vue';

const props = defineProps<{
  username: string;
}>();

const router = useRouter();
const store = useRepositoryStore();

onMounted(() => {
  if (!store.repositories.length || store.currentUsername !== props.username) {
    store.loadRepositories(props.username);
  }
});

const navigateToRepo = (repoName: string) => {
  router.push(`/users/${props.username}/${repoName}`);
};

const nextRepoPage = async () => {
  await store.loadRepositories(props.username, store.currentRepoPage + 1);
};

const previousRepoPage = async () => {
  if (store.currentRepoPage > 1) {
    await store.loadRepositories(props.username, store.currentRepoPage - 1);
  }
};

const goToFirstRepoPage = async () => {
  if (store.currentRepoPage !== 1) {
    await store.loadRepositories(props.username, 1);
  }
};
</script>

<style scoped>
.user-repos-container {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #000;
}

.header-content h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.repo-count {
  font-size: 1rem;
  color: #666;
}

.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.repo-card {
  border: 2px solid #000;
  padding: 1.5rem;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.repo-card:hover {
  background: #000;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.repo-card h2 {
  font-size: 1.25rem;
  color: #000;
  margin: 0;
  word-break: break-word;
}

.repo-card:hover h2 {
  color: #fff;
}

.github-link {
  color: #000;
  text-decoration: none;
  font-size: 1.25rem;
  padding: 0.25rem;
  border: 2px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.github-link:hover {
  border-color: #000;
}

.repo-card:hover .github-link {
  color: #fff;
  border-color: #fff;
}

.github-icon {
  display: inline-block;
}

.repo-description {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.5;
  flex: 1;
}

.repo-card:hover .repo-description {
  color: #ccc;
}

.no-description {
  font-style: italic;
  color: #999;
}

.repo-card:hover .no-description {
  color: #888;
}

.repo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.repo-card:hover .repo-meta {
  color: #ccc;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-icon {
  font-size: 0.875rem;
}

.repo-action {
  padding-top: 0.5rem;
  border-top: 1px solid #ddd;
}

.repo-card:hover .repo-action {
  border-top-color: #444;
}

.view-commits {
  font-weight: 600;
  font-size: 0.875rem;
  color: #000;
}

.repo-card:hover .view-commits {
  color: #fff;
}

@media (max-width: 768px) {
  .user-repos-container {
    padding: 1rem;
  }

  .repos-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>