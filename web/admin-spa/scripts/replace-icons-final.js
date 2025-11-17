#!/usr/bin/env node

/**
 * Script to replace Font Awesome icons with Lucide Icon component
 * Usage: node scripts/replace-icons-final.js [--dry-run] [--file=path/to/file.vue]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import glob from 'glob'

const { globSync } = glob

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Font Awesome to Lucide mapping (icon name only, without fa- prefix)
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
  'compress-alt': 'Minimize2',

  // Additional mappings for unmapped icons
  equals: 'Equal',
  'file-excel': 'FileSpreadsheet',
  'file-export': 'FileOutput',
  font: 'Type',
  gem: 'Gem',
  'hourglass-half': 'Hourglass',
  'id-badge': 'BadgeCheck',
  'list-alt': 'ListChecks',
  meteor: 'Sparkles',
  openai: 'Bot',
  palette: 'Palette',
  random: 'Shuffle',
  'redo-alt': 'RotateCw',
  retweet: 'Repeat',
  route: 'Route',
  sort: 'ArrowUpDown',
  'tachometer-alt': 'Gauge',
  ubuntu: 'Circle',
  'user-tag': 'UserCog',
  vial: 'TestTube',
  'volume-up': 'Volume2',
  windows: 'Square'
}

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const fileArg = args.find((arg) => arg.startsWith('--file='))
const singleFile = fileArg ? fileArg.split('=')[1] : null

// Function to replace Font Awesome icons in file content
function replaceIconsInContent(content, filePath) {
  let modified = content
  let replacements = []

  // Pattern to match <i class="...fas/far/fab fa-xxx..."> (self-closing and regular)
  const iconPattern =
    /<i\s+([^>]*?)class="([^"]*?)\b(?:fas|far|fab|fa)\s+fa-([\w-]+)([^"]*?)"([^>]*?)>(?:<\/i>)?/gs

  modified = modified.replace(iconPattern, (match, before, classList, iconName, afterIcon, after) => {
    const lucideIcon = iconMapping[iconName]

    if (lucideIcon) {
      // Extract other classes (not fa-related)
      const otherClasses = classList
        .split(/\s+/)
        .concat(afterIcon.split(/\s+/))
        .filter((c) => c && !c.match(/^(fa|fas|far|fab|fa-[\w-]+)$/))
        .join(' ')

      // Build the Icon component
      const classAttr = otherClasses ? ` class="${otherClasses}"` : ''
      const beforeAttrs = before.trim()
      const afterAttrs = after.trim()
      const allAttrs = [beforeAttrs, afterAttrs].filter(Boolean).join(' ')

      const iconComponent = `<Icon name="${lucideIcon}"${classAttr}${allAttrs ? ' ' + allAttrs : ''} />`

      replacements.push({
        from: iconName,
        to: lucideIcon,
        fullMatch: match.substring(0, 50) + '...'
      })

      return iconComponent
    }

    // If no mapping found, keep original but warn
    console.warn(`  ⚠ No mapping for icon: fa-${iconName} in ${filePath}`)
    return match
  })

  return { modified, replacements }
}

// Main function
async function main() {
  const srcDir = path.join(__dirname, '../src')

  // Find all .vue files
  let files
  if (singleFile) {
    files = [singleFile]
  } else {
    files = glob.sync('**/*.vue', { cwd: srcDir })
  }

  console.log(`Found ${files.length} Vue file(s) to process...\n`)

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n')
  }

  let totalReplacements = 0
  let modifiedFiles = 0
  const unmappedIcons = new Set()

  for (const file of files) {
    const filePath = singleFile ? file : path.join(srcDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const { modified, replacements } = replaceIconsInContent(content, filePath)

    if (modified !== content) {
      modifiedFiles++
      totalReplacements += replacements.length

      console.log(`\n📝 ${singleFile ? path.basename(file) : file}`)
      console.log(`   ${replacements.length} icon(s) to be replaced:`)

      replacements.forEach((r) => {
        console.log(`   fa-${r.from} → ${r.to}`)
      })

      if (!isDryRun) {
        fs.writeFileSync(filePath, modified, 'utf8')
        console.log(`   ✅ File updated`)
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 Summary:`)
  console.log(`   Files processed: ${files.length}`)
  console.log(`   Files modified: ${modifiedFiles}`)
  console.log(`   Icons replaced: ${totalReplacements}`)

  if (isDryRun) {
    console.log(`\n💡 Run without --dry-run to apply changes`)
  } else {
    console.log(`\n✅ All changes applied!`)
  }

  console.log(`${'='.repeat(60)}\n`)
}

main().catch(console.error)
