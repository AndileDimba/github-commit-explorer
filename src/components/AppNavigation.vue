<template>
  <nav class="app-nav">
    <div class="nav-container">
      <router-link to="/" class="nav-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">GitHub Explorer</span>
      </router-link>

      <button class="mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
        <span class="hamburger" :class="{ open: mobileMenuOpen }"></span>
      </button>

      <div class="nav-links" :class="{ 'mobile-open': mobileMenuOpen }">
        <router-link 
          v-if="route.path !== '/'"
          to="/" 
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          <span class="link-icon">🏠</span>
          <span class="link-text">Home</span>
        </router-link>

        <router-link 
          to="/favorites" 
          class="nav-link"
          @click="mobileMenuOpen = false"
        >
          <span class="link-icon">⭐</span>
          <span class="link-text">Favorites</span>
          <span v-if="store.favoritesCount > 0" class="badge">
            {{ store.favoritesCount }}
          </span>
        </router-link>

        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          class="nav-link nav-link-external"
          @click="mobileMenuOpen = false"
        >
          <span class="link-icon">↗</span>
          <span class="link-text">GitHub</span>
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRepositoryStore } from '../stores/repository';

const route = useRoute();
const store = useRepositoryStore();
const mobileMenuOpen = ref(false);
</script>

<style scoped>
.app-nav {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-black);
  font-weight: 700;
  font-size: 1.125rem;
  transition: all var(--transition-base);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
}

.nav-brand:hover {
  background: var(--color-gray-100);
  transform: translateY(-1px);
}

.brand-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

.brand-text {
  font-weight: 700;
  letter-spacing: -0.5px;
}

.mobile-toggle {
  display: none;
  background: none;
  border: 1px solid var(--color-gray-300);
  padding: 0.5rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  position: relative;
  transition: all var(--transition-base);
  border-radius: var(--radius-md);
}

.mobile-toggle:hover {
  background: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.hamburger {
  display: block;
  position: relative;
  width: 24px;
  height: 2px;
  background: var(--color-black);
  transition: all var(--transition-base);
  border-radius: 2px;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: var(--color-black);
  transition: all var(--transition-base);
  border-radius: 2px;
}

.hamburger::before {
  top: -8px;
}

.hamburger::after {
  bottom: -8px;
}

.hamburger.open {
  background: transparent;
}

.hamburger.open::before {
  transform: rotate(45deg);
  top: 0;
}

.hamburger.open::after {
  transform: rotate(-45deg);
  bottom: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  text-decoration: none;
  color: var(--color-gray-700);
  font-weight: 500;
  font-size: 0.9375rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
  background: transparent;
}

.nav-link:hover {
  background: var(--color-gray-100);
  color: var(--color-black);
}

.nav-link.router-link-active {
  background: var(--color-blue);
  color: var(--color-white);
  font-weight: 600;
}

.nav-link.router-link-active:hover {
  background: var(--color-blue-dark);
}

.link-icon {
  font-size: 1.125rem;
  display: flex;
  align-items: center;
}

.link-text {
  font-weight: 500;
}

.nav-link.router-link-active .link-text {
  font-weight: 600;
}

.badge {
  background: var(--color-white);
  color: var(--color-blue);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  line-height: 1.5;
}

.nav-link.router-link-active .badge {
  background: var(--color-white);
  color: var(--color-blue);
}

.nav-link-external {
  border: 1px solid var(--color-gray-300);
  color: var(--color-black);
}

.nav-link-external:hover {
  background: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
    height: 60px;
  }

  .mobile-toggle {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--color-white);
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-gray-200);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
    box-shadow: var(--shadow-lg);
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 0.875rem 1rem;
  }

  .brand-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .brand-text {
    display: none;
  }

  .nav-brand {
    padding: 0.5rem;
  }
}
</style>