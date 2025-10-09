<template>
  <Transition name="fade-up">
    <button 
      v-if="isVisible" 
      class="scroll-to-top"
      @click="scrollToTop"
      aria-label="Scroll to top"
    >
      <span class="arrow">↑</span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);

const handleScroll = () => {
  isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.scroll-to-top:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  background: #fff;
  color: #000;
}

.scroll-to-top:active {
  transform: translateY(-2px) scale(1.05);
}

.arrow {
  animation: bounce-arrow 1.5s ease-in-out infinite;
}

@keyframes bounce-arrow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

@media (max-width: 640px) {
  .scroll-to-top {
    bottom: 1rem;
    right: 1rem;
    width: 45px;
    height: 45px;
  }
}
</style>