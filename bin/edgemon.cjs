#!/usr/bin/env node

const { spawn } = require('node:child_process')
const { randomUUID } = require('node:crypto')
const WebSocket = require('ws')

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
\x1b[36mEdgeMon — Edge Task Monitor CLI\x1b[0m

Usage:
  edgemon <command> [args...]

Examples:
  edgemon npm run dev
  edgemon npm run build
  edgemon docker compose up
  edgemon pnpm dev
  edgemon cargo run
`)
  process.exit(0)
}

const taskId = randomUUID()
const fullCommand = args.join(' ')
const cwd = process.cwd()

const WS_URL = 'ws://127.0.0.1:45454'
let ws = null
let connected = false

try {
  ws = new WebSocket(WS_URL)

  ws.on('open', () => {
    connected = true
    ws.send(
      JSON.stringify({
        type: 'TASK_START',
        payload: {
          id: taskId,
          command: fullCommand,
          cwd,
          pid: child.pid,
          startTime: Date.now()
        }
      })
    )
  })

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())
      if (msg.type === 'TASK_KILL' && msg.payload.id === taskId) {
        console.log(`\n\x1b[33m[edgemon] Terminated by Edge Shelf\x1b[0m`)
        if (process.platform === 'win32') {
          // On Windows, taskkill /T kills process tree
          if (child.pid) {
            spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'])
          }
        } else {
          child.kill('SIGINT')
        }
      }
    } catch {
      // Ignore
    }
  })

  ws.on('error', () => {
    // If desktop app is not running, silent fallback
    connected = false
  })
} catch {
  connected = false
}

// Spawn the actual command
const child = spawn(fullCommand, {
  shell: true,
  cwd,
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe']
})

function sendOutput(text, isError = false) {
  if (connected && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'TASK_OUTPUT',
        payload: {
          id: taskId,
          text,
          isError
        }
      })
    )
  }
}

child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk)
  sendOutput(chunk.toString())
})

child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk)
  sendOutput(chunk.toString(), true)
})

child.on('close', (code) => {
  if (connected && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'TASK_EXIT',
        payload: {
          id: taskId,
          exitCode: code,
          endTime: Date.now()
        }
      })
    )
    ws.close()
  }
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  console.error(`\x1b[31m[edgemon] Failed to start command: ${err.message}\x1b[0m`)
  if (connected && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'TASK_EXIT',
        payload: {
          id: taskId,
          exitCode: 1,
          endTime: Date.now()
        }
      })
    )
    ws.close()
  }
  process.exit(1)
})
