<template>
  <button 
    class="animated-button" 
    :class="[variant, { loading: isLoading, disabled: disabled }]"
    :disabled="disabled || isLoading"
    @click="handleClick"
  >
    <span class="button-content" :class="{ hidden: isLoading }">
      <slot></slot>
    </span>
    <span v-if="isLoading" class="button-loader">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

<style scoped>
.animated-button {
  position: relative;
  padding: 0.75rem 1.5rem;
  border: 2px solid #000;
  background: #000;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  min-width: 120px;
}

.animated-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.animated-button:hover::before {
  width: 300px;
  height: 300px;
}

.animated-button:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.animated-button:active {
  transform: translateY(0);
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.animated-button.secondary {
  background: #fff;
  color: #000;
}

.animated-button.secondary:hover {
  background: #000;
  color: #fff;
}

.animated-button.ghost {
  background: transparent;
  color: #000;
}

.animated-button.ghost:hover {
  background: #000;
  color: #fff;
}

.animated-button.disabled,
.animated-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.animated-button.disabled:hover,
.animated-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

.button-content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.3s;
}

.button-content.hidden {
  opacity: 0;
}

.button-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 0.25rem;
  z-index: 2;
}

.dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>