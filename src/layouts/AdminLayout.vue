<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">
        <router-link to="/">MAX<span>VERSE</span></router-link>
        <p class="sidebar-role">Quản trị viên</p>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" exact-active-class="active">
          <span class="icon">📊</span> Dashboard
        </router-link>
        <router-link to="/admin/products" active-class="active">
          <span class="icon">👟</span> Sản phẩm
        </router-link>
        <router-link to="/admin/orders" active-class="active">
          <span class="icon">📦</span> Đơn hàng
        </router-link>
        <router-link to="/admin/promotions" active-class="active">
          <span class="icon">🏷️</span> Khuyến mãi
        </router-link>
      </nav>

      <button class="sidebar-logout" @click="handleLogout">
        <span class="icon">🚪</span> Đăng xuất
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

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
</style>