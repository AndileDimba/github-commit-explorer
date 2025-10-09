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
import { useRepositoryStore } from '../stores/repository';
import { useRoute } from 'vue-router';

const route = useRoute();
const store = useRepositoryStore();
const mobileMenuOpen = ref(false);
</script>

<style scoped>
.app-nav {
  background: #fff;
  border-bottom: 2px solid #000;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #000;
  font-weight: 700;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
}

.nav-brand:hover {
  border-color: #000;
  transform: translateY(-2px);
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
  border: 2px solid #000;
  padding: 0.5rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  position: relative;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: #000;
}

.hamburger {
  display: block;
  position: relative;
  width: 24px;
  height: 2px;
  background: #000;
  transition: all 0.3s ease;
}

.mobile-toggle:hover .hamburger {
  background: #fff;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: #000;
  transition: all 0.3s ease;
}

.mobile-toggle:hover .hamburger::before,
.mobile-toggle:hover .hamburger::after {
  background: #fff;
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
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: #000;
  font-weight: 600;
  font-size: 0.95rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
  background: #fff;
}

.nav-link:hover {
  background: #000;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-link.router-link-active {
  background: #000;
  color: #fff;
  border-color: #000;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #000;
}

.link-icon {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.link-text {
  font-weight: 600;
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
  border: 1px solid #000;
}

.nav-link:hover .badge,
.nav-link.router-link-active .badge {
  background: #000;
  color: #fff;
  border-color: #fff;
}

.nav-link-external {
  border: 2px solid #000;
}

.nav-link-external:hover {
  background: #000;
  color: #fff;
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
    background: #fff;
    flex-direction: column;
    gap: 0;
    padding: 1rem;
    border-bottom: 2px solid #000;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem 1.25rem;
    border: 2px solid #000;
    margin-bottom: 0.5rem;
  }

  .nav-link:hover {
    transform: translateX(4px);
  }

  .nav-link.router-link-active::after {
    display: none;
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