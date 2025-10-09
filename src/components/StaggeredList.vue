<template>
  <TransitionGroup 
    name="stagger" 
    tag="div" 
    class="staggered-list"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
  >
    <slot></slot>
  </TransitionGroup>
</template>

<script setup lang="ts">
const onBeforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.opacity = '0';
  htmlEl.style.transform = 'translateY(20px)';
};

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement;
  const delay = (el as HTMLElement).dataset.index 
    ? parseInt((el as HTMLElement).dataset.index!) * 50 
    : 0;
  
  setTimeout(() => {
    htmlEl.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    htmlEl.style.opacity = '1';
    htmlEl.style.transform = 'translateY(0)';
    done();
  }, delay);
};
</script>

<style scoped>
.staggered-list {
  display: contents;
}

.stagger-move {
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.stagger-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.stagger-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>