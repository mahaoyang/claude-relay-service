/**
 * Lucide Icon Resolver for unplugin-vue-components
 * Automatically imports Lucide icons when used in templates
 */
export function LucideIconsResolver() {
  // List of non-icon components to exclude
  const excludedComponents = [
    'RouterView',
    'RouterLink',
    'Transition',
    'TransitionGroup',
    'KeepAlive',
    'Suspense',
    'Teleport'
  ]

  return {
    type: 'component',
    resolve: (name) => {
      // Skip excluded components
      if (excludedComponents.includes(name)) {
        return
      }

      // Check if it's a Lucide icon (PascalCase format)
      // Lucide icons follow the pattern: IconName (e.g., ChevronLeft, User, etc.)
      if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
        // Import from lucide-vue-next
        return {
          name,
          from: 'lucide-vue-next'
        }
      }
    }
  }
}
