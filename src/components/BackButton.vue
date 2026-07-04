<template>
  <button class="back-btn" @click="goBack">
    ← Quay lại
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 8px 0;
  margin-bottom: 16px;
  transition: color 0.15s ease;
  background: none;
  border: none;
  cursor: pointer;
}
.back-btn:hover {
  color: var(--accent-orange);
}
</style>