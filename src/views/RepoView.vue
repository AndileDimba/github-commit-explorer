<template>
  <div class="repo-container">
    <header class="header">
      <router-link to="/" class="back-link">← Back to Search</router-link>
      <h1>@{{ username }}'s Repositories</h1>
    </header>

    <ErrorBanner v-if="store.error" :message="store.error" :dismissible="true" @dismiss="store.clearError()" />

    <div class="content-grid">
      <section class="section">
        <h2>Repositories</h2>

        <LoadingSpinner v-if="store.loading && !store.repositories.length" message="Loading repositories..." />

        <EmptyState v-else-if="!store.repositories.length" icon="📁" title="No repositories found" />

        <div v-else>
          <div class="repo-list">
            <div v-for="repo in store.repositories" :key="repo.id" class="repo-item"
              :class="{ active: store.selectedRepo?.name === repo.name }" @click="selectRepo(repo)">
              <h3>{{ repo.name }}</h3>
              <p v-if="repo.description">{{ repo.description }}</p>
              <p v-else class="no-description">No description</p>
            </div>
          </div>

          <Pagination :current-page="store.currentRepoPage" :has-more="store.hasMoreRepos" :disabled="store.loading"
            @first="goToFirstRepoPage" @previous="previousRepoPage" @next="nextRepoPage" />
        </div>
      </section>

      <section class="section" v-if="store.selectedRepo">
        <div class="section-header">
          <h2>Commits</h2>
          <select v-model="sortOrder" class="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <LoadingSpinner v-if="store.loading" message="Loading commits..." />

        <EmptyState v-else-if="!displayedCommits.length" icon="📝" title="No commits found" />

        <div v-else>
          <div class="commit-list">
            <div v-for="commit in displayedCommits" :key="commit.sha" class="commit-item">
              <div class="commit-header">
                <div class="commit-info">
                  <p class="commit-message">{{ commit.commit.message }}</p>
                  <p class="commit-meta">
                    {{ commit.commit.author.name }} •
                    {{ formatDate(commit.commit.author.date) }}
                  </p>
                </div>
                <div class="commit-actions">
                  <button @click="toggleFavorite(commit)" class="btn-icon"
                    :class="{ favorited: store.isFavorite(commit.sha) }"
                    :title="store.isFavorite(commit.sha) ? 'Remove from favorites' : 'Add to favorites'">
                    {{ store.isFavorite(commit.sha) ? '★' : '☆' }}
                  </button>
                  <button @click="viewCommitDetail(commit.sha)" class="btn-small">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Pagination :current-page="store.currentCommitPage" :has-more="store.hasMoreCommits" :disabled="store.loading"
            @first="store.firstCommitPage()" @previous="store.previousCommitPage()" @next="store.nextCommitPage()" />
        </div>
      </section>

      <section class="section">
        <h2>Favorites ({{ store.favoritesCount }})</h2>

        <EmptyState v-if="!store.favorites.length" icon="⭐" title="No favorites yet"
          description="Star commits to save them here" />

        <div v-else class="favorite-list">
          <div v-for="fav in store.favorites" :key="fav.commit.sha" class="favorite-item">
            <div class="favorite-info">
              <p class="favorite-repo">{{ fav.repoName }}</p>
              <p class="commit-message">{{ fav.commit.commit.message }}</p>
              <p class="commit-meta">{{ fav.commit.commit.author.name }}</p>
            </div>
            <button @click="store.removeFromFavorites(fav.commit.sha)" class="btn-remove" title="Remove from favorites">
              ×
            </button>
          </div>
        </div>
      </section>
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
            <p class="commit-meta">
              {{ store.currentCommitDetail.commit.author.name }} •
              {{ formatDate(store.currentCommitDetail.commit.author.date) }}
            </p>
          </div>

          <div v-if="store.currentCommitDetail.stats" class="stats-section">
            <div class="stat">
              <span class="stat-label">Files Changed:</span>
              <span class="stat-value">{{ store.currentCommitDetail.stats.total }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Additions:</span>
              <span class="stat-value additions">+{{ store.currentCommitDetail.stats.additions }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Deletions:</span>
              <span class="stat-value deletions">-{{ store.currentCommitDetail.stats.deletions }}</span>
            </div>
          </div>

          <div v-if="store.currentCommitDetail.files" class="files-section">
            <h3>Files Changed</h3>
            <div v-for="file in store.currentCommitDetail.files" :key="file.filename" class="file-item">
              <div class="file-header">
                <span class="filename">{{ file.filename }}</span>
                <span class="file-status" :class="file.status">{{ file.status }}</span>
              </div>
              <div class="file-stats">
                <span class="additions">+{{ file.additions }}</span>
                <span class="deletions">-{{ file.deletions }}</span>
              </div>
              <pre v-if="file.patch" class="file-patch">{{ file.patch }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRepositoryStore } from '../stores/repository';
import type { Commit, Repository } from '../types/git';
import { formatDate } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorBanner from '../components/ErrorBanner.vue';
import Pagination from '../components/Pagination.vue';

const props = defineProps<{
  username: string;
}>();

const store = useRepositoryStore();
const sortOrder = ref<'newest' | 'oldest'>('newest');
const showDetailModal = ref(false);

const displayedCommits = computed(() => {
  return store.sortedCommits(sortOrder.value);
});

onMounted(() => {
  if (!store.repositories.length || store.currentUsername !== props.username) {
    store.loadRepositories(props.username);
  }
});

const selectRepo = async (repo: Repository) => {
  await store.selectRepository(repo);
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

const toggleFavorite = (commit: Commit) => {
  if (!store.selectedRepo) return;
  store.toggleFavorite(commit, store.selectedRepo.name, props.username);
};

const viewCommitDetail = async (sha: string) => {
  if (!store.selectedRepo) return;
  showDetailModal.value = true;
  await store.loadCommitDetail(props.username, store.selectedRepo.name, sha);
};

const closeModal = () => {
  showDetailModal.value = false;
  store.currentCommitDetail = null;
};
</script>

<style scoped>
.repo-container {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-block;
  color: #000;
  text-decoration: none;
  margin-bottom: 1rem;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

h1 {
  font-size: 2rem;
  color: #000;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.section {
  border: 2px solid #000;
  padding: 1.5rem;
  background: #fff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #000;
}

h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.sort-select {
  padding: 0.5rem;
  border: 2px solid #000;
  background: #fff;
  font-size: 0.875rem;
  cursor: pointer;
}

.repo-list,
.commit-list,
.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.repo-item {
  padding: 1rem;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
}

.repo-item:hover {
  border-color: #000;
}

.repo-item.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

.repo-item.active h3,
.repo-item.active p {
  color: #fff;
}

.no-description {
  color: #999;
  font-style: italic;
}

.repo-item.active .no-description {
  color: #ccc;
}

.commit-item {
  padding: 1rem;
  border: 2px solid #ddd;
}

.commit-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.commit-info {
  flex: 1;
}

.commit-message {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #000;
}

.commit-meta {
  font-size: 0.875rem;
  color: #666;
}

.commit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.btn-icon {
  padding: 0.5rem;
  background: #fff;
  border: 2px solid #ddd;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.btn-icon:hover {
  border-color: #000;
}

.btn-icon.favorited {
  background: #000;
  color: #fff;
  border-color: #000;
}

.btn-small {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 2px solid #000;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
}

.btn-small:hover:not(:disabled) {
  background: #000;
  color: #fff;
}

.favorite-item {
  padding: 1rem;
  border: 2px solid #ddd;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.favorite-info {
  flex: 1;
}

.favorite-repo {
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #000;
}

.btn-remove {
  padding: 0.25rem 0.5rem;
  background: #fff;
  border: 2px solid #000;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #000;
  color: #fff;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: #fff;
  border: 3px solid #000;
  max-width: 800px;
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

.stats-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #ddd;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
}

.stat-value.additions {
  color: #000;
}

.stat-value.deletions {
  color: #666;
}

.files-section h3 {
  margin-bottom: 1rem;
}

.file-item {
  margin-bottom: 1.5rem;
  border: 2px solid #ddd;
  padding: 1rem;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.filename {
  font-weight: 600;
  color: #000;
}

.file-status {
  padding: 0.25rem 0.5rem;
  border: 1px solid #000;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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
  border: 2px solid #000;
}

.file-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.additions {
  color: #000;
  font-weight: 600;
}

.deletions {
  color: #666;
  font-weight: 600;
}

.file-patch {
  background: #f5f5f5;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.875rem;
  border: 1px solid #ddd;
  margin-top: 0.5rem;
}
</style>