<template>
  <nav class="app-nav">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <span class="brand-icon">🔍</span>
        <span class="brand-text">Git Explorer</span>
      </router-link>
      
      <div class="nav-links">
        <router-link 
          v-if="store.currentUsername" 
          :to="`/users/${store.currentUsername}`" 
          class="nav-link"
        >
          Repositories
        </router-link>
        <router-link to="/favorites" class="nav-link">
          <span>Favorites</span>
          <span v-if="store.favoritesCount > 0" class="badge">{{ store.favoritesCount }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRepositoryStore } from '../stores/repository';

const store = useRepositoryStore();
</script>

<style scoped>
.app-nav {
  background: #000;
  color: #fff;
  border-bottom: 3px solid #000;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  transition: opacity 0.2s;
}

.nav-brand:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #fff;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.nav-link:hover {
  border-color: #fff;
}

.nav-link.router-link-active {
  background: #fff;
  color: #000;
  border-color: #fff;
}

.badge {
  background: #fff;
  color: #000;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.nav-link.router-link-active .badge {
  background: #000;
  color: #fff;
}

@media (max-width: 640px) {
  .nav-container {
    padding: 1rem;
  }
  
  .brand-text {
    display: none;
  }
  
  .nav-links {
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>