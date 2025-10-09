<template>
  <div id="app">
    <AppNavigation />
    <main class="main-content">
      <RouterView>
        <template #default="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </template>
      </RouterView>
    </main>
    <ScrollToTop />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import ScrollToTop from './components/ScrollToTop.vue'
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>