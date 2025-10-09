<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <h2 class="modal-title">Commit Details</h2>
            <span class="commit-sha-badge">{{ commitSha.substring(0, 7) }}</span>
          </div>
          <button @click="$emit('close')" class="close-button" aria-label="Close modal">
            <span class="close-icon">✕</span>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="loading" class="loading-state">
            <div class="spinner-large"></div>
            <p class="loading-text">Loading commit details...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <span class="error-icon">⚠️</span>
            <p class="error-text">{{ error }}</p>
            <button @click="loadDetails" class="retry-button">Retry</button>
          </div>

          <div v-else-if="commitDetails" class="commit-details">
            <div class="commit-info-section">
              <h3 class="section-title">Commit Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Message:</span>
                  <span class="info-value">{{ commitDetails.commit.message }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Author:</span>
                  <span class="info-value">{{ commitDetails.commit.author.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date:</span>
                  <span class="info-value">{{ formatDate(commitDetails.commit.author.date) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">SHA:</span>
                  <span class="info-value sha-value">{{ commitDetails.sha }}</span>
                </div>
              </div>
            </div>

            <div class="stats-section">
              <h3 class="section-title">Statistics</h3>
              <div class="stats-grid">
                <div class="stat-card stat-files">
                  <span class="stat-icon">📄</span>
                  <div class="stat-content">
                    <span class="stat-value">{{ commitDetails.files?.length || 0 }}</span>
                    <span class="stat-label">Files Changed</span>
                  </div>
                </div>
                <div class="stat-card stat-additions">
                  <span class="stat-icon">+</span>
                  <div class="stat-content">
                    <span class="stat-value">{{ commitDetails.stats?.additions || 0 }}</span>
                    <span class="stat-label">Additions</span>
                  </div>
                </div>
                <div class="stat-card stat-deletions">
                  <span class="stat-icon">−</span>
                  <div class="stat-content">
                    <span class="stat-value">{{ commitDetails.stats?.deletions || 0 }}</span>
                    <span class="stat-label">Deletions</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="commitDetails.files && commitDetails.files.length > 0" class="files-section">
              <h3 class="section-title">
                <span class="files-icon">📁</span>
                Changed Files
              </h3>
              <div class="files-list">
                <div
                  v-for="file in commitDetails.files"
                  :key="file.filename"
                  class="file-item"
                >
                  <div class="file-header">
                    <div class="file-info">
                      <span class="file-icon">📄</span>
                      <span class="file-name">{{ file.filename }}</span>
                    </div>
                    <div class="file-stats">
                      <span class="file-status" :class="`status-${file.status}`">
                        {{ file.status }}
                      </span>
                      <span v-if="file.additions" class="file-additions">+{{ file.additions }}</span>
                      <span v-if="file.deletions" class="file-deletions">−{{ file.deletions }}</span>
                    </div>
                  </div>

                  <div v-if="file.patch" class="file-diff">
                    <pre class="diff-content"><code>{{ file.patch }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <a
            v-if="commitDetails"
            :href="commitDetails.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link-btn"
          >
            <span class="btn-icon">↗</span>
            View on GitHub
          </a>
          <button @click="$emit('close')" class="close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRepositoryStore } from '../stores/repository';
import { formatDate } from '../utils/date';
import type { CommitDetail } from '../types/git';

const props = defineProps<{
  username: string;
  repoName: string;
  commitSha: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = useRepositoryStore();
const commitDetails = ref<CommitDetail | null>(null);
const loading = ref(true);
const error = ref('');

const loadDetails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await store.loadCommitDetail(props.username, props.repoName, props.commitSha);
    commitDetails.value = store.currentCommitDetail;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load commit details';
  } finally {
    loading.value = false;
  }
};

const handleOverlayClick = () => {
  emit('close');
};

onMounted(() => {
  loadDetails();
  document.body.style.overflow = 'hidden';
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: #1E1E1E;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
  border: 1px solid #2D2D2D;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #2D2D2D;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #252526;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #CCCCCC;
  margin: 0;
}

.commit-sha-badge {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  background: #3E3E42;
  color: #4EC9B0;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  color: #CCCCCC;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.close-button:hover {
  background: #3E3E42;
  color: #FFFFFF;
}

.close-icon {
  display: block;
  line-height: 1;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #1E1E1E;
}

.modal-body::-webkit-scrollbar {
  width: 12px;
}

.modal-body::-webkit-scrollbar-track {
  background: #1E1E1E;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #3E3E42;
  border-radius: 6px;
  border: 3px solid #1E1E1E;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #4E4E52;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #3E3E42;
  border-top-color: #0070F3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #CCCCCC;
  font-size: 0.9375rem;
}

.error-icon {
  font-size: 3rem;
}

.error-text {
  color: #F48771;
  font-size: 1rem;
  text-align: center;
}

.retry-button {
  padding: 0.625rem 1.25rem;
  background: #0070F3;
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: 'Inter', sans-serif;
}

.retry-button:hover {
  background: #0051CC;
}

.commit-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #CCCCCC;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.files-icon {
  font-size: 1rem;
}

.commit-info-section {
  background: #252526;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid #2D2D2D;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #858585;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.9375rem;
  color: #CCCCCC;
  word-break: break-word;
}

.sha-value {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8125rem;
  color: #4EC9B0;
}

.stats-section {
  background: #252526;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid #2D2D2D;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #1E1E1E;
  padding: 1rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border: 1px solid #2D2D2D;
}

.stat-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-weight: 700;
}

.stat-files .stat-icon {
  background: rgba(78, 201, 176, 0.15);
  color: #4EC9B0;
}

.stat-additions .stat-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.stat-deletions .stat-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #CCCCCC;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #858585;
  font-weight: 500;
}

.files-section {
  background: #252526;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid #2D2D2D;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-item {
  background: #1E1E1E;
  border: 1px solid #2D2D2D;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.file-header {
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #252526;
  border-bottom: 1px solid #2D2D2D;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.file-name {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8125rem;
  color: #CCCCCC;
  font-weight: 500;
  word-break: break-all;
}

.file-stats {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}

.file-status {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-added {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}

.status-modified {
  background: rgba(0, 112, 243, 0.15);
  color: #0070F3;
}

.status-removed {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.status-renamed {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
}

.file-additions {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: #10B981;
  font-weight: 600;
}

.file-deletions {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.75rem;
  color: #EF4444;
  font-weight: 600;
}

.file-diff {
  background: #1E1E1E;
  overflow-x: auto;
}

.file-diff::-webkit-scrollbar {
  height: 8px;
}

.file-diff::-webkit-scrollbar-track {
  background: #1E1E1E;
}

.file-diff::-webkit-scrollbar-thumb {
  background: #3E3E42;
  border-radius: 4px;
}

.diff-content {
  margin: 0;
  padding: 1rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #CCCCCC;
  white-space: pre;
  overflow-x: auto;
}

.diff-content code {
  font-family: inherit;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #2D2D2D;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background: #252526;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.github-link-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #0070F3;
  color: #FFFFFF;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  transition: all var(--transition-base);
  font-family: 'Inter', sans-serif;
}

.github-link-btn:hover {
  background: #0051CC;
}

.btn-icon {
  font-size: 1rem;
}

.close-btn {
  padding: 0.625rem 1rem;
  background: transparent;
  color: #CCCCCC;
  border: 1px solid #3E3E42;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: 'Inter', sans-serif;
}

.close-btn:hover {
  background: #3E3E42;
  color: #FFFFFF;
}

@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .file-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .file-stats {
    width: 100%;
    justify-content: flex-start;
  }

  .modal-footer {
    flex-direction: column-reverse;
    padding: 1rem;
  }

  .github-link-btn,
  .close-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>