<template>
  <div class="favorites-container">
    <header class="page-header">
      <h1>Your Favorites</h1>
      <p class="subtitle" v-if="store.favoritesCount > 0">
        {{ store.favoritesCount }} saved {{ store.favoritesCount === 1 ? 'commit' : 'commits' }}
      </p>
    </header>

    <EmptyState
      v-if="store.favorites.length === 0"
      icon="⭐"
      title="No favorites yet"
      description="Star commits from any repository to save them here for quick access."
    >
      <template #action>
        <router-link to="/" class="cta-button">
          Search Repositories
        </router-link>
      </template>
    </EmptyState>

    <div v-else class="favorites-content">
      <div
        v-for="(commits, repoName) in store.favoritesByRepo"
        :key="repoName"
        class="repo-group"
      >
        <div class="repo-group-header">
          <h2>{{ repoName }}</h2>
          <span class="commit-count">{{ commits.length }} {{ commits.length === 1 ? 'commit' : 'commits' }}</span>
        </div>

        <div class="commits-list">
          <div
            v-for="fav in commits"
            :key="fav.commit.sha"
            class="favorite-card"
          >
            <div class="favorite-main">
              <div class="favorite-info">
                <h3 class="commit-message">{{ fav.commit.commit.message }}</h3>
                <div class="commit-meta">
                  <span class="commit-author">{{ fav.commit.commit.author.name }}</span>
                  <span class="meta-separator">•</span>
                  <span class="commit-date">{{ formatDate(fav.commit.commit.author.date) }}</span>
                  <span class="meta-separator">•</span>
                  <a 
                    :href="fav.commit.html_url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="commit-sha"
                    @click.stop
                  >
                    {{ fav.commit.sha.substring(0, 7) }}
                  </a>
                </div>
                <div class="favorite-source">
                  <router-link 
                    :to="`/users/${fav.username}/${fav.repoName}`"
                    class="source-link"
                  >
                    View in @{{ fav.username }}/{{ fav.repoName }} →
                  </router-link>
                </div>
              </div>

              <div class="favorite-actions">
                <button
                  @click="viewCommitDetail(fav)"
                  class="btn-detail"
                  title="View commit details"
                >
                  View Diff
                </button>
                <button
                  @click="store.removeFromFavorites(fav.commit.sha)"
                  class="btn-remove"
                  title="Remove from favorites"
                >
                  ★
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions-footer">
        <button @click="confirmClearAll" class="btn-clear-all">
          Clear All Favorites
        </button>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Commit Details</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <LoadingSpinner v-if="store.loading" message="Loading details..." />

        <div v-else-if="store.currentCommitDetail" class="commit-detail">
          <div class="detail-section">
            <h3>{{ store.currentCommitDetail.commit.message }}</h3>
            <div class="detail-meta">
              <span>{{ store.currentCommitDetail.commit.author.name }}</span>
              <span class="meta-separator">•</span>
              <span>{{ formatDate(store.currentCommitDetail.commit.author.date) }}</span>
              <span class="meta-separator">•</span>
              <a 
                :href="store.currentCommitDetail.html_url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="detail-link"
              >
                {{ store.currentCommitDetail.sha.substring(0, 7) }}
              </a>
            </div>
          </div>

          <div v-if="store.currentCommitDetail.stats" class="stats-section">
            <div class="stat-card">
              <div class="stat-value">{{ store.currentCommitDetail.stats.total }}</div>
              <div class="stat-label">Files Changed</div>
            </div>
            <div class="stat-card additions">
              <div class="stat-value">+{{ store.currentCommitDetail.stats.additions }}</div>
              <div class="stat-label">Additions</div>
            </div>
            <div class="stat-card deletions">
              <div class="stat-value">-{{ store.currentCommitDetail.stats.deletions }}</div>
              <div class="stat-label">Deletions</div>
            </div>
          </div>

          <div v-if="store.currentCommitDetail.files && store.currentCommitDetail.files.length > 0" class="files-section">
            <h3>Changed Files</h3>
            <div
              v-for="file in store.currentCommitDetail.files"
              :key="file.filename"
              class="file-card"
            >
              <div class="file-header">
                <span class="filename">{{ file.filename }}</span>
                <div class="file-meta">
                  <span class="file-status" :class="file.status">{{ file.status }}</span>
                  <span class="file-changes">
                    <span class="additions">+{{ file.additions }}</span>
                    <span class="deletions">-{{ file.deletions }}</span>
                  </span>
                </div>
              </div>
              <pre v-if="file.patch" class="file-patch">{{ file.patch }}</pre>
              <p v-else class="no-patch">No diff available</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="confirm-modal" @click.stop>
        <h2>Clear All Favorites?</h2>
        <p>This will remove all {{ store.favoritesCount }} saved commits. This action cannot be undone.</p>
        <div class="confirm-actions">
          <button @click="showConfirmModal = false" class="btn-cancel">
            Cancel
          </button>
          <button @click="clearAllFavorites" class="btn-confirm">
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRepositoryStore } from '../stores/repository';
import type { FavoriteCommit } from '../types/git';
import { formatDate } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';

const store = useRepositoryStore();
const showDetailModal = ref(false);
const showConfirmModal = ref(false);
const currentFavorite = ref<FavoriteCommit | null>(null);

const viewCommitDetail = async (fav: FavoriteCommit) => {
  currentFavorite.value = fav;
  showDetailModal.value = true;
  await store.loadCommitDetail(fav.username, fav.repoName, fav.commit.sha);
};

const closeModal = () => {
  showDetailModal.value = false;
  store.currentCommitDetail = null;
  currentFavorite.value = null;
};

const confirmClearAll = () => {
  showConfirmModal.value = true;
};

const clearAllFavorites = () => {
  const allShas = store.favorites.map(f => f.commit.sha);
  allShas.forEach(sha => store.removeFromFavorites(sha));
  showConfirmModal.value = false;
};
</script>

<style scoped>
.favorites-container {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #000;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.subtitle {
  font-size: 1rem;
  color: #666;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 1rem;
}

.cta-button:hover {
  background: #fff;
  color: #000;
}

.favorites-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.repo-group {
  border: 2px solid #000;
  background: #fff;
}

.repo-group-header {
  padding: 1.5rem;
  background: #000;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.repo-group-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.commit-count {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  background: #fff;
  color: #000;
  font-weight: 600;
  border-radius: 12px;
}

.commits-list {
  display: flex;
  flex-direction: column;
}

.favorite-card {
  padding: 1.5rem;
  border-bottom: 2px solid #ddd;
  transition: background 0.2s;
}

.favorite-card:last-child {
  border-bottom: none;
}

.favorite-card:hover {
  background: #fafafa;
}

.favorite-main {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
}

.favorite-info {
  flex: 1;
  min-width: 0;
}

.commit-message {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #000;
  word-break: break-word;
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.commit-author {
  font-weight: 500;
}

.meta-separator {
  color: #ccc;
}

.commit-sha {
  font-family: monospace;
  color: #000;
  text-decoration: none;
  padding: 0.125rem 0.375rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  font-weight: 600;
}

.commit-sha:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

.favorite-source {
  margin-top: 0.5rem;
}

.source-link {
  color: #000;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.source-link:hover {
  border-bottom-color: #000;
}

.favorite-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  flex-shrink: 0;
}

.btn-detail {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 2px solid #000;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-detail:hover {
  background: #000;
  color: #fff;
}

.btn-remove {
  padding: 0.5rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.btn-remove:hover {
  background: #fff;
  color: #000;
}

.actions-footer {
  padding-top: 1rem;
  border-top: 2px solid #ddd;
  display: flex;
  justify-content: center;
}

.btn-clear-all {
  padding: 0.75rem 2rem;
  background: #fff;
  border: 2px solid #000;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-all:hover {
  background: #000;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: #fff;
  border: 3px solid #000;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #000;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #000;
}

.btn-close {
  padding: 0.25rem 0.75rem;
  background: #fff;
  border: 2px solid #000;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #000;
  color: #fff;
}

.commit-detail {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #ddd;
}

.detail-section h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #000;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  flex-wrap: wrap;
}

.detail-link {
  font-family: monospace;
  color: #000;
  text-decoration: none;
  padding: 0.125rem 0.375rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  font-weight: 600;
}

.detail-link:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #ddd;
}

.stat-card {
  border: 2px solid #000;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.25rem;
}

.stat-card.additions .stat-value {
  color: #000;
}

.stat-card.deletions .stat-value {
  color: #666;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.files-section h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #000;
}

.file-card {
  margin-bottom: 1.5rem;
  border: 2px solid #ddd;
  background: #fafafa;
}

.file-header {
  padding: 1rem;
  background: #fff;
  border-bottom: 2px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filename {
  font-family: monospace;
  font-weight: 600;
  color: #000;
  word-break: break-all;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-status {
  padding: 0.25rem 0.5rem;
  border: 2px solid #000;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #fff;
}

.file-status.modified {
  background: #f5f5f5;
}

.file-status.added {
  background: #000;
  color: #fff;
}

.file-status.removed {
  background: #fff;
  color: #000;
}

.file-changes {
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: monospace;
}

.additions {
  color: #000;
}

.deletions {
  color: #666;
}

.file-patch {
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  font-family: monospace;
  line-height: 1.5;
  background: #fafafa;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-patch {
  padding: 1rem;
  color: #999;
  font-style: italic;
  text-align: center;
}

.confirm-modal {
  background: #fff;
  border: 3px solid #000;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
}

.confirm-modal h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #000;
}

.confirm-modal p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #fff;
  border: 2px solid #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: #fff;
  color: #000;
}

@media (max-width: 768px) {
  .favorites-container {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .repo-group-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .favorite-main {
    flex-direction: column;
  }

  .favorite-actions {
    align-self: flex-start;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .file-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .confirm-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
</style>