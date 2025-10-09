<template>
  <div class="repo-commits-container">
    <header class="page-header">
      <div class="breadcrumb">
        <router-link :to="`/users/${username}`" class="breadcrumb-link">
          @{{ username }}
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ repo }}</span>
      </div>
      
      <div class="header-actions">
        <a 
          :href="`https://github.com/${username}/${repo}`" 
          target="_blank" 
          rel="noopener noreferrer"
          class="github-button"
        >
          <span>View on GitHub</span>
          <span class="github-icon">⧉</span>
        </a>
      </div>
    </header>

    <ErrorBanner
      v-if="store.error"
      :message="store.error"
      :dismissible="true"
      @dismiss="store.clearError()"
    />

    <div class="commits-section">
      <div class="section-header">
        <h1>Commits</h1>
        <select v-model="sortOrder" class="sort-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <LoadingSpinner 
        v-if="store.loading && !store.commits.length" 
        message="Loading commits..." 
      />

      <EmptyState
        v-else-if="!displayedCommits.length && !store.loading"
        icon="📝"
        title="No commits found"
        description="This repository doesn't have any commits yet."
      />

      <div v-else>
        <div class="commits-list">
          <div
            v-for="commit in displayedCommits"
            :key="commit.sha"
            class="commit-card"
          >
            <div class="commit-main">
              <div class="commit-info">
                <h3 class="commit-message">{{ commit.commit.message }}</h3>
                <div class="commit-meta">
                  <span class="commit-author">{{ commit.commit.author.name }}</span>
                  <span class="meta-separator">•</span>
                  <span class="commit-date">{{ formatDate(commit.commit.author.date) }}</span>
                  <span class="meta-separator">•</span>
                  <a 
                    :href="commit.html_url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="commit-sha"
                    @click.stop
                  >
                    {{ commit.sha.substring(0, 7) }}
                  </a>
                </div>
              </div>

              <div class="commit-actions">
                <button
                  @click="toggleFavorite(commit)"
                  class="btn-icon"
                  :class="{ favorited: store.isFavorite(commit.sha) }"
                  :title="store.isFavorite(commit.sha) ? 'Remove from favorites' : 'Add to favorites'"
                >
                  {{ store.isFavorite(commit.sha) ? '★' : '☆' }}
                </button>
                <button
                  @click="viewCommitDetail(commit.sha)"
                  class="btn-detail"
                >
                  View Diff
                </button>
              </div>
            </div>
          </div>
        </div>

        <Pagination
          :current-page="store.currentCommitPage"
          :has-more="store.hasMoreCommits"
          :disabled="store.loading"
          @first="store.firstCommitPage()"
          @previous="store.previousCommitPage()"
          @next="store.nextCommitPage()"
        />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRepositoryStore } from '../stores/repository';
import type { Commit } from '../types/git';
import { formatDate } from '../utils/date';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorBanner from '../components/ErrorBanner.vue';
import Pagination from '../components/Pagination.vue';

const props = defineProps<{
  username: string;
  repo: string;
}>();

const store = useRepositoryStore();
const sortOrder = ref<'newest' | 'oldest'>('newest');
const showDetailModal = ref(false);

const displayedCommits = computed(() => {
  return store.sortedCommits(sortOrder.value);
});

onMounted(async () => {
  await store.loadCommits(props.username, props.repo);
  
  const repo = store.repositories.find(r => r.name === props.repo);
  if (repo) {
    store.selectedRepo = repo;
  }
});

const toggleFavorite = (commit: Commit) => {
  store.toggleFavorite(commit, props.repo, props.username);
};

const viewCommitDetail = async (sha: string) => {
  showDetailModal.value = true;
  await store.loadCommitDetail(props.username, props.repo, sha);
};

const closeModal = () => {
  showDetailModal.value = false;
  store.currentCommitDetail = null;
};
</script>

<style scoped>
.repo-commits-container {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
}

.breadcrumb-link {
  color: #000;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.breadcrumb-link:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #666;
}

.breadcrumb-current {
  font-weight: 700;
  color: #000;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.github-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.github-button:hover {
  background: #fff;
  color: #000;
}

.commits-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h1 {
  font-size: 1.75rem;
  color: #000;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 2px solid #000;
  background: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.commits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.commit-card {
  border: 2px solid #000;
  padding: 1.5rem;
  background: #fff;
  transition: all 0.2s;
}

.commit-card:hover {
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
}

.commit-main {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
}

.commit-info {
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

.commit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  flex-shrink: 0;
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

/* Modal Styles */
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

@media (max-width: 768px) {
  .repo-commits-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .breadcrumb {
    font-size: 1.25rem;
  }

  .commit-main {
    flex-direction: column;
  }

  .commit-actions {
    align-self: flex-start;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .file-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>