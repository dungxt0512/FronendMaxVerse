<template>
  <div class="promo-page">
    <div class="page-header">
      <h1 class="heading-display page-title">KHUYẾN MÃI</h1>
      <button class="btn btn-primary" @click="openForm()">+ Thêm mã</button>
    </div>

    <div v-if="loading" class="state-msg">Đang tải...</div>
    <table v-else class="admin-table card">
      <thead>
        <tr>
          <th>Mã</th>
          <th>Mô tả</th>
          <th>Giảm</th>
          <th>Đơn tối thiểu</th>
          <th>Đã dùng</th>
          <th>Hết hạn</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in promotions" :key="p.promotionId">
          <td><strong>{{ p.code }}</strong></td>
          <td>{{ p.description }}</td>
          <td>{{ p.discountType === 'Percent' ? p.discountValue + '%' : formatPrice(p.discountValue) }}</td>
          <td>{{ formatPrice(p.minOrderAmount) }}</td>
          <td>{{ p.usedCount }}/{{ p.maxUsage }}</td>
          <td>{{ formatDate(p.endDate) }}</td>
          <td>
            <span class="badge" :class="p.isActive ? 'badge-success' : 'badge-danger'">
              {{ p.isActive ? 'Đang hoạt động' : 'Tắt' }}
            </span>
          </td>
          <td>
            <button class="action-btn edit" @click="openForm(p)">Sửa</button>
            <button class="action-btn delete" @click="deletePromo(p)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- FORM THÊM/SỬA -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-box card">
        <h3>{{ editingId ? 'Sửa mã khuyến mãi' : 'Thêm mã khuyến mãi' }}</h3>

        <div class="form-group">
          <label class="form-label">Mã giảm giá</label>
          <input v-model="form.code" type="text" class="form-input" style="text-transform:uppercase;" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mô tả</label>
          <input v-model="form.description" type="text" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Loại giảm</label>
            <select v-model="form.discountType" class="form-input">
              <option value="Percent">Phần trăm (%)</option>
              <option value="Fixed">Số tiền cố định (đ)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Giá trị giảm</label>
            <input v-model.number="form.discountValue" type="number" class="form-input" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Đơn tối thiểu (đ)</label>
            <input v-model.number="form.minOrderAmount" type="number" class="form-input" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Số lần dùng tối đa</label>
            <input v-model.number="form.maxUsage" type="number" class="form-input" min="1" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Ngày bắt đầu</label>
            <input v-model="form.startDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Ngày kết thúc</label>
            <input v-model="form.endDate" type="date" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="filter-check">
            <input type="checkbox" v-model="form.isActive" />
            Đang hoạt động
          </label>
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <div class="form-actions">
          <button class="btn btn-secondary" @click="showForm = false">Hủy</button>
          <button class="btn btn-primary" @click="savePromo" :disabled="saving">
            {{ saving ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '../../services/api'

const promotions = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)
const formError = ref('')

const form = reactive({
  code: '', description: '', discountType: 'Percent',
  discountValue: 10, minOrderAmount: 0, maxUsage: 100,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '2026-12-31', isActive: true
})

function openForm(promo = null) {
  editingId.value = promo?.promotionId || null
  if (promo) {
    Object.assign(form, {
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount,
      maxUsage: promo.maxUsage,
      startDate: promo.startDate?.split('T')[0],
      endDate: promo.endDate?.split('T')[0],
      isActive: promo.isActive
    })
  } else {
    Object.assign(form, {
      code: '', description: '', discountType: 'Percent',
      discountValue: 10, minOrderAmount: 0, maxUsage: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31', isActive: true
    })
  }
  formError.value = ''
  showForm.value = true
}

async function savePromo() {
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await api.put(`/promotions/${editingId.value}`, form)
    } else {
      await api.post('/promotions', form)
    }
    showForm.value = false
    await loadPromotions()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Lưu thất bại.'
  } finally {
    saving.value = false
  }
}

async function deletePromo(promo) {
  if (!window.confirm(`Xóa mã "${promo.code}"?`)) return
  await api.delete(`/promotions/${promo.promotionId}`)
  await loadPromotions()
}

async function loadPromotions() {
  loading.value = true
  try {
    const { data } = await api.get('/promotions')
    promotions.value = data
  } finally {
    loading.value = false
  }
}

function formatPrice(v) { return new Intl.NumberFormat('vi-VN').format(v) + 'đ' }
function formatDate(d) { return new Date(d).toLocaleDateString('vi-VN') }

onMounted(loadPromotions)
</script>

<style scoped>
.promo-page { padding: 24px 28px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 28px; }

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th, .admin-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 14px;
}
.admin-table th { color: var(--text-muted); font-size: 12px; text-transform: uppercase; }
.action-btn { padding: 5px 10px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; margin-right: 4px; }
.action-btn.edit { background: rgba(61,90,254,0.15); color: var(--accent-blue); }
.action-btn.delete { background: rgba(231,76,60,0.15); color: var(--danger); }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal-box {
  width: 100%; max-width: 540px;
  padding: 28px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-box h3 { margin-bottom: 20px; font-size: 17px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.state-msg { text-align: center; padding: 60px 0; color: var(--text-muted); }
</style>