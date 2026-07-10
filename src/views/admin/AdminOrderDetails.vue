<template>
  <div class="order-detail-page">
    <div v-if="loading" class="state-msg">Đang tải...</div>
    <div v-else-if="order" class="detail-wrap">
      <div class="detail-header">
        <div>
          <h2>#{{ order.orderCode }}</h2>
          <p class="order-date">{{ formatDate(order.createdAt) }}</p>
        </div>
        <div class="badges">
          <span class="badge" :class="statusClass(order.orderStatus)">{{ statusLabel(order.orderStatus) }}</span>
          <span class="badge" :class="order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'">
            {{ order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
          </span>
        </div>
      </div>

      <div class="detail-grid">
        <div class="card info-card">
          <h4>Thông tin khách hàng</h4>
          <p><strong>Tài khoản:</strong> {{ order.customerName }}</p>
          <p><strong>Email:</strong> {{ order.customerEmail }}</p>
          <p><strong>SĐT tài khoản:</strong> {{ order.customerPhone || 'Chưa cập nhật' }}</p>
        </div>
        <div class="card info-card">
          <h4>Thông tin nhận hàng</h4>
          <p><strong>Người nhận:</strong> {{ order.receiverName }}</p>
          <p><strong>SĐT:</strong> {{ order.receiverPhone }}</p>
          <p><strong>Địa chỉ:</strong> {{ order.shippingAddress }}</p>
          <p><strong>Thanh toán:</strong> {{ order.paymentMethod }}</p>
        </div>
      </div>

      <div class="card items-card">
        <h4>Sản phẩm đã đặt</h4>
        <table class="items-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Size / Màu</th>
              <th>Đơn giá</th>
              <th>SL</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(d, i) in order.details" :key="i">
              <td>{{ d.productNameSnapshot }}</td>
              <td>{{ d.size }} / {{ d.color }}</td>
              <td>{{ formatPrice(d.unitPrice) }}</td>
              <td>{{ d.quantity }}</td>
              <td>{{ formatPrice(d.subtotal) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right; font-weight:700;">Tổng cộng:</td>
              <td style="color:var(--accent-orange); font-weight:800;">{{ formatPrice(order.totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="card status-card">
        <h4>Cập nhật trạng thái</h4>
        <div class="status-flow">
          <div v-for="s in statusFlow" :key="s.value"
            class="status-step"
            :class="{
              done: getStatusLevel(order.orderStatus) >= s.level && order.orderStatus !== 'Cancelled',
              current: order.orderStatus === s.value,
              cancelled: order.orderStatus === 'Cancelled'
            }">
            <div class="step-dot"></div>
            <p>{{ s.label }}</p>
          </div>
        </div>
        <div class="status-actions">
          <select v-model="newStatus" class="form-input" style="max-width:200px;">
            <option v-for="s in availableNextStatuses" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
          <button class="btn btn-primary" @click="updateStatus" :disabled="!newStatus || updating">
            {{ updating ? 'Đang cập nhật...' : 'Cập nhật' }}
          </button>
        </div>
        <p v-if="statusMsg" class="status-msg">{{ statusMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const order = ref(null)
const loading = ref(true)
const newStatus = ref('')
const updating = ref(false)
const statusMsg = ref('')

const statusFlow = [
  { value: 'Processing', label: 'Chờ xử lý', level: 1 },
  { value: 'Confirmed', label: 'Đã xác nhận', level: 2 },
  { value: 'Shipping', label: 'Đang giao', level: 3 },
  { value: 'Completed', label: 'Hoàn tất', level: 4 }
]

const statusMap = {
  Processing: { label: 'Chờ xử lý', cls: 'badge-info', level: 1 },
  Confirmed: { label: 'Đã xác nhận', cls: 'badge-info', level: 2 },
  Shipping: { label: 'Đang giao', cls: 'badge-warning', level: 3 },
  Completed: { label: 'Hoàn tất', cls: 'badge-success', level: 4 },
  Cancelled: { label: 'Đã hủy', cls: 'badge-danger', level: 0 }
}

function getStatusLevel(status) {
  return statusMap[status]?.level || 0
}

function statusLabel(s) { return statusMap[s]?.label || s }
function statusClass(s) { return statusMap[s]?.cls || 'badge-info' }

// Chỉ cho chuyển tiến, không cho chuyển ngược
const availableNextStatuses = computed(() => {
  if (!order.value) return []
  const current = getStatusLevel(order.value.orderStatus)
  const next = statusFlow.filter(s => s.level > current)
  if (order.value.orderStatus !== 'Cancelled' && order.value.orderStatus !== 'Completed')
    next.push({ value: 'Cancelled', label: 'Hủy đơn', level: 0 })
  return next
})

function formatPrice(v) { return new Intl.NumberFormat('vi-VN').format(v) + 'đ' }
function formatDate(d) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadOrder() {
  loading.value = true
  try {
    const { data } = await api.get(`/orders/${route.params.id}/detail`)
    order.value = data
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  if (!newStatus.value) return
  updating.value = true
  statusMsg.value = ''
  try {
    await api.put(`/orders/${order.value.orderId}/status`, { orderStatus: newStatus.value })
    statusMsg.value = 'Cập nhật trạng thái thành công!'
    newStatus.value = ''
    await loadOrder()
  } catch (err) {
    statusMsg.value = err.response?.data?.message || 'Cập nhật thất bại.'
  } finally {
    updating.value = false
  }
}

onMounted(loadOrder)
</script>

<style scoped>
.order-detail-page { padding: 24px 28px; }
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.detail-header h2 { font-size: 22px; margin-bottom: 4px; }
.order-date { font-size: 13px; color: var(--text-muted); }
.badges { display: flex; gap: 8px; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.info-card, .items-card, .status-card { padding: 20px; margin-bottom: 16px; }
.info-card h4, .items-card h4, .status-card h4 {
  font-size: 15px;
  margin-bottom: 14px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 13px;
}
.info-card p { font-size: 14px; margin-bottom: 8px; color: var(--text-secondary); }
.info-card p strong { color: var(--text-primary); }

.items-table { width: 100%; border-collapse: collapse; }
.items-table th, .items-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 14px;
}
.items-table th { color: var(--text-muted); font-size: 12px; text-transform: uppercase; }
.items-table tfoot td { border-top: 2px solid var(--border-subtle); border-bottom: none; padding-top: 14px; }

.status-flow {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
}
.status-step {
  flex: 1;
  text-align: center;
  position: relative;
}
.status-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-subtle);
}
.status-step.done::after { background: var(--accent-orange); }
.step-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg-elevated-2);
  border: 2px solid var(--border-subtle);
  margin: 0 auto 8px;
  position: relative;
  z-index: 1;
}
.status-step.done .step-dot { background: var(--accent-orange); border-color: var(--accent-orange); }
.status-step.current .step-dot { background: var(--accent-orange); border-color: var(--accent-orange); box-shadow: 0 0 0 4px rgba(255,107,53,0.2); }
.status-step p { font-size: 12px; color: var(--text-muted); }
.status-step.done p, .status-step.current p { color: var(--text-primary); font-weight: 600; }

.status-actions { display: flex; gap: 12px; align-items: center; }
.status-msg { margin-top: 10px; font-size: 14px; font-weight: 600; color: var(--success); }
.state-msg { text-align: center; padding: 60px 0; color: var(--text-muted); }

@media (max-width: 700px) {
  .detail-grid { grid-template-columns: 1fr; }
}
</style>