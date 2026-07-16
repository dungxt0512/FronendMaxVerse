<template>
  <div class="pos-page">
    <div class="pos-layout">

      <!-- CỘT TRÁI: Danh sách sản phẩm -->
      <div class="pos-products">
        <input v-model="keyword" type="text" class="form-input" placeholder="Tìm sản phẩm..." @input="searchProducts" style="margin-bottom:16px;" />

        <div class="product-grid-pos">
          <div v-for="p in products" :key="p.productId" class="pos-product-card card" @click="selectProduct(p)">
            <img :src="resolveImageUrl(p.imageUrl)" :alt="p.productName" />
            <div class="pos-product-info">
              <p class="pos-brand">{{ p.brandName }}</p>
              <p class="pos-name">{{ p.productName }}</p>
              <p class="pos-price">{{ formatPrice(p.discountPrice || p.price) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI: Đơn hàng -->
      <div class="pos-cart">
        <h3 class="pos-cart-title">Đơn tại quầy</h3>

        <div class="pos-guest-info">
        <span class="guest-icon">👤</span>
        <span>Khách qua đường</span>
      </div>

        <div class="pos-items">
          <div v-if="cartItems.length === 0" class="pos-empty">
            Bấm vào sản phẩm bên trái để thêm vào đơn
          </div>
          <div v-for="(item, i) in cartItems" :key="i" class="pos-item">
            <img :src="resolveImageUrl(item.productImage)" class="pos-item-thumb" />
            <div class="pos-item-info">
              <p class="pos-item-name">{{ item.productName }}</p>
              <p class="pos-item-variant">{{ item.size }} / {{ item.color }}</p>
            </div>
            <div class="pos-item-qty">
              <button @click="item.quantity > 1 ? item.quantity-- : cartItems.splice(i, 1)">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="item.quantity < item.stock ? item.quantity++ : null">+</button>
            </div>
            <div class="pos-item-price">{{ formatPrice(item.unitPrice * item.quantity) }}</div>
            <button class="pos-remove" @click="cartItems.splice(i, 1)">✕</button>
          </div>
        </div>

        <div class="pos-summary">
          <div class="pos-total-row">
            <span>Tổng cộng</span>
            <span class="pos-total">{{ formatPrice(totalAmount) }}</span>
          </div>
        </div>

        <div class="pos-payment-methods">
          <button v-for="m in paymentMethods" :key="m.value" class="pos-pay-btn" :class="{ active: selectedPayment === m.value }" @click="selectedPayment = m.value">
            {{ m.label }}
          </button>
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button class="btn btn-primary btn-block pos-submit" :disabled="cartItems.length === 0 || submitting" @click="showConfirm = true">
          {{ submitting ? 'Đang xử lý...' : `Thanh toán ${formatPrice(totalAmount)}` }}
        </button>
      </div>
    </div>

    <!-- Modal chọn biến thể -->
    <div v-if="selectedProduct" class="modal-overlay" @click.self="selectedProduct = null">
      <div class="modal-box card variant-modal">
        <div class="variant-modal-header">
          <img :src="resolveImageUrl(selectedProduct.imageUrl)" :alt="selectedProduct.productName" class="variant-modal-img" />
          <div>
            <h3>{{ selectedProduct.productName }}</h3>
            <p class="variant-modal-price">{{ formatPrice(selectedProduct.discountPrice || selectedProduct.price) }}</p>
          </div>
        </div>

        <p class="variant-subtitle">Chọn màu và size:</p>

        <div class="variant-picker">
          <div v-for="v in selectedProduct.variants" :key="v.variantId" class="variant-option" :class="{ disabled: v.quantity === 0, added: isInCart(v.variantId) }" @click="v.quantity > 0 && addToCart(v)">
            <img :src="resolveImageUrl(v.variantImageUrl || selectedProduct.imageUrl)" class="variant-thumb" />
            <span class="variant-color">{{ v.color }}</span>
            <span class="variant-size">Size {{ v.size }}</span>
            <span class="variant-stock" :class="v.quantity === 0 ? 'out' : 'in'">
              {{ v.quantity === 0 ? 'Hết hàng' : `Còn ${v.quantity}` }}
            </span>
            <span v-if="isInCart(v.variantId)" class="variant-added-badge">Đã thêm ✓</span>
          </div>
        </div>

        <button class="btn btn-secondary btn-block" style="margin-top:16px" @click="selectedProduct = null">Đóng</button>
      </div>
    </div>

    <ConfirmModal
      v-model="showConfirm"
      title="Xác nhận thanh toán"
      :message="`Tổng: ${formatPrice(totalAmount)} — Xác nhận thanh toán bằng ${paymentMethods.find(m => m.value === selectedPayment)?.label}?`"
      confirmText="Xác nhận"
      type="primary"
      @confirm="submitOrder"
    />

    <!-- Modal thành công (có QR nếu chuyển khoản) -->
    <Teleport to="body">
      <div v-if="showSuccess" class="modal-overlay" @click.self="resetPos">
        <div class="modal-box card success-modal">
          <div class="success-icon">✅</div>
          <h3>Thanh toán thành công!</h3>
          <p class="success-order-code">Mã đơn: <strong>{{ lastOrderCode }}</strong></p>
          <p class="success-total">{{ formatPrice(lastTotal) }}</p>

          <div v-if="lastQrUrl" class="qr-section">
            <p class="qr-label">Quét mã để chuyển khoản:</p>
            <img :src="lastQrUrl" alt="Mã QR chuyển khoản" class="qr-image" />
          </div>

          <button class="btn btn-primary btn-block" style="margin-top:20px" @click="resetPos">Tạo đơn mới</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'
import { resolveImageUrl } from '../../services/imageUrl'
import ConfirmModal from '../../components/ConfirmModal.vue'

const keyword = ref('')
const products = ref([])
const cartItems = ref([])
const selectedProduct = ref(null)
const receiverName = ref('')
const receiverPhone = ref('')
const selectedPayment = ref('Cash')
const lastQrUrl = ref(null)
const submitting = ref(false)
const error = ref('')
const showConfirm = ref(false)
const showSuccess = ref(false)
const lastOrderCode = ref('')
const lastTotal = ref(0)

const paymentMethods = [
  { value: 'Cash', label: 'Tiền mặt' },
  { value: 'Card', label: 'Thẻ' },
  { value: 'Transfer', label: 'Chuyển khoản' }
]

const totalAmount = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
)

function formatPrice(v) {
  return new Intl.NumberFormat('vi-VN').format(v) + 'đ'
}

async function searchProducts() {
  try {
    const { data } = await api.get('/products', { params: { keyword: keyword.value, pageSize: 20 } })
    products.value = data.items
  } catch (err) {
    console.error(err)
  }
}

async function selectProduct(product) {
  const { data } = await api.get(`/products/${product.productId}`)
  selectedProduct.value = data
}

function isInCart(variantId) {
  return cartItems.value.some(i => i.variantId === variantId)
}

function addToCart(variant) {
  // Kiểm tra trùng: nếu variantId đã có trong giỏ, chỉ tăng số lượng, không thêm dòng mới
  const existing = cartItems.value.find(i => i.variantId === variant.variantId)
  if (existing) {
    if (existing.quantity < variant.quantity) {
      existing.quantity++
    } else {
      error.value = `"${existing.productName}" (${existing.size}/${existing.color}) đã đạt số lượng tồn kho tối đa.`
      setTimeout(() => error.value = '', 3000)
    }
  } else {
    cartItems.value.push({
      variantId: variant.variantId,
      productName: selectedProduct.value.productName,
      productImage: selectedProduct.value.imageUrl,
      size: variant.size,
      color: variant.color,
      unitPrice: selectedProduct.value.discountPrice || selectedProduct.value.price,
      quantity: 1,
      stock: variant.quantity
    })
  }
  // Không đóng modal ngay để có thể chọn thêm biến thể khác của cùng sản phẩm
}

async function submitOrder() {
  submitting.value = true
  error.value = ''
  try {
    const { data } = await api.post('/orders/pos', {
      paymentMethod: selectedPayment.value,
      items: cartItems.value.map(i => ({ variantId: i.variantId, quantity: i.quantity }))
    })
    lastQrUrl.value = data.qrUrl || null
    lastOrderCode.value = data.orderCode
    lastTotal.value = data.totalAmount
    showSuccess.value = true
  } catch (err) {
    error.value = err.response?.data?.message || 'Tạo đơn thất bại.'
  } finally {
    submitting.value = false
  }
}

function resetPos() {
  cartItems.value = []
  receiverName.value = ''
  receiverPhone.value = ''
  selectedPayment.value = 'Cash'
  error.value = ''
}

onMounted(searchProducts)
</script>

<style scoped>
.pos-page { padding: 0; height: calc(100vh - 60px); overflow: hidden; }
.pos-layout { display: grid; grid-template-columns: 1fr 380px; height: 100%; }

.pos-products { padding: 20px; overflow-y: auto; border-right: 1px solid var(--border-subtle); }

.product-grid-pos { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.pos-product-card { cursor: pointer; overflow: hidden; transition: transform 0.15s ease; }
.pos-product-card:hover { transform: translateY(-3px); }
.pos-product-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
.pos-product-info { padding: 10px; }
.pos-brand { font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
.pos-name { font-size: 13px; font-weight: 600; margin: 2px 0 6px; }
.pos-price { font-size: 14px; font-weight: 800; color: var(--accent-orange); }

.pos-cart { display: flex; flex-direction: column; padding: 16px; overflow-y: auto; background: var(--bg-elevated); }
.pos-cart-title { font-size: 16px; margin-bottom: 14px; }

.pos-items { flex: 1; overflow-y: auto; margin-bottom: 12px; }
.pos-empty { text-align: center; color: var(--text-muted); padding: 32px 0; font-size: 14px; }

.pos-item-thumb {
  width: 44px; height: 44px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.pos-guest-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-elevated-2);
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}
.guest-icon { font-size: 18px; }

.pos-item { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle); }
.pos-item-info { flex: 1; }
.pos-item-name { font-size: 13px; font-weight: 600; }
.pos-item-variant { font-size: 12px; color: var(--text-muted); }
.pos-item-qty { display: flex; align-items: center; gap: 6px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); }
.pos-item-qty button { width: 28px; height: 28px; font-size: 16px; color: var(--text-primary); }
.pos-item-qty span { min-width: 24px; text-align: center; font-size: 14px; }
.pos-item-price { font-size: 13px; font-weight: 700; white-space: nowrap; }
.pos-remove { color: var(--text-muted); font-size: 14px; }
.pos-remove:hover { color: var(--danger); }

.pos-summary { border-top: 2px solid var(--border-subtle); padding-top: 12px; margin-bottom: 14px; }
.pos-total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; }
.pos-total { color: var(--accent-orange); font-size: 20px; }

.pos-payment-methods { display: flex; gap: 8px; margin-bottom: 14px; }
.pos-pay-btn { flex: 1; padding: 10px 6px; border: 1.5px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.pos-pay-btn.active { border-color: var(--accent-orange); background: rgba(255,107,53,0.1); color: var(--accent-orange); }

.pos-submit { padding: 14px; font-size: 15px; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-box { padding: 28px; max-width: 480px; width: 90%; }
.modal-box h3 { margin-bottom: 16px; }

.variant-picker { display: flex; flex-direction: column; gap: 8px; }
.variant-option { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1.5px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; }
.variant-option:hover:not(.disabled) { border-color: var(--accent-orange); }
.variant-option.disabled { opacity: 0.4; cursor: not-allowed; }
.variant-color { flex: 1; font-weight: 600; }
.variant-size { color: var(--text-secondary); font-size: 14px; }
.variant-stock { font-size: 12px; font-weight: 700; }
.variant-stock.in { color: var(--success); }
.variant-stock.out { color: var(--danger); }


.success-modal { text-align: center; max-width: 400px; }
.success-icon { font-size: 44px; margin-bottom: 12px; }
.success-modal h3 { font-size: 18px; margin-bottom: 12px; }
.success-order-code { font-size: 14px; color: var(--text-secondary); margin-bottom: 6px; }
.success-total { font-size: 24px; font-weight: 800; color: var(--accent-orange); margin-bottom: 16px; }

.qr-section {
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
  margin-top: 8px;
}
.qr-label { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }
.qr-image {
  width: 220px;
  height: 220px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.variant-modal { max-width: 520px; }
.variant-modal-header {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.variant-modal-img {
  width: 64px; height: 64px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}
.variant-modal-header h3 { font-size: 16px; margin-bottom: 4px; }
.variant-modal-price { font-size: 15px; font-weight: 800; color: var(--accent-orange); }

.variant-thumb {
  width: 40px; height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.variant-option.added {
  border-color: var(--success);
  background: rgba(46,204,113,0.08);
}
.variant-added-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--success);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .pos-layout { grid-template-columns: 1fr; }
}
</style>