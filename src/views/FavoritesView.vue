<template>
  <div class="favorites-view">
    <div class="favorites-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">⭐</span>
          Favorite Commits
        </h1>
        <p class="page-description">
          Your saved commits across all repositories
        </p>
        
        <div v-if="store.favoritesCount > 0" class="header-actions">
          <span class="favorites-count">{{ store.favoritesCount }} favorite{{ store.favoritesCount !== 1 ? 's' : '' }}</span>
          <button @click="showClearModal = true" class="clear-all-button">
            <span class="button-icon">🗑</span>
            Clear All
          </button>
        </div>
      </div>
    </div>

    <div class="favorites-container">
      <div v-if="store.favorites.length === 0" class="empty-state">
        <span class="empty-icon">⭐</span>
        <h2 class="empty-title">No Favorites Yet</h2>
        <p class="empty-message">
          Start exploring repositories and save your favorite commits!
        </p>
        <router-link to="/" class="explore-button">
          <span class="button-icon">🔍</span>
          Explore Repositories
        </router-link>
      </div>

      <div v-else class="favorites-list">
        <div
          v-for="favorite in store.favorites"
          :key="favorite.commit.sha"
          class="favorite-card"
        >
          <div class="card-header">
            <div class="repo-badge">
              <span class="badge-icon">📦</span>
              <span class="repo-name">{{ favorite.repoName }}</span>
            </div>
            <button
              @click="removeFavorite(favorite.commit.sha)"
              class="remove-button"
              aria-label="Remove from favorites"
            >
              <span class="remove-icon">✕</span>
            </button>
          </div>

          <div class="commit-content">
            <div class="commit-header">
              <img
                v-if="favorite.commit.author?.avatar_url"
                :src="favorite.commit.author.avatar_url"
                :alt="favorite.commit.commit.author.name"
                class="author-avatar"
              />
              <div v-else class="author-avatar-placeholder">
                {{ favorite.commit.commit.author.name.charAt(0).toUpperCase() }}
              </div>

              <div class="commit-info">
                <h3 class="commit-message">{{ favorite.commit.commit.message }}</h3>
                <div class="commit-meta">
                  <span class="author-name">{{ favorite.commit.commit.author.name }}</span>
                  <span class="meta-divider">•</span>
                  <span class="commit-date">{{ formatDate(favorite.commit.commit.author.date) }}</span>
                </div>
              </div>
            </div>

            <div class="commit-actions">
              <button @click="viewCommitDetails(favorite)" class="action-button secondary">
                <span class="button-icon">📄</span>
                View Diff
              </button>
              <a
                :href="favorite.commitUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="action-button secondary"
              >
                <span class="button-icon">↗</span>
                GitHub
              </a>
              <div class="commit-sha">
                <span class="sha-label">SHA:</span>
                <code class="sha-value">{{ favorite.commit.sha.substring(0, 7) }}</code>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <span class="saved-date">
              <span class="footer-icon">🕒</span>
              Saved {{ formatDate(favorite.savedAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <CommitDetailsModal
      v-if="selectedFavorite"
      :username="selectedFavorite.username"
      :repo-name="selectedFavorite.repoName"
      :commit-sha="selectedFavorite.commit.sha"
      @close="selectedFavorite = null"
    />

    <ConfirmModal
      :show="showClearModal"
      title="Clear All Favorites"
      :message="`Are you sure you want to remove all ${store.favoritesCount} favorite commits? This action cannot be undone.`"
      confirm-text="Clear All"
      cancel-text="Cancel"
      icon="🗑"
      @confirm="handleClearAll"
      @close="showClearModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRepositoryStore } from '../stores/repository';
import { formatDate } from '../utils/date';
import CommitDetailsModal from '../components/CommitDetailsModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import type { FavoriteCommit } from '../types/git';

const store = useRepositoryStore();
const selectedFavorite = ref<FavoriteCommit | null>(null);
const showClearModal = ref(false);

const removeFavorite = (sha: string) => {
  store.removeFromFavorites(sha);
};

const handleClearAll = () => {
  store.clearAllFavorites();
};

const viewCommitDetails = (favorite: FavoriteCommit) => {
  selectedFavorite.value = favorite;
};
</script>

<style scoped>
.favorites-view {
  min-height: 100vh;
  background: var(--color-background);
}

.favorites-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 2rem 1.5rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2.25rem;
}

.page-description {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.favorites-count {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.clear-all-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #EF4444;
  border: 1px solid #EF4444;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-all-button:hover {
  background: rgba(239, 68, 68, 0.1);
}

.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
}

.empty-icon {
  font-size: 5rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.empty-message {
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 400px;
  margin: 0;
}

.explore-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: #FFFFFF;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all var(--transition-base);
  margin-top: 0.5rem;
}

.explore-button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.favorite-card {
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.favorite-card:hover {
  border-color: var(--color-blue);
  box-shadow: 0 8px 24px rgba(0, 112, 243, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--color-gray-50);
  border-bottom: 2px solid var(--color-gray-200);
}

.repo-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.badge-icon {
  font-size: 1rem;
}

.repo-name {
  font-family: 'Monaco', 'Courier New', monospace;
}

.remove-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.remove-icon {
  display: block;
  line-height: 1;
}

.commit-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  border: 2px solid var(--color-border);
  flex-shrink: 0;
}

.author-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
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
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.author-name {
  font-weight: 500;
}

.meta-divider {
  color: var(--color-border);
}

.commit-date {
  font-weight: 400;
}

.commit-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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

.action-button:hover {
  transform: translateY(-1px);
  color: var(--color-text);
}

.action-button.primary {
  background: var(--color-primary);
  color: #FFFFFF;
}

.action-button.primary:hover {
  background: var(--color-primary-hover);
}

.action-button.secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.action-button.secondary:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-border-hover);
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
  color: var(--color-text-secondary);
  font-weight: 500;
}

.sha-value {
  font-family: 'Monaco', 'Courier New', monospace;
  color: var(--color-accent);
  background: var(--color-surface-hover);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.card-footer {
  padding: 0.75rem 1.5rem;
  background: var(--color-surface-hover);
  border-top: 1px solid var(--color-border);
}

.saved-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.footer-icon {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .favorites-header {
    padding: 1.5rem 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .clear-all-button {
    justify-content: center;
  }

  .favorites-container {
    padding: 1.5rem 1rem;
  }

  .card-header,
  .commit-content,
  .card-footer {
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
}
</style>