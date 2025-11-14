import { spawn } from 'node:child_process'
import { createWriteStream, mkdirSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const logDir = path.resolve(process.cwd(), 'logs')
mkdirSync(logDir, { recursive: true })
const fileName = `expo-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
const logPath = path.join(logDir, fileName)
const logStream = createWriteStream(logPath, { flags: 'a' })

const child = spawn('npx', ['expo', 'start', ...args], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env,
})

child.stdout.on('data', (data) => {
  process.stdout.write(data)
  logStream.write(data)
})

child.stderr.on('data', (data) => {
  process.stderr.write(data)
  logStream.write(data)
})

child.on('close', (code) => {
  logStream.end(`\nProcess exited with code ${code ?? 0}\n`)
  process.exit(code ?? 0)
})
