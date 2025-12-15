const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

function repoPath(...parts) {
  return path.join(__dirname, '..', ...parts)
}

function binPath(...parts) {
  const isWindows = process.platform === 'win32'
  const fullPath = repoPath(...parts)
  if (isWindows && !fullPath.endsWith('.cmd')) {
    return `${fullPath}.cmd`
  }
  return fullPath
}

function assertExists(filePath, hint) {
  if (fs.existsSync(filePath)) {
    return
  }
  console.error(`[dev] Missing: ${filePath}`)
  if (hint) {
    console.error(hint)
  }
  process.exit(1)
}

const cwd = repoPath()

const nodemonBin = binPath('node_modules', '.bin', 'nodemon')
assertExists(nodemonBin, '[dev] Run `npm install` at repo root first.')

const tailwindBin = binPath('web', 'admin-spa', 'node_modules', '.bin', 'tailwindcss')
assertExists(
  tailwindBin,
  '[dev] Run `npm run install:web` (or `cd web/admin-spa && npm install`) first.'
)

const tailwindConfig = repoPath('web', 'public-pages', 'tailwind.public-pages.config.cjs')
const tailwindInput = repoPath('web', 'public-pages', 'assets', 'tailwind-public-pages.input.css')
const tailwindOutput = repoPath('web', 'public-pages', 'assets', 'tailwind-public-pages.css')

assertExists(tailwindConfig)
assertExists(tailwindInput)

const procs = []
let shuttingDown = false

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }
  shuttingDown = true
  for (const proc of procs) {
    if (!proc.killed) {
      proc.kill('SIGINT')
    }
  }
  process.exit(exitCode)
}

function spawnChild(name, command, args) {
  const child = spawn(command, args, { stdio: 'inherit', cwd })
  procs.push(child)
  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return
    }
    if (signal) {
      console.error(`[dev] ${name} exited with signal ${signal}`)
      return shutdown(1)
    }
    if (code && code !== 0) {
      console.error(`[dev] ${name} exited with code ${code}`)
      return shutdown(code)
    }
    shutdown(0)
  })
  return child
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

spawnChild('server (nodemon)', nodemonBin, [])
spawnChild('tailwind (public-pages)', tailwindBin, [
  '-c',
  tailwindConfig,
  '-i',
  tailwindInput,
  '-o',
  tailwindOutput,
  '--watch'
])
