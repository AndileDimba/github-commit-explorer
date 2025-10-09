<template>
  <div class="user-repos-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="username-prefix">@</span>{{ username }}'s Repositories
        </h1>
        <p class="repo-count" v-if="!store.loading && store.repositories.length > 0">
          {{ store.repositories.length }} {{ store.repositories.length === 1 ? 'repository' : 'repositories' }}
        </p>
      </div>
    </header>

    <ErrorBanner
      v-if="store.error"
      :message="store.error"
      :dismissible="true"
      @dismiss="store.clearError()"
    />

    <SkeletonLoader 
      v-if="store.loading" 
      :count="6" 
      variant="repo-card" 
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
          <h2 class="repo-name">{{ repo.name }}</h2>
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
            <span class="language-dot"></span>
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
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRepositoryStore } from '../stores/repository';
import { formatDate } from '../utils/date';
import EmptyState from '../components/EmptyState.vue';
import ErrorBanner from '../components/ErrorBanner.vue';
import Pagination from '../components/Pagination.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const props = defineProps<{
  username: string;
}>();

const router = useRouter();
const store = useRepositoryStore();

onMounted(() => {
  loadRepositories();
});

watch(() => props.username, () => {
  loadRepositories();
});

const loadRepositories = () => {
  if (!store.repositories.length || store.currentUsername !== props.username) {
    store.loadRepositories(props.username);
  }
};

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
  min-height: calc(100vh - 64px);
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: var(--color-gray-50);
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-gray-200);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-black);
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.username-prefix {
  color: var(--color-blue);
  font-weight: 700;
}

.repo-count {
  font-size: 1rem;
  color: var(--color-gray-600);
  font-weight: 500;
}

.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.repo-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.repo-card:hover {
  border-color: var(--color-blue);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.repo-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-black);
  margin: 0;
  word-break: break-word;
  line-height: 1.4;
}

.github-link {
  color: var(--color-gray-600);
  text-decoration: none;
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.github-link:hover {
  background: var(--color-gray-100);
  color: var(--color-blue);
}

.github-icon {
  display: inline-block;
}

.repo-description {
  color: var(--color-gray-600);
  font-size: 0.9375rem;
  line-height: 1.6;
  flex: 1;
}

.no-description {
  font-style: italic;
  color: var(--color-gray-400);
}

.repo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-gray-600);
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-gray-200);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
}

.language-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-blue);
}

.meta-icon {
  font-size: 0.875rem;
}

.repo-action {
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-gray-200);
}

.view-commits {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-blue);
  transition: color var(--transition-base);
}

.repo-card:hover .view-commits {
  color: var(--color-blue-dark);
}

@media (max-width: 768px) {
  .user-repos-container {
    padding: 1rem;
  }

  .repos-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>