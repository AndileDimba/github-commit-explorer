<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <span class="modal-icon">{{ icon }}</span>
            <h2 class="modal-title">{{ title }}</h2>
          </div>

          <div class="modal-body">
            <p class="modal-message">{{ message }}</p>
          </div>

          <div class="modal-footer">
            <button @click="handleCancel" class="modal-button secondary">
              {{ cancelText }}
            </button>
            <button @click="handleConfirm" class="modal-button primary danger">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  icon: '⚠️'
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
}>();

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  emit('cancel');
  emit('close');
};

const handleOverlayClick = () => {
  emit('cancel');
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  font-size: 0.9375rem;
  color: var(--color-gray-600);
  line-height: 1.6;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid var(--color-gray-200);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-button {
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.modal-button.secondary {
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
}

.modal-button.secondary:hover {
  background: var(--color-gray-100);
  color: var(--color-black);
  border-color: var(--color-gray-400);
}

.modal-button.primary {
  background: var(--color-blue);
  color: #FFFFFF;
}

.modal-button.primary:hover {
  background: var(--color-blue-dark);
}

.modal-button.danger {
  background: #EF4444;
}

.modal-button.danger:hover {
  background: #DC2626;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-button {
    width: 100%;
    justify-content: center;
  }
}
</style>