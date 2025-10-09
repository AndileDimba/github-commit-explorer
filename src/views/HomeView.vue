<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-main">GitHub Commit Explorer</span>
          <span class="title-sub">Explore repositories and commits with ease</span>
        </h1>
        
        <form @submit.prevent="handleSubmit" class="search-form">
          <div class="form-group">
            <label for="username" class="form-label">GitHub Username</label>
            <div class="input-wrapper">
              <span class="input-icon">@</span>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="octocat"
                class="form-input"
                :class="{ 'input-error': error }"
                @input="clearError"
              />
            </div>
            <p v-if="error" class="error-message">{{ error }}</p>
          </div>
          
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="loading || !username.trim()"
          >
            <span v-if="!loading">Explore Repositories</span>
            <span v-else class="loading-text">
              <span class="spinner"></span>
              Loading...
            </span>
          </button>
        </form>

        <div class="quick-links">
          <p class="quick-links-label">Try these popular users:</p>
          <div class="quick-links-buttons">
            <button 
              v-for="user in popularUsers" 
              :key="user"
              @click="quickSearch(user)"
              class="quick-link-btn"
              :disabled="loading"
            >
              @{{ user }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3 class="feature-title">Browse Repositories</h3>
          <p class="feature-description">Explore public repositories from any GitHub user</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3 class="feature-title">View Commits</h3>
          <p class="feature-description">See detailed commit history with diffs and changes</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <h3 class="feature-title">Save Favorites</h3>
          <p class="feature-description">Bookmark important commits for quick access later</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const error = ref('');
const loading = ref(false);

const popularUsers = ['octocat', 'torvalds', 'gaearon', 'tj'];

const validateUsername = (value: string): boolean => {
  if (!value.trim()) {
    error.value = 'Username is required';
    return false;
  }
  
  if (!/^[a-zA-Z0-9-]+$/.test(value)) {
    error.value = 'Username can only contain letters, numbers, and hyphens';
    return false;
  }
  
  if (value.length > 39) {
    error.value = 'Username is too long';
    return false;
  }
  
  return true;
};

const clearError = () => {
  error.value = '';
};

const handleSubmit = async () => {
  if (!validateUsername(username.value)) {
    return;
  }
  
  loading.value = true;
  
  // Simulate a small delay for better UX
  await new Promise(resolve => setTimeout(resolve, 300));
  
  router.push(`/users/${username.value.trim()}`);
  loading.value = false;
};

const quickSearch = (user: string) => {
  username.value = user;
  handleSubmit();
};
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-white) 100%);
}

.hero-section {
  padding: 4rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.hero-content {
  max-width: 600px;
  width: 100%;
}

.hero-title {
  text-align: center;
  margin-bottom: 3rem;
}

.title-main {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-black);
  margin-bottom: 0.75rem;
  letter-spacing: -1px;
  line-height: 1.2;
}

.title-sub {
  display: block;
  font-size: 1.125rem;
  font-weight: 400;
  color: var(--color-gray-600);
  line-height: 1.5;
}

.search-form {
  background: var(--color-white);
  padding: 2rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-gray-200);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--color-gray-400);
  font-size: 1.125rem;
  font-weight: 600;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  font-size: 1rem;
  border: 2px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-family: 'Inter', sans-serif;
  background: var(--color-white);
  color: var(--color-black);
}

.form-input:hover {
  border-color: var(--color-gray-400);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
}

.form-input.input-error {
  border-color: var(--color-red);
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-red);
  font-weight: 500;
}

.btn-primary {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-white);
  background: var(--color-blue);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-blue-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-white);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.quick-links {
  margin-top: 2rem;
  text-align: center;
}

.quick-links-label {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.quick-links-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-link-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: 'Inter', sans-serif;
}

.quick-link-btn:hover:not(:disabled) {
  background: var(--color-gray-100);
  border-color: var(--color-gray-400);
  transform: translateY(-1px);
}

.quick-link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.features-section {
  padding: 4rem 2rem;
  background: var(--color-white);
  border-top: 1px solid var(--color-gray-200);
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: var(--radius-lg);
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  transition: all var(--transition-base);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-blue);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-black);
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.9375rem;
  color: var(--color-gray-600);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1rem;
    min-height: 400px;
  }

  .title-main {
    font-size: 2rem;
  }

  .title-sub {
    font-size: 1rem;
  }

  .search-form {
    padding: 1.5rem;
  }

  .features-section {
    padding: 3rem 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>