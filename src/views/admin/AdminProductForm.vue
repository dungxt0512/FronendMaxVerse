<template>
  <div class="container admin-page">
    <h1 class="heading-display page-title">{{ isEdit ? 'SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM' }}</h1>

    <form class="product-form card" @submit.prevent="handleSubmit">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tên sản phẩm</label>
          <input v-model="form.productName" type="text" class="form-input" required />
        </div>
        <div class="form-group">
          <label class="form-label">Ảnh đại diện</label>
          <div style="display:flex; gap:12px; align-items:center;">
            <img
              :src="localPreviewUrl || (form.imageUrl ? 'http://localhost:5067' + form.imageUrl : 'https://placehold.co/72x72/1E2533/6B7280?text=?')"
              style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border-subtle);"
            />
            <div>
              <label class="btn btn-secondary" style="cursor:pointer; display:inline-block;">
                {{ imageFile ? imageFile.name : (form.imageUrl ? 'Đổi ảnh' : 'Chọn ảnh từ máy') }}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style="position:absolute;width:1px;height:1px;opacity:0;"
                  @change="handleFileSelect"
                />
              </label>
              <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">JPG, PNG, WEBP — tối đa 5MB</p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Mô tả</label>
        <textarea v-model="form.description" class="form-input" rows="3"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Giá gốc (VNĐ)</label>
          <input v-model.number="form.price" type="number" class="form-input" required min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Giá khuyến mãi (nếu có)</label>
          <input v-model.number="form.discountPrice" type="number" class="form-input" min="0" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Hãng</label>
          <select v-model.number="form.brandId" class="form-input" required>
            <option value="" disabled>Chọn hãng</option>
            <option v-for="b in brands" :key="b.brandId" :value="b.brandId">{{ b.brandName }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Loại giày</label>
          <select v-model.number="form.categoryId" class="form-input" required>
            <option value="" disabled>Chọn loại</option>
            <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">{{ c.categoryName }}</option>
          </select>
        </div>
      </div>

      <h3 class="variants-title">Biến thể sản phẩm</h3>
<div class="variants-list">
  <div v-for="(v, i) in form.variants" :key="i" class="variant-card">
    <div class="variant-card-header">
      <span>Biến thể #{{ i + 1 }}</span>
      <button type="button" class="remove-variant" @click="form.variants.splice(i, 1)">✕ Xóa</button>
    </div>

    <div class="variant-grid">
      <div class="form-group">
        <label class="form-label">Size</label>
        <select v-model.number="v.sizeId" class="form-input"
          @change="v.size = sizes.find(s => s.sizeId === v.sizeId)?.sizeValue || ''">
          <option :value="null" disabled>Chọn size</option>
          <option v-for="s in sizes" :key="s.sizeId" :value="s.sizeId">{{ s.sizeValue }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Màu sắc</label>
        <select v-model.number="v.colorId" class="form-input"
          @change="v.color = colors.find(c => c.colorId === v.colorId)?.colorName || ''">
          <option :value="null" disabled>Chọn màu</option>
          <option v-for="c in colors" :key="c.colorId" :value="c.colorId">{{ c.colorName }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Số lượng tồn kho</label>
        <input v-model.number="v.quantity" type="number" class="form-input" min="0" required />
      </div>

      <div class="form-group">
        <label class="form-label">SKU (mã sản phẩm)</label>
        <input v-model="v.sku" type="text" class="form-input" placeholder="VD: NK-AF1-40-DEN" />
      </div>

      <div class="form-group">
        <label class="form-label">Giá riêng (nếu khác giá gốc)</label>
        <input v-model.number="v.variantPrice" type="number" class="form-input" min="0"
          placeholder="Để trống nếu dùng giá sản phẩm" />
      </div>

      <div class="form-group">
        <label class="form-label">Ảnh riêng variant</label>
        <div style="display:flex; gap:10px; align-items:center;">
          <img
            :src="v.variantImageUrl ? (v.variantImageUrl.startsWith('blob:') ? v.variantImageUrl : 'http://localhost:5067' + v.variantImageUrl) : 'https://placehold.co/56x56/1E2533/6B7280?text=?'"
            style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--border-subtle);"
          />
          <label class="btn btn-secondary" style="cursor:pointer; display:inline-block; font-size:13px; padding:8px 14px;">
            {{ v.variantImageUrl ? 'Đổi ảnh' : 'Chọn ảnh' }}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style="position:absolute;width:1px;height:1px;opacity:0;"
              @change="handleVariantFileSelect($event, i)"
            />
          </label>
        </div>
        <p style="font-size:11px;color:var(--text-muted);margin-top:6px;">Để trống nếu dùng ảnh sản phẩm</p>
      </div>
    </div>
  </div>
</div>
    <h3 class="variants-title" style="margin-top: 32px;">Ảnh gallery sản phẩm</h3>
    <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
      Ảnh phụ hiển thị trong trang chi tiết sản phẩm (thumbnail bên dưới ảnh chính).
    </p>

    <div class="image-gallery-grid">
      <!-- Ảnh đã lưu trong DB -->
      <div v-for="img in extraImages" :key="img.imageId" class="gallery-item">
        <img :src="resolveImageUrl(img.imageUrl)" :alt="'Ảnh ' + img.imageId" />
        <button type="button" class="gallery-remove" @click="removeExtraImage(img.imageId)">✕</button>
        <span class="gallery-badge">Đã lưu</span>
      </div>

      <!-- Ảnh chưa upload (pending) -->
      <div v-for="(p, i) in pendingImages" :key="'p' + i" class="gallery-item pending">
        <img :src="p.previewUrl" :alt="'Ảnh mới ' + i" />
        <button type="button" class="gallery-remove" @click="removePendingImage(i)">✕</button>
        <span class="gallery-badge pending-badge">Chưa lưu</span>
      </div>

      <!-- Nút thêm ảnh mới -->
      <label class="gallery-add-btn">
        <span>+</span>
        <small>Thêm ảnh</small>
        <input type="file" accept="image/png,image/jpeg,image/webp"
          multiple style="display:none"
          @change="handleExtraFilesSelect" />
      </label>
    </div>
      <button type="button" class="btn btn-secondary" @click="addVariant">+ Thêm biến thể</button>

      <p v-if="error" class="form-error">{{ error }}</p>

      <div class="form-actions">
        <router-link to="/admin/products" class="btn btn-secondary">Hủy</router-link>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Đang lưu...' : 'Lưu sản phẩm' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const props = defineProps({ id: { type: [String, Number], default: null } })
const router = useRouter()

const isEdit = computed(() => !!props.id)
const brands = ref([])
const categories = ref([])
const sizes = ref([])
const colors = ref([])
const submitting = ref(false)
const error = ref('')
const imageFile = ref(null)
const localPreviewUrl = ref('')
const variantImageFiles = ref({})

const extraImages = ref([])
const pendingImages = ref([])

const form = reactive({
  productName: '',
  description: '',
  price: 0,
  discountPrice: null,
  brandId: '',
  categoryId: '',
  imageUrl: '',
  variants: []
})

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Ảnh không được vượt quá 5MB.'
    event.target.value = ''
    return
  }
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
  imageFile.value = file
  localPreviewUrl.value = URL.createObjectURL(file)
  error.value = ''
}

function handleVariantFileSelect(event, variantIndex) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    error.value = `Ảnh variant #${variantIndex + 1} không được vượt quá 5MB.`
    event.target.value = ''
    return
  }
  variantImageFiles.value[variantIndex] = file
  // Dùng blob URL để preview ngay, sẽ được thay bằng URL thật sau khi upload
  const oldUrl = form.variants[variantIndex].variantImageUrl
  if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl)
  form.variants[variantIndex].variantImageUrl = URL.createObjectURL(file)
  error.value = ''
}

// Chọn nhiều ảnh phụ cùng lúc
function handleExtraFilesSelect(event) {
  const files = Array.from(event.target.files)
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) continue // bỏ qua file quá 5MB
    pendingImages.value.push({
      file,
      previewUrl: URL.createObjectURL(file)
    })
  }
  event.target.value = '' // reset để có thể chọn lại file cũ
}

// Xóa ảnh phụ chưa upload (đang pending)
function removePendingImage(index) {
  URL.revokeObjectURL(pendingImages.value[index].previewUrl)
  pendingImages.value.splice(index, 1)
}

// Xóa ảnh phụ đã lưu trong DB
async function removeExtraImage(imageId) {
  if (!window.confirm('Xóa ảnh này?')) return
  try {
    await api.delete(`/products/images/${imageId}`)
    extraImages.value = extraImages.value.filter(img => img.imageId !== imageId)
  } catch (err) {
    alert('Xóa ảnh thất bại.')
  }
}

// Upload tất cả ảnh pending lên server sau khi có productId
async function uploadPendingImages(productId) {
  for (const pending of pendingImages.value) {
    const formData = new FormData()
    formData.append('file', pending.file)
    try {
      const { data } = await api.post('/upload/product-image-extra', formData)
      // Sau khi upload xong, gắn URL vào sản phẩm
      await api.post(`/products/${productId}/images`, { imageUrl: data.url })
    } catch (err) {
      console.error('Lỗi upload ảnh phụ:', err)
    }
  }
  pendingImages.value = []
}

function addVariant() {
  form.variants.push({
    size: '', color: '', quantity: 0,
    sku: '', variantPrice: null, variantImageUrl: '',
    sizeId: null, colorId: null
  })
}

async function loadOptions() {
  const [brandsRes, categoriesRes, sizesRes, colorsRes] = await Promise.all([
    api.get('/products/brands'),
    api.get('/products/categories'),
    api.get('/products/sizes'),
    api.get('/products/colors')
  ])
  brands.value = brandsRes.data
  categories.value = categoriesRes.data
  sizes.value = sizesRes.data
  colors.value = colorsRes.data
}

async function loadProduct() {
  if (!isEdit.value) {
    addVariant()
    return
  }
  const { data } = await api.get(`/products/${props.id}`)
  form.productName = data.productName
  form.description = data.description
  form.price = data.price
  form.discountPrice = data.discountPrice
  form.imageUrl = data.imageUrl
  form.variants = data.variants.map(v => ({ size: v.size, color: v.color, quantity: v.quantity }))
    extraImages.value = data.images.map(img => ({
    imageId: img.imageId,
    imageUrl: img.imageUrl
    }))
  const brand = brands.value.find(b => b.brandName === data.brandName)
  const category = categories.value.find(c => c.categoryName === data.categoryName)
  form.brandId = brand?.brandId || ''
  form.categoryId = category?.categoryId || ''
}

async function handleSubmit() {
  if (form.variants.length === 0) {
    error.value = 'Cần thêm ít nhất một biến thể (size/màu).'
    return
  }

  const hasIncompleteVariant = form.variants.some(v => !v.size || !v.color)
  if (hasIncompleteVariant) {
    error.value = 'Mỗi biến thể cần chọn đầy đủ size và màu.'
    return
  }

  if (!isEdit.value && !imageFile.value) {
    error.value = 'Vui lòng chọn ảnh đại diện cho sản phẩm.'
    return
  }

  submitting.value = true
  error.value = ''

  try {
    // Bước 1: Upload ảnh đại diện nếu có chọn file mới
    let mainImageUrl = form.imageUrl
    if (imageFile.value) {
      const formData = new FormData()
      formData.append('file', imageFile.value)
      const { data } = await api.post('/upload/product-image', formData)
      mainImageUrl = data.url
    }

    // Bước 2: Upload ảnh riêng của từng variant nếu có
    for (const [indexStr, file] of Object.entries(variantImageFiles.value)) {
      const idx = parseInt(indexStr)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const { data } = await api.post('/upload/product-image', formData)
        form.variants[idx].variantImageUrl = data.url
      } catch (err) {
        console.error(`Lỗi upload ảnh variant ${idx}:`, err)
      }
    }

    // Bước 3: Gộp tất cả thành payload rồi lưu sản phẩm
    const payload = { ...form, imageUrl: mainImageUrl }

    if (isEdit.value) {
      await api.put(`/products/${props.id}`, payload)
      await uploadPendingImages(props.id)
    } else {
      const { data } = await api.post('/products', payload)
      await uploadPendingImages(data.productId)
    }

    router.push('/admin/products')
  } catch (err) {
    error.value = err.response?.data?.message || 'Lưu sản phẩm thất bại.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadOptions()
  await loadProduct()
})
</script>

<style scoped>
.admin-page { padding: 32px 24px 80px; max-width: 800px; margin: 0 auto; }
.page-title { font-size: 32px; margin-bottom: 24px; }
.product-form { padding: 32px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.variants-title { font-size: 16px; margin: 24px 0 12px; }
.variants-list { margin-bottom: 16px; display: flex; flex-direction: column; gap: 16px; }

.variant-card {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 20px;
  background: var(--bg-elevated-2);
}
.variant-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary);
}
.variant-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
.remove-variant {
  padding: 6px 12px;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
}
.remove-variant:hover { background: var(--danger); color: #fff; }

/* Gallery ảnh phụ */
.image-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.gallery-item {
  position: relative;
  aspect-ratio: 1/1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated-2);
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gallery-item.pending {
  border-color: var(--accent-orange);
}
.gallery-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gallery-remove:hover { background: var(--danger); }
.gallery-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(46,204,113,0.8);
  color: #fff;
}
.pending-badge { background: rgba(255,107,53,0.85); }
.gallery-add-btn {
  aspect-ratio: 1/1;
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: border-color 0.15s ease;
  gap: 4px;
}
.gallery-add-btn span { font-size: 28px; line-height: 1; }
.gallery-add-btn small { font-size: 12px; }
.gallery-add-btn:hover {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
}

@media (max-width: 700px) {
  .variant-grid { grid-template-columns: 1fr; }
}
</style>
