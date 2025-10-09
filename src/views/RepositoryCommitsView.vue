<template>
  <div class="commits-view">
    <div class="commits-header">
      <div class="header-content">
        <button @click="goBack" class="back-button">
          <span class="back-icon">←</span>
          Back to Repositories
        </button>
        
        <div class="repo-info">
          <h1 class="repo-title">
            <span class="repo-icon">📦</span>
            {{ repoName }}
          </h1>
          <p class="repo-meta">
            <span class="meta-item">
              <span class="meta-icon">👤</span>
              {{ username }}
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <span class="meta-icon">📝</span>
              {{ store.commits.length }} commits
            </span>
          </p>
        </div>

        <div class="header-actions">
          <label class="sort-control">
            <span class="sort-label">Sort by:</span>
            <select v-model="sortOrder" class="sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <div class="commits-container">
      <div v-if="store.loading" class="loading-state">
        <div class="skeleton-list">
          <div v-for="i in 5" :key="i" class="skeleton-commit-card">
            <div class="skeleton-header">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-info">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-meta"></div>
              </div>
            </div>
            <div class="skeleton-line skeleton-message"></div>
          </div>
        </div>
      </div>

      <div v-else-if="store.error" class="error-state">
        <span class="error-icon">⚠️</span>
        <h2 class="error-title">Failed to Load Commits</h2>
        <p class="error-message">{{ store.error }}</p>
        <button @click="loadCommits" class="retry-button">
          <span class="retry-icon">↻</span>
          Try Again
        </button>
      </div>

      <div v-else-if="sortedCommits.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <h2 class="empty-title">No Commits Found</h2>
        <p class="empty-message">This repository doesn't have any commits yet.</p>
      </div>

      <div v-else class="commits-list">
        <div
          v-for="commit in sortedCommits"
          :key="commit.sha"
          class="commit-card"
        >
          <div class="commit-header">
            <img
              v-if="commit.author?.avatar_url"
              :src="commit.author.avatar_url"
              :alt="commit.commit.author.name"
              class="author-avatar"
            />
            <div v-else class="author-avatar-placeholder">
              {{ commit.commit.author.name.charAt(0).toUpperCase() }}
            </div>

            <div class="commit-info">
              <h3 class="commit-message">{{ commit.commit.message }}</h3>
              <div class="commit-meta">
                <span class="author-name">{{ commit.commit.author.name }}</span>
                <span class="meta-divider">•</span>
                <span class="commit-date">{{ formatDate(commit.commit.author.date) }}</span>
              </div>
            </div>

            <button
              @click="toggleFavorite(commit)"
              class="favorite-button"
              :class="{ 'is-favorite': store.isFavorite(commit.sha) }"
              :aria-label="store.isFavorite(commit.sha) ? 'Remove from favorites' : 'Add to favorites'"
            >
              <span class="favorite-icon">{{ store.isFavorite(commit.sha) ? '★' : '☆' }}</span>
            </button>
          </div>

          <div class="commit-actions">
            <button @click="viewCommitDetails(commit)" class="action-button primary">
              <span class="button-icon">📄</span>
              View Diff
            </button>
            <a
              :href="commit.html_url"
              target="_blank"
              rel="noopener noreferrer"
              class="action-button secondary"
            >
              <span class="button-icon">↗</span>
              GitHub
            </a>
            <div class="commit-sha">
              <span class="sha-label">SHA:</span>
              <code class="sha-value">{{ commit.sha.substring(0, 7) }}</code>
            </div>
          </div>
        </div>
      </div>

      <div v-if="sortedCommits.length > 0" class="pagination">
        <button
          @click="goToFirstPage"
          :disabled="store.currentCommitPage === 1 || store.loading"
          class="pagination-button"
          aria-label="First page"
        >
          <span class="pagination-icon">⟪</span>
        </button>
        <button
          @click="goToPreviousPage"
          :disabled="store.currentCommitPage === 1 || store.loading"
          class="pagination-button"
          aria-label="Previous page"
        >
          <span class="pagination-icon">←</span>
          Previous
        </button>
        <span class="pagination-info">Page {{ store.currentCommitPage }}</span>
        <button
          @click="goToNextPage"
          :disabled="!store.hasMoreCommits || store.loading"
          class="pagination-button"
          aria-label="Next page"
        >
          Next
          <span class="pagination-icon">→</span>
        </button>
      </div>
    </div>

    <CommitDetailsModal
      v-if="selectedCommit"
      :username="username"
      :repo-name="repoName"
      :commit-sha="selectedCommit.sha"
      @close="selectedCommit = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRepositoryStore } from '../stores/repository';
import { formatDate } from '../utils/date';
import CommitDetailsModal from '../components/CommitDetailsModal.vue';
import type { Commit } from '../types/git';

const route = useRoute();
const router = useRouter();
const store = useRepositoryStore();

const username = route.params.username as string;
const repoName = route.params.repo as string;
const sortOrder = ref<'newest' | 'oldest'>('newest');
const selectedCommit = ref<Commit | null>(null);

const sortedCommits = computed(() => store.sortedCommits(sortOrder.value));

const loadCommits = async () => {
  await store.loadCommits(username, repoName, store.currentCommitPage);
};

const goBack = () => {
  router.push(`/users/${username}`);
};

const toggleFavorite = (commit: Commit) => {
  store.toggleFavorite(commit, repoName, username);
};

const viewCommitDetails = (commit: Commit) => {
  selectedCommit.value = commit;
};

const goToNextPage = async () => {
  await store.nextCommitPage();
};

const goToPreviousPage = async () => {
  await store.previousCommitPage();
};

const goToFirstPage = async () => {
  await store.firstCommitPage();
};

watch(() => route.params, (newParams, oldParams) => {
  if (newParams.username !== oldParams.username || newParams.repo !== oldParams.repo) {
    store.resetCommits();
    loadCommits();
  }
}, { deep: true });

onMounted(() => {
  store.resetCommits();
  loadCommits();
});
</script>

<style scoped>
.commits-view {
  min-height: 100vh;
  background: var(--color-gray-50);
}

.commits-header {
  background: var(--color-white);
  border-bottom: 2px solid var(--color-gray-200);
  padding: 2rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  align-self: flex-start;
}

.back-button:hover {
  background: var(--color-gray-100);
  color: var(--color-black);
  border-color: var(--color-gray-400);
}

.back-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.repo-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.repo-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.repo-icon {
  font-size: 2rem;
}

.repo-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-gray-600);
  font-size: 0.9375rem;
  margin: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-icon {
  font-size: 1rem;
}

.meta-divider {
  color: var(--color-gray-400);
}

.header-actions {
  display: flex;
  justify-content: flex-end;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.sort-label {
  color: var(--color-gray-600);
  font-weight: 500;
}

.sort-select {
  padding: 0.5rem 0.875rem;
  background: var(--color-white);
  color: var(--color-black);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.sort-select:hover {
  border-color: var(--color-gray-400);
  background: var(--color-gray-50);
}

.sort-select:focus {
  outline: none;
  border-color: var(--color-blue);
}

.commits-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-commit-card {
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.skeleton-header {
  display: flex;
  gap: 1rem;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 1rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-title {
  width: 60%;
}

.skeleton-meta {
  width: 40%;
}

.skeleton-message {
  width: 80%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
}

.error-title,
.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
}

.error-message,
.empty-message {
  color: var(--color-gray-600);
  text-align: center;
  max-width: 400px;
  margin: 0;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-blue);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: 0.5rem;
}

.retry-button:hover {
  background: var(--color-blue-dark);
  transform: translateY(-1px);
}

.retry-icon {
  font-size: 1.25rem;
}

.commits-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.commit-card {
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.commit-card:hover {
  border-color: var(--color-blue);
  box-shadow: 0 8px 24px rgba(0, 112, 243, 0.15);
  transform: translateY(-2px);
}

.commit-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--color-gray-200);
  flex-shrink: 0;
}

.author-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-blue);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.commit-info {
  flex: 1;
  min-width: 0;
}

.commit-message {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-black);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.author-name {
  font-weight: 500;
}

.commit-date {
  font-weight: 400;
}

.favorite-button {
  background: transparent;
  border: none;
  color: var(--color-gray-400);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.favorite-button:hover {
  color: #F59E0B;
  transform: scale(1.1);
}

.favorite-button.is-favorite {
  color: #F59E0B;
}

.favorite-icon {
  display: block;
  line-height: 1;
}

.commit-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-gray-200);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
  border: none;
}

.action-button.primary {
  background: var(--color-blue);
  color: #FFFFFF;
}

.action-button.primary:hover {
  background: var(--color-blue-dark);
  transform: translateY(-1px);
}

.action-button.secondary {
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
}

.action-button.secondary:hover {
  background: var(--color-gray-100);
  color: var(--color-black);
  border-color: var(--color-gray-400);
}

.button-icon {
  font-size: 1rem;
}

.commit-sha {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.sha-label {
  color: var(--color-gray-600);
  font-weight: 500;
}

.sha-value {
  font-family: 'Monaco', 'Courier New', monospace;
  color: var(--color-blue);
  background: var(--color-gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--color-gray-200);
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--color-white);
  color: var(--color-black);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.pagination-button:hover:not(:disabled) {
  background: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-icon {
  font-size: 1rem;
  line-height: 1;
}

.pagination-info {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-black);
  padding: 0 0.5rem;
}

@media (max-width: 768px) {
  .commits-header {
    padding: 1.5rem 1rem;
  }

  .header-content {
    gap: 1rem;
  }

  .repo-title {
    font-size: 1.5rem;
  }

  .commits-container {
    padding: 1.5rem 1rem;
  }

  .commit-card {
    padding: 1rem;
  }

  .commit-header {
    flex-wrap: wrap;
  }

  .commit-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-button {
    justify-content: center;
  }

  .commit-sha {
    margin-left: 0;
    justify-content: center;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pagination-button {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }
}
</style>