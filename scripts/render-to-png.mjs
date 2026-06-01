#!/usr/bin/env node
/**
 * Render Design Tree JSON → PNG via headless Chromium (Playwright).
 * Used by the pipeline compare loop.
 *
 * Usage:
 *   node scripts/render-to-png.mjs --tree path/to/tree.json --assets path/to/assets --out path/to/out.png
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { buildHtmlDocument } from './html-from-tree.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '')
    args[key] = argv[i + 1]
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)
  const treePath = path.resolve(args.tree)
  const assetsDir = path.resolve(args.assets || path.dirname(treePath))
  const outPath = path.resolve(args.out)
  const htmlPath = args.html ? path.resolve(args.html) : outPath.replace(/\.png$/i, '.html')

  if (!fs.existsSync(treePath)) {
    console.error(`Tree file not found: ${treePath}`)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(treePath, 'utf8'))
  const tree = {
    width: Number(raw.width) || 1080,
    height: Number(raw.height) || 1080,
    backgroundColor: raw.backgroundColor ?? '#ffffff',
    children: raw.children ?? raw.regions ?? [],
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  const html = buildHtmlDocument(tree, assetsDir, htmlPath)
  fs.writeFileSync(htmlPath, html, 'utf8')

  let playwright
  try {
    playwright = await import('playwright')
  } catch {
    console.error(
      'Playwright not installed. Run: cd workspace/design_tree_pipeline_js && npm install && npm run setup-browser',
    )
    process.exit(2)
  }

  const browser = await playwright.chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({
      viewport: { width: tree.width, height: tree.height },
      deviceScaleFactor: 1,
    })

    // file:// page + relative asset paths — setContent blocks file:// images
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle', timeout: 30000 })

    await page
      .waitForFunction(
        () => {
          const imgs = Array.from(document.querySelectorAll('#frame img'))
          return imgs.length === 0 || imgs.every((img) => img.complete && img.naturalWidth > 0)
        },
        { timeout: 15000 },
      )
      .catch(() => {})

    await page.screenshot({
      path: outPath,
      type: 'png',
      clip: { x: 0, y: 0, width: tree.width, height: tree.height },
    })
    console.log(outPath)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

