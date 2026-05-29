<template>
  <!-- =========================================================
    AppShell — shared sidebar + topbar for ALL dashboards.

    PROPS
    ─────
    nav-items      Array   sidebar nav tree (see NavItem spec below)
    role-label     String  shown under user name, e.g. "Chef"
    breadcrumb-root String left topbar label
    breadcrumb     String  current page label
    current-page   String  active page key
    current-user   Object  { prenom, nom }
    toast          Object  { visible, type:'ok'|'err', message }

    EVENTS
    ──────
    @navigate(page)
    @logout

    SLOTS
    ─────
    default          — page content
    topbar-actions   — right side of topbar (notifications, etc.)

    NavItem shapes
    ──────────────
    { type:'section',  label, icon }
    { type:'category', label }
    { type:'group',    key, label, icon, badge?, children:[{page,label,badge?}] }
    { page, label, icon, badge?, badgeCheck? }   ← simple item (type omitted)
  ========================================================= -->
  <div class="vld-shell">

    <!-- ── Toast ─────────────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="toast && toast.visible"
           class="vld-toast-wrap"
           role="alert" aria-live="assertive">
        <div class="alert d-flex align-items-center gap-2 shadow-sm py-3 px-4 mb-0"
             :class="toast.type === 'ok' ? 'alert-success' : 'alert-danger'">
          <svg v-if="toast.type === 'ok'" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span class="fw-medium small">{{ toast.message }}</span>
        </div>
      </div>
    </Transition>

    <!-- ── Sidebar ───────────────────────────────────────── -->
    <aside class="vld-sidebar" :class="{ 'is-collapsed': collapsed }">

      <!-- Brand -->
      <div class="vld-sb-brand">
        <div v-if="!collapsed" class="vld-brand-full">
          <span class="vld-logo-w">Vers le</span><span class="vld-logo-g">Diplôme</span>
        </div>
        <div v-else class="vld-brand-icon">VD</div>
        <button class="vld-collapse-btn" @click="collapsed = !collapsed" title="Réduire">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="vld-sb-nav">
        <template v-for="item in navItems" :key="item.key || item.label || item.page">

          <!-- Section divider -->
          <template v-if="item.type === 'section'">
            <div v-if="!collapsed" class="vld-sb-section">
              <div class="vld-sb-section__line"/>
              <span class="vld-sb-section__label">
                <span v-html="item.icon"/>
                {{ item.label }}
              </span>
              <div class="vld-sb-section__line"/>
            </div>
            <div v-else class="d-flex justify-content-center py-2 opacity-50"
                 style="color:rgba(245,197,24,.6)" :title="item.label"
                 v-html="item.icon"/>
          </template>

          <!-- Category label -->
          <div v-else-if="item.type === 'category' && !collapsed"
               class="vld-nav-cat">{{ item.label }}</div>

          <!-- Collapsible group -->
          <template v-else-if="item.type === 'group'">
            <button v-if="!collapsed"
                    class="vld-nav-group"
                    :class="{ 'is-open': openGroup === item.key }"
                    @click="toggleGroup(item.key)">
              <span class="flex-shrink-0" v-html="item.icon"/>
              <span class="flex-grow-1 text-truncate d-flex align-items-center gap-1">
                {{ item.label }}
                <span v-if="item.badge"
                      class="badge rounded-pill text-bg-warning ms-1"
                      style="font-size:.65rem">{{ item.badge }}</span>
              </span>
              <svg class="vld-nav-group__chevron"
                   :class="{ 'is-open': openGroup === item.key }"
                   xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <!-- Collapsed: click navigates to first child -->
            <button v-else
                    class="vld-nav-item"
                    :class="{ 'is-active': groupIsActive(item) }"
                    :title="item.label"
                    @click="navigate(item.children?.[0]?.page)">
              <span v-html="item.icon"/>
              <span v-if="item.badge" class="vld-badge-dot"/>
            </button>
            <!-- Sub items -->
            <Transition name="submenu">
              <div v-if="openGroup === item.key && !collapsed" class="vld-sub-menu">
                <button v-for="child in item.children" :key="child.page"
                        class="vld-sub-item"
                        :class="{ 'is-active': currentPage === child.page }"
                        @click="navigate(child.page)">
                  <span class="vld-sub-dot"/>
                  <span class="flex-grow-1">{{ child.label }}</span>
                  <span v-if="child.badge"
                        class="badge rounded-pill text-bg-warning"
                        style="font-size:.6rem">{{ child.badge }}</span>
                </button>
              </div>
            </Transition>
          </template>

          <!-- Simple item -->
          <template v-else>
            <button class="vld-nav-item"
                    :class="{ 'is-active': currentPage === item.page }"
                    :title="collapsed ? item.label : ''"
                    @click="navigate(item.page)">
              <span class="flex-shrink-0" v-html="item.icon"/>
              <span v-if="!collapsed" class="d-flex align-items-center gap-1 text-truncate flex-grow-1">
                {{ item.label }}
                <span v-if="item.badge"
                      class="badge rounded-pill text-bg-warning"
                      style="font-size:.65rem">{{ item.badge }}</span>
                <span v-if="item.badgeCheck"
                      class="badge rounded-pill text-bg-success"
                      style="font-size:.65rem">✓</span>
              </span>
              <span v-if="collapsed && item.badge" class="vld-badge-dot"/>
            </button>
          </template>

        </template>
      </nav>

      <!-- User footer -->
      <div v-if="!collapsed" class="vld-sb-user">
        <div class="vld-av vld-av--sm vld-av--gold"
             style="cursor:pointer;flex-shrink:0"
             title="Mon profil"
             @click="navigate('profil')">{{ initials }}</div>
        <div class="flex-grow-1 overflow-hidden"
             style="cursor:pointer"
             title="Mon profil"
             @click="navigate('profil')">
          <div class="vld-sb-user__name">{{ currentUser.prenom }} {{ currentUser.nom }}</div>
          <div class="vld-sb-user__role">{{ roleLabel }}</div>
        </div>
        <button class="vld-logout-btn" @click="$emit('logout')" title="Se déconnecter">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
      <div v-else class="d-flex justify-content-center p-3 border-top"
           style="border-color:var(--vld-sb-border) !important">
        <div class="vld-av vld-av--sm vld-av--gold"
             style="cursor:pointer"
             title="Mon profil"
             @click="navigate('profil')">{{ initials }}</div>
      </div>

    </aside>

    <!-- ── Main ──────────────────────────────────────────── -->
    <div class="vld-main">

      <!-- Topbar -->
      <header class="vld-topbar">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item fw-bold" style="color:var(--vld-primary)">
              {{ breadcrumbRoot }}
            </li>
            <li v-if="breadcrumb" class="breadcrumb-item active fw-semibold"
                style="color:var(--vld-text-strong)">
              {{ breadcrumb }}
            </li>
          </ol>
        </nav>
        <div class="d-flex align-items-center gap-3">
          <slot name="topbar-actions"/>
          <span class="small text-capitalize" style="color:var(--vld-text-muted)">{{ today }}</span>
        </div>
      </header>

      <!-- Content -->
      <div class="vld-content">
        <slot/>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AppShell',

  props: {
    navItems:      { type: Array,  default: () => [] },
    roleLabel:     { type: String, default: '' },
    breadcrumbRoot:{ type: String, default: '' },
    breadcrumb:    { type: String, default: '' },
    currentPage:   { type: String, default: 'home' },
    currentUser:   { type: Object, default: () => ({}) },
    toast:         { type: Object, default: null },
  },

  emits: ['navigate', 'logout'],

  data() {
    return { collapsed: false, openGroup: null }
  },

  computed: {
    initials() {
      const n = `${this.currentUser.prenom || ''} ${this.currentUser.nom || ''}`.trim()
      return (n || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    },
    today() {
      return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    },
  },

  watch: {
    currentPage(p) { this._openGroupForPage(p) },
  },

  mounted() { this._openGroupForPage(this.currentPage) },

  methods: {
    navigate(page) { if (page) this.$emit('navigate', page) },
    toggleGroup(key) { this.openGroup = this.openGroup === key ? null : key },
    groupIsActive(item) {
      return (item.children || []).some(c => c.page === this.currentPage)
    },
    _openGroupForPage(page) {
      for (const item of this.navItems) {
        if (item.type === 'group' && (item.children || []).some(c => c.page === page)) {
          this.openGroup = item.key
          return
        }
      }
    },
  },
}
</script>
<!-- Zero <style> block — all styles come from design-tokens.css + Bootstrap -->