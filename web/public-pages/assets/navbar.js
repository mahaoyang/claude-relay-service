(() => {
  const styleId = 'shared-navbar-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Use Lily palette tokens with !important to override inline styles */
      .navbar-muted-icon,
      .navbar-muted-icon svg {
        color: var(--sand-7) !important;
        stroke: var(--sand-7) !important;
      }
      .dark .navbar-muted-icon,
      .dark .navbar-muted-icon svg {
        color: var(--sand-7) !important;
        stroke: var(--sand-7) !important;
      }
      .navbar-toggle-btn,
      .navbar-toggle-btn svg {
        color: var(--sand-7) !important;
        stroke: var(--sand-7) !important;
      }
      .dark .navbar-toggle-btn,
      .dark .navbar-toggle-btn svg {
        color: var(--sand-7) !important;
        stroke: var(--sand-7) !important;
      }
      .navbar-toggle-btn:hover,
      .navbar-toggle-btn:hover svg {
        color: var(--sand-11) !important;
        stroke: var(--sand-11) !important;
      }
      .dark .navbar-toggle-btn:hover,
      .dark .navbar-toggle-btn:hover svg {
        color: var(--sand-11) !important;
        stroke: var(--sand-11) !important;
      }

      /* Shared nav-search styles */
      .nav-search {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.45rem;
        border-radius: 9999px;
        border: 1px solid var(--sand-6);
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(8px);
        height: 2rem;
      }
      .nav-search input {
        border: none;
        outline: none;
        background: transparent;
        color: var(--sand-12);
        font-size: 0.75rem;
        width: 150px;
      }
      .nav-search button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.35rem;
        height: 1.35rem;
        border-radius: 9999px;
        border: 1px solid var(--sand-6);
        background: var(--sand-1);
        color: var(--sand-7) !important;
        transition: all 0.2s ease;
      }
      .nav-search button svg {
        width: 0.8rem !important;
        height: 0.8rem !important;
        color: var(--sand-7) !important;
        stroke: var(--sand-7) !important;
      }
      .nav-search button:hover {
        border-color: var(--accent-7);
      }
      .nav-search button:hover,
      .nav-search button:hover svg {
        color: var(--sand-11) !important;
        stroke: var(--sand-11) !important;
      }
      .dark .nav-search {
        background: rgba(15, 15, 15, 0.7);
        border-color: var(--sand-7);
      }
      .dark .nav-search button {
        background: var(--sand-2);
        border-color: var(--sand-7);
      }
      .dark .nav-search button:hover {
        border-color: var(--accent-7);
      }
    `;
    document.head.appendChild(style);
  }

  const template = `
<nav
  class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1200px] rounded-full backdrop-blur-md shadow-xl shadow-black/5 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-9/10 hover:-translate-y-0.5"
  :class="theme === 'dark' ? 'bg-sand-1/70 supports-[backdrop-filter]:bg-sand-1/40' : 'bg-white/70 supports-[backdrop-filter]:bg-white/40'">
  <div class="px-6">
    <div class="flex h-14 items-center justify-between">
      <div class="flex items-center gap-12">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-3 text-accent-11 group-hover:bg-accent-4 transition-colors overflow-hidden">
            <img src="/public-pages/assets/logo.svg" alt="JojoCode Logo" class="w-6 h-6">
          </div>
          <span class="text-base font-bold text-sand-12 tracking-tight">JojoCode</span>
        </a>

        <!-- 导航链接 -->
        <div class="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/docs" class="text-sand-11 hover:text-accent-11 transition-colors relative group">
            文档
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-9 transition-all group-hover:w-full"></span>
          </a>
          <a href="/stats" class="text-sand-11 hover:text-accent-11 transition-colors relative group">
            统计
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-9 transition-all group-hover:w-full"></span>
          </a>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <form class="inline-flex nav-search" x-data="{ key: '' }"
          @submit.prevent="if (key.trim()) { window.location.href = '/stats?id=' + encodeURIComponent(key.trim()); }">
          <input type="text" x-model="key" placeholder="输入 API Key 查询" aria-label="输入 API Key 查询">
          <button type="submit">
            <i data-lucide="search" class="navbar-muted-icon"></i>
          </button>
        </form>

        <!-- 主题切换 -->
        <button type="button"
          class="navbar-toggle-btn flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
          @click="document.startViewTransition ? document.startViewTransition(() => theme = theme === 'light' ? 'dark' : 'light') : theme = theme === 'light' ? 'dark' : 'light'">
          <i x-show="theme === 'light'" data-lucide="sun" class="h-5 w-5"></i>
          <i x-show="theme === 'dark'" x-cloak data-lucide="moon" class="h-5 w-5"></i>
        </button>
      </div>
    </div>
  </div>
</nav>`;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-navbar]').forEach((el) => {
      el.innerHTML = template;
    });

    // Re-initialize Lucide icons after navbar is injected
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  });
})();
