/**
 * Generates src/logos.json — a static manifest of brand logos available
 * in public/logos/. This avoids a runtime GitHub API call to list the
 * directory contents.
 *
 * Run automatically before dev/build via npm scripts (predev/prebuild).
 */
const fs = require('fs')
const path = require('path')

const logosDir = path.join(__dirname, '..', 'public', 'logos')
const outFile = path.join(__dirname, '..', 'src', 'logos.json')

const files = fs.existsSync(logosDir)
  ? fs.readdirSync(logosDir).filter(f => f.endsWith('.svg'))
  : []

const brands = files.map(f => f.replace(/\.svg$/, '')).sort()

fs.writeFileSync(outFile, JSON.stringify(brands, null, 2) + '\n')
console.log(`Generated src/logos.json with ${brands.length} logos`)
