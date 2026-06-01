import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'pipe', ...opts })
    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (d) => (stdout += d.toString()))
    proc.stderr?.on('data', (d) => (stderr += d.toString()))
    proc.on('close', (code) => {
      if (code === 0) resolve({ code, stdout, stderr })
      else reject(new Error(`Command failed (${code}): ${stderr || stdout}`))
    })
  })
}

export async function renderToFilesBrowser(tree, outputDir, basename, assetsDir) {
  outputDir = path.resolve(outputDir)
  assetsDir = path.resolve(assetsDir)

  fs.mkdirSync(outputDir, { recursive: true })

  const treePath = path.join(outputDir, `${basename}_tree.json`)
  const pngPath = path.join(outputDir, `${basename}.png`)
  const htmlPath = path.join(outputDir, `${basename}.html`)

  fs.writeFileSync(treePath, JSON.stringify(tree, null, 2), 'utf8')

  const renderScript = path.join(projectRoot, 'scripts', 'render-to-png.mjs')
  await runCommand('node', [
    renderScript,
    '--tree',
    treePath,
    '--assets',
    assetsDir,
    '--out',
    pngPath,
    '--html',
    htmlPath,
  ])

  if (!fs.existsSync(pngPath)) throw new Error(`Render did not produce PNG: ${pngPath}`)
  return { png: pngPath, html: htmlPath }
}

