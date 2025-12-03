(() => {
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
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-3 text-accent-11 group-hover:bg-accent-4 transition-colors">
            <i data-lucide="code-2" class="w-5 h-5"></i>
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
            <i data-lucide="search" class="text-sand-9"></i>
          </button>
        </form>

        <!-- 主题切换 -->
        <button type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-sand-4 text-sand-11 hover:text-sand-12 active:scale-95"
          @click="document.startViewTransition ? document.startViewTransition(() => theme = theme === 'light' ? 'dark' : 'light') : theme = theme === 'light' ? 'dark' : 'light'">
          <i x-show="theme === 'light'" data-lucide="sun" class="h-5 w-5 text-sand-11"></i>
          <i x-show="theme === 'dark'" x-cloak data-lucide="moon" class="h-5 w-5 text-sand-11"></i>
        </button>
      </div>
    </div>
  </div>
</nav>`;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-navbar]').forEach((el) => {
      el.innerHTML = template;
    });
  });
})();
