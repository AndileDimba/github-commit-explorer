<template>
  <div class="home-container">
    <div class="home-content">
      <h1>GitHub Commit Explorer</h1>
      <p class="subtitle">Explore repositories and commits from any GitHub user</p>
      
      <form @submit.prevent="handleSubmit" class="search-form">
        <div class="form-group">
          <label for="username">GitHub Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="e.g., octocat"
            :class="{ 'input-error': errors.username }"
            @input="clearError"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Searching...' : 'Explore Repositories' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGithubStore } from '../stores/github';

const router = useRouter();
const store = useGithubStore();

const username = ref('');
const errors = ref<{ username?: string }>({});
const loading = ref(false);

const validateUsername = (): boolean => {
  errors.value = {};
  
  if (!username.value.trim()) {
    errors.value.username = 'Username is required';
    return false;
  }
  
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username.value)) {
    errors.value.username = 'Invalid GitHub username format';
    return false;
  }
  
  return true;
};

const clearError = () => {
  errors.value = {};
};

const handleSubmit = async () => {
  if (!validateUsername()) return;
  
  loading.value = true;
  await store.fetchRepositories(username.value);
  loading.value = false;
  
  if (store.error) {
    errors.value.username = store.error;
  } else {
    router.push(`/repos/${username.value}`);
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.home-content {
  max-width: 500px;
  width: 100%;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #000;
}

input {
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  background: #fff;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #000;
}

input.input-error {
  border-color: #000;
}

.error-message {
  color: #000;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-primary {
  padding: 0.875rem 1.5rem;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #fff;
  color: #000;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>