<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal-box">
        <div class="modal-icon" :class="type">
          {{ type === 'danger' ? '⚠️' : '❓' }}
        </div>
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">
            Hủy
          </button>
          <button class="btn" :class="type === 'danger' ? 'btn-danger' : 'btn-primary'" @click="confirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Xác nhận' },
  message: { type: String, default: 'Bạn có chắc muốn thực hiện hành động này?' },
  confirmText: { type: String, default: 'Xác nhận' },
  type: { type: String, default: 'danger' } // 'danger' hoặc 'primary'
})

const emit = defineEmits(['update:modelValue', 'confirm'])

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
}

.modal-box {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-card);
  animation: pop-in 0.2s ease;
}

@keyframes pop-in {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.modal-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.modal-message {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 28px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-actions .btn {
  min-width: 110px;
}

.btn-danger {
  background: var(--danger);
  color: #fff;
}
.btn-danger:hover {
  background: #c0392b;
}
</style>