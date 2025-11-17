#!/usr/bin/env node

/**
 * Script to replace Font Awesome icons with Lucide icons
 * Usage: node scripts/replace-icons.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Font Awesome to Lucide mapping
const iconMapping = {
  // Navigation & Arrows
  'angle-double-left': 'ChevronsLeft',
  'angle-double-right': 'ChevronsRight',
  'angle-left': 'ChevronLeft',
  'angle-right': 'ChevronRight',
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'chevron-down': 'ChevronDown',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'chevron-up': 'ChevronUp',
  'arrows-alt': 'Maximize2',
  'exchange-alt': 'ArrowLeftRight',

  // Actions & Controls
  check: 'Check',
  'check-circle': 'CheckCircle',
  'check-square': 'CheckSquare',
  times: 'X',
  'times-circle': 'XCircle',
  plus: 'Plus',
  'plus-circle': 'PlusCircle',
  'plus-square': 'PlusSquare',
  minus: 'Minus',
  'minus-circle': 'MinusCircle',
  edit: 'Edit',
  pencil: 'Pencil',
  'pencil-alt': 'Edit2',
  trash: 'Trash',
  'trash-alt': 'Trash2',
  copy: 'Copy',
  save: 'Save',
  download: 'Download',
  upload: 'Upload',
  search: 'Search',
  filter: 'Filter',
  ban: 'Ban',
  redo: 'RotateCw',
  undo: 'RotateCcw',
  sync: 'RefreshCw',
  'sync-alt': 'RefreshCcw',
  refresh: 'RefreshCw',

  // UI Elements
  cog: 'Settings',
  cogs: 'Settings',
  bars: 'Menu',
  'ellipsis-v': 'MoreVertical',
  'ellipsis-h': 'MoreHorizontal',
  'grip-vertical': 'GripVertical',
  info: 'Info',
  'info-circle': 'Info',
  question: 'HelpCircle',
  'question-circle': 'HelpCircle',
  exclamation: 'AlertTriangle',
  'exclamation-circle': 'AlertCircle',
  'exclamation-triangle': 'AlertTriangle',
  bell: 'Bell',
  'shield-alt': 'Shield',
  shield: 'ShieldCheck',
  lock: 'Lock',
  unlock: 'Unlock',
  eye: 'Eye',
  'eye-slash': 'EyeOff',
  star: 'Star',
  heart: 'Heart',
  bookmark: 'Bookmark',

  // Files & Documents
  file: 'File',
  'file-alt': 'FileText',
  'file-code': 'FileCode',
  folder: 'Folder',
  'folder-open': 'FolderOpen',
  clipboard: 'Clipboard',
  'clipboard-list': 'ClipboardList',

  // Communication
  envelope: 'Mail',
  comment: 'MessageCircle',
  'comment-dots': 'MessageSquare',
  comments: 'MessagesSquare',
  inbox: 'Inbox',
  'paper-plane': 'Send',

  // Charts & Analytics
  'chart-line': 'LineChart',
  'chart-bar': 'BarChart3',
  'chart-pie': 'PieChart',
  'chart-area': 'AreaChart',
  database: 'Database',
  calculator: 'Calculator',

  // Time & Calendar
  clock: 'Clock',
  calendar: 'Calendar',
  'calendar-alt': 'CalendarDays',
  'calendar-check': 'CalendarCheck',
  'calendar-day': 'CalendarDays',
  'calendar-week': 'CalendarRange',
  stopwatch: 'Timer',
  hourglass: 'Hourglass',
  history: 'History',
  'pause-circle': 'PauseCircle',
  'play-circle': 'PlayCircle',
  infinity: 'Infinity',

  // Users & People
  user: 'User',
  'user-plus': 'UserPlus',
  'user-minus': 'UserMinus',
  'user-check': 'UserCheck',
  'user-times': 'UserX',
  'user-circle': 'UserCircle',
  users: 'Users',
  'user-shield': 'ShieldCheck',
  'user-cog': 'UserCog',

  // System & Status
  'power-off': 'Power',
  plug: 'Plug',
  wifi: 'Wifi',
  signal: 'Signal',
  'battery-full': 'Battery',
  'battery-half': 'BatteryMedium',
  'battery-quarter': 'BatteryLow',
  bolt: 'Zap',
  circle: 'Circle',
  'circle-notch': 'Loader',
  spinner: 'Loader2',

  // Code & Development
  code: 'Code',
  'code-branch': 'GitBranch',
  git: 'GitBranch',
  github: 'Github',
  terminal: 'Terminal',
  bug: 'Bug',

  // Media
  image: 'Image',
  camera: 'Camera',
  video: 'Video',
  play: 'Play',
  pause: 'Pause',
  stop: 'Square',

  // Business & Finance
  'dollar-sign': 'DollarSign',
  coins: 'Coins',
  'credit-card': 'CreditCard',
  'shopping-cart': 'ShoppingCart',
  tag: 'Tag',
  tags: 'Tags',

  // Cloud & Storage
  cloud: 'Cloud',
  'cloud-download-alt': 'CloudDownload',
  'cloud-upload-alt': 'CloudUpload',
  server: 'Server',
  hdd: 'HardDrive',

  // Network & Globe
  globe: 'Globe',
  link: 'Link',
  unlink: 'Unlink',
  share: 'Share',
  'share-alt': 'Share2',
  'external-link-alt': 'ExternalLink',

  // Misc
  home: 'Home',
  building: 'Building',
  key: 'Key',
  flag: 'Flag',
  crown: 'Crown',
  trophy: 'Trophy',
  gift: 'Gift',
  wrench: 'Wrench',
  tools: 'Wrench',
  magic: 'Wand2',
  brain: 'Brain',
  robot: 'Bot',
  rocket: 'Rocket',
  sun: 'Sun',
  moon: 'Moon',
  asterisk: 'Asterisk',
  'circle-half-stroke': 'Moon',
  'layer-group': 'Layers',
  'graduation-cap': 'GraduationCap',
  book: 'Book',
  lightbulb: 'Lightbulb',

  // Brands (mapped to generic icons)
  apple: 'Apple',
  aws: 'Cloud',
  discord: 'MessageCircle',
  google: 'Globe',
  microsoft: 'Box',
  slack: 'Hash',

  // Layout & Alignment
  th: 'Grid',
  'th-large': 'Grid3x3',
  'th-list': 'List',
  list: 'List',
  'list-ul': 'List',
  'list-ol': 'ListOrdered',
  table: 'Table',
  columns: 'Columns',

  // Toggle & Options
  'toggle-on': 'ToggleRight',
  'toggle-off': 'ToggleLeft',
  'sliders-h': 'SlidersHorizontal',

  // Activity & Status
  pulse: 'Activity',
  heartbeat: 'Activity',
  fire: 'Flame',
  snowflake: 'Snowflake',
  'bolt-lightning': 'Zap',

  // Special
  fingerprint: 'Fingerprint',
  qrcode: 'QrCode',
  barcode: 'Barcode',
  microchip: 'Cpu',
  memory: 'HardDrive',
  sitemap: 'Network',
  'project-diagram': 'Workflow',
  dove: 'Bird',
  'sign-out-alt': 'LogOut',
  'sign-in-alt': 'LogIn',
  'compress-alt': 'Minimize2'
}

// Function to replace Font Awesome icons in file content
function replaceIconsInContent(content) {
  let modified = content

  // Replace <i class="fas fa-xxx"> pattern
  modified = modified.replace(
    /<i\s+class="([^"]*?\b(?:fas|far|fab|fa)\s+fa-([\w-]+)[^"]*?)"\s*\/?\s*>/g,
    (match, classList, iconName) => {
      const lucideIcon = iconMapping[iconName]
      if (lucideIcon) {
        // Extract other classes (not fa-related)
        const otherClasses = classList
          .split(/\s+/)
          .filter((c) => !c.match(/^(fa|fas|far|fab|fa-[\w-]+)$/))
          .join(' ')

        return `<component :is="${lucideIcon}" ${otherClasses ? `class="${otherClasses}"` : ''} />`
      }
      return match
    }
  )

  // Replace v-if/v-else patterns with <i class="fa...">
  modified = modified.replace(
    /<i\s+(v-(?:if|else-if|else)[^>]*?)\s+class="([^"]*?\b(?:fas|far|fab|fa)\s+fa-([\w-]+)[^"]*?)"\s*\/?\s*>/g,
    (match, vDirective, classList, iconName) => {
      const lucideIcon = iconMapping[iconName]
      if (lucideIcon) {
        const otherClasses = classList
          .split(/\s+/)
          .filter((c) => !c.match(/^(fa|fas|far|fab|fa-[\w-]+)$/))
          .join(' ')

        return `<component ${vDirective} :is="${lucideIcon}" ${otherClasses ? `class="${otherClasses}"` : ''} />`
      }
      return match
    }
  )

  return modified
}

// Main function
async function main() {
  const srcDir = path.join(__dirname, '../src')

  // Find all .vue files
  const files = await glob('**/*.vue', { cwd: srcDir })

  console.log(`Found ${files.length} Vue files to process...`)

  let totalReplacements = 0
  let modifiedFiles = 0

  for (const file of files) {
    const filePath = path.join(srcDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const modified = replaceIconsInContent(content)

    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf8')
      modifiedFiles++

      // Count replacements
      const matches = (content.match(/<i\s+class="[^"]*?\bfa-/g) || []).length
      totalReplacements += matches
      console.log(`✓ ${file} (${matches} icons replaced)`)
    }
  }

  console.log(`\nDone! Modified ${modifiedFiles} files, replaced ${totalReplacements} icons.`)
  console.log(
    '\nNext steps:\n1. Import Lucide icons in your components\n2. Remove Font Awesome from main.js\n3. Test the application'
  )
}

main().catch(console.error)
