<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': isCollapsed }">
  <aside class="admin-sidebar">
    <button class="sidebar-toggle" @click="isCollapsed = !isCollapsed">
      {{ isCollapsed ? '☰' : '✕' }}
    </button>
      <div class="sidebar-logo">
        <router-link to="/">MAX<span v-if="!isCollapsed">VERSE</span></router-link>
        <p v-if="!isCollapsed" class="sidebar-role">Quản trị viên</p>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" exact-active-class="active" :title="isCollapsed ? 'Dashboard' : ''">
          <span class="icon">📊</span>
          <span v-if="!isCollapsed">Dashboard</span>
        </router-link>
        <router-link to="/admin/products" active-class="active" :title="isCollapsed ? 'Sản phẩm' : ''">
          <span class="icon">👟</span>
          <span v-if="!isCollapsed">Sản phẩm</span>
        </router-link>
        <router-link to="/admin/orders" active-class="active" :title="isCollapsed ? 'Đơn hàng' : ''">
          <span class="icon">📦</span>
          <span v-if="!isCollapsed">Đơn hàng</span>
        </router-link>
        <router-link to="/admin/pos" active-class="active" :title="isCollapsed ? 'Bán tại quầy' : ''">
          <span class="icon">🖥️</span>
          <span v-if="!isCollapsed">Bán tại quầy</span>
        </router-link>
        <router-link to="/admin/promotions" active-class="active" :title="isCollapsed ? 'Khuyến mãi' : ''">
          <span class="icon">🏷️</span>
          <span v-if="!isCollapsed">Khuyến mãi</span>
        </router-link>
      </nav>

      <button class="sidebar-logout" @click="handleLogout" :title="isCollapsed ? 'Đăng xuất' : ''">
        <span class="icon">🚪</span>
        <span v-if="!isCollapsed">Đăng xuất</span>
      </button>
    </aside>

    <main class="admin-main">
      <header class="admin-topbar">
        <h2>{{ pageTitle }}</h2>
        <span class="admin-user">{{ auth.user?.fullName }}</span>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

const isCollapsed = ref(localStorage.getItem('admin_sidebar_collapsed') === 'true')

watch(isCollapsed, (val) => {
  localStorage.setItem('admin_sidebar_collapsed', val)
})

const pageTitle = computed(() => {
  const titles = {
    'admin-dashboard': 'Dashboard',
    'admin-products': 'Quản lý sản phẩm',
    'admin-product-new': 'Thêm sản phẩm',
    'admin-product-edit': 'Sửa sản phẩm',
    'admin-orders': 'Quản lý đơn hàng',
    'admin-promotions': 'Quản lý khuyến mãi'
  }
  return titles[route.name] || 'Quản trị'
})

function handleLogout() {
  auth.logout()
  cart.clearLocal()
  router.push('/')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
}

/* ===== SIDEBAR ===== */
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 24px 20px 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.sidebar-logo a {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 4px;
}
.sidebar-logo a span { color: var(--accent-orange); }
.sidebar-role {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.15s ease;
}
.sidebar-nav a:hover {
  background: var(--bg-elevated-2);
  color: var(--text-primary);
}
.sidebar-nav a.active {
  background: rgba(255, 107, 53, 0.12);
  color: var(--accent-orange);
}
.icon { font-size: 16px; }

.sidebar-logout {
  margin: 16px 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 24px);
  text-align: left;
}
.sidebar-logout:hover {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger);
}

/* ===== MAIN ===== */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-topbar {
  height: 60px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 10;
}
.admin-topbar h2 {
  font-size: 16px;
  font-weight: 700;
}
.admin-user {
  font-size: 14px;
  color: var(--text-secondary);
}

.admin-content {
  flex: 1;
  overflow-y: auto;
}

.sidebar-toggle {
  position: absolute;
  top: 20px;
  right: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-elevated-2);
  border: 1px solid var(--border-subtle);
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}
.sidebar-toggle:hover { color: var(--accent-orange); border-color: var(--accent-orange); }

.admin-sidebar { position: relative; transition: width 0.2s ease; }

.admin-layout.sidebar-collapsed .admin-sidebar { width: 72px; }
.admin-layout.sidebar-collapsed .sidebar-nav a,
.admin-layout.sidebar-collapsed .sidebar-logout {
  justify-content: center;
}
.admin-layout.sidebar-collapsed .sidebar-logo { text-align: center; padding: 24px 8px 20px; }
</style>