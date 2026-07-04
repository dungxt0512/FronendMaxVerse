<template>
  <div class="container profile-page">
  <BackButton />
  <h1 class="heading-display page-title">HỒ SƠ CÁ NHÂN</h1>

    <div class="profile-layout">
      <form class="profile-form card" @submit.prevent="handleSubmit">
        <h3>Thông tin cá nhân</h3>
        <p class="profile-hint">
          Thông tin này sẽ được tự động điền khi bạn đặt hàng.
        </p>

        <div class="form-group">
          <label class="form-label">Họ và tên</label>
          <input v-model="form.fullName" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input :value="auth.user?.email" type="email" class="form-input" disabled
            style="opacity:0.5; cursor:not-allowed;" />
          <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">
            Email không thể thay đổi
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Số điện thoại</label>
          <input v-model="form.phoneNumber" type="tel" class="form-input"
            placeholder="VD: 0901234567" />
        </div>

        <div class="form-group">
          <label class="form-label">Địa chỉ mặc định</label>
          <textarea v-model="form.address" class="form-input" rows="3"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"></textarea>
        </div>

        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Đang lưu...' : 'Lưu thông tin' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import BackButton from '../components/BackButton.vue'

const auth = useAuthStore()
const submitting = ref(false)
const error = ref('')
const successMsg = ref('')

const form = reactive({
  fullName: '',
  phoneNumber: '',
  address: ''
})

async function loadProfile() {
  try {
    const { data } = await api.get('/auth/profile')
    form.fullName = data.fullName || ''
    form.phoneNumber = data.phoneNumber || ''
    form.address = data.address || ''
  } catch (err) {
    error.value = 'Không thể tải thông tin hồ sơ.'
  }
}

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  successMsg.value = ''
  try {
    await api.put('/auth/profile', form)
    successMsg.value = 'Cập nhật hồ sơ thành công!'
    if (auth.user) {
      auth.user.fullName = form.fullName
      localStorage.setItem('maxverse_user', JSON.stringify(auth.user))
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Cập nhật thất bại.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-page { padding: 32px 24px 80px; }
.page-title { font-size: 32px; margin-bottom: 24px; }

.profile-layout {
  max-width: 560px;
}

.profile-form { padding: 32px; }
.profile-form h3 { margin-bottom: 8px; font-size: 17px; }

.profile-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
  padding: 10px 14px;
  background: rgba(61, 90, 254, 0.08);
  border-left: 3px solid var(--accent-blue);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.success-msg {
  color: var(--success);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}
</style>