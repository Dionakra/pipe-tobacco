/**
 * Enriches pb.json and cm.json with tobacco properties from tr.json.
 *
 * For each tobacco (identified by brand + blend), finds the matching entry in
 * tr.json and merges in: blend_type, contents, flavoring, cut, country,
 * strength, flavoring_profile, room_note, taste.
 *
 * Matching strategy (in order):
 *   1. Exact normalized brand + blend
 *   2. Brand alias + exact normalized blend
 *   3. Blend-only match (if unique across all tr entries)
 *   4. Fuzzy token-overlap match (brand must match)
 *
 * Brand aliases (BRAND_ALIASES) and blend aliases (BLEND_ALIASES) allow
 * manual overrides for names that differ between your data and TobaccoReviews.
 *
 * Run via `npm run enrich` or automatically in `prebuild`.
 */
const fs = require('fs')
const path = require('path')

const PROPERTIES = [
  'blend_type',
  'contents',
  'flavoring',
  'cut',
  'country',
  'strength',
  'flavoring_profile',
  'room_note',
  'taste',
]

// Spanish translations for categorical property values.
// contents and flavoring are left as-is (proper names / already Spanish).
const TRANSLATIONS = {
  blend_type: {
    'American': 'Americano',
    'Aromatic': 'Aromático',
    'Aromatična': 'Aromático',
    'aromático': 'Aromático',
    '芳香族': 'Aromático',
    'Balkan': 'Balcánico',
    'Burley Based': 'Base de Burley',
    'Cavendish Based': 'Base de Cavendish',
    'Cigar Leaf Based': 'Base de hoja de cigarro',
    'English': 'Inglés',
    'Oriental': 'Oriental',
    'Other': 'Otro',
    'Scottish': 'Escocés',
    'Straight Virginia': 'Virginia puro',
    'Virginia Based': 'Base de Virginia',
    'Virginia/Burley': 'Virginia/Burley',
    'Virginia/Latakia': 'Virginia/Latakia',
    'Virginia/Perique': 'Virginia/Perique',
  },
  cut: {},
  country: {
    'Argentina': 'Argentina',
    'Austria': 'Austria',
    'Belgium': 'Bélgica',
    'Brazil': 'Brasil',
    'Canada': 'Canadá',
    'Czech Republic': 'República Checa',
    'Denmark': 'Dinamarca',
    'France': 'Francia',
    'Germany': 'Alemania',
    'Greece': 'Grecia',
    'Indonesia': 'Indonesia',
    'Ireland': 'Irlanda',
    'Italy': 'Italia',
    'Japan': 'Japón',
    'Mexico': 'México',
    'Netherlands': 'Países Bajos',
    'Russia': 'Rusia',
    'South Africa': 'Sudáfrica',
    'Sweden': 'Suecia',
    'Switzerland': 'Suiza',
    'Turkey': 'Turquía',
    'United Kingdom': 'Reino Unido',
    'United States': 'Estados Unidos',
    'Unknown': 'Desconocido',
  },
  strength: {
    'Extremely Mild': 'Extremadamente suave',
    'Extremely Strong': 'Extremadamente fuerte',
    'Medium': 'Medio',
    'Medium to Strong': 'Medio a fuerte',
    'Mild': 'Suave',
    'Mild to Medium': 'Suave a medio',
    'Overwhelming': 'Aplastante',
    'Strong': 'Fuerte',
    'Very Mild': 'Muy suave',
    'Very Strong': 'Muy fuerte',
  },
  flavoring_profile: {
    'Extra Strong': 'Extra fuerte',
    'Extremely Mild': 'Extremadamente suave',
    'Medium': 'Medio',
    'Medium to Strong': 'Medio a fuerte',
    'Mild': 'Suave',
    'Mild to Medium': 'Suave a medio',
    'None Detected': 'Ninguno',
    'Strong': 'Fuerte',
    'Very Mild': 'Muy suave',
    'Very Strong': 'Muy fuerte',
  },
  room_note: {
    'Extra Strong': 'Extra fuerte',
    'Overwhelming': 'Aplastante',
    'Pleasant': 'Agradable',
    'Pleasant to Tolerable': 'Agradable a tolerable',
    'Strong': 'Fuerte',
    'Tolerable': 'Tolerable',
    'Tolerable to Strong': 'Tolerable a fuerte',
    'Unnoticeable': 'Imperceptible',
    'Very Pleasant': 'Muy agradable',
    'Very Strong': 'Muy fuerte',
  },
  taste: {
    'Extra Full': 'Extra intenso',
    'Extremely Mild (Flat)': 'Extremadamente suave (plano)',
    'Full': 'Intenso',
    'Medium': 'Medio',
    'Medium to Full': 'Medio a intenso',
    'Mild': 'Suave',
    'Mild to Medium': 'Suave a medio',
    'Overwhelming': 'Aplastante',
    'Very Full': 'Muy intenso',
    'Very Mild': 'Muy suave',
  },
}

function translate(prop, value) {
  if (value == null) return value
  const dict = TRANSLATIONS[prop]
  if (!dict) return value
  return dict[value] != null ? dict[value] : value
}

// Brand aliases: pb brand (normalized) -> tr brand (normalized)
const BRAND_ALIASES = {
  'amsterdamer': 'amsterdam tabaco',
  'big ben': 'mac baren',
  'comoys': 'comoy s of london',
  'g hoggarth': 'gawith hoggarth co',
  'g l pease': 'g l pease',
  'golden blends': 'golden blend tobacco co',
  'mac lintock': 'maclintock',
  'rattrays': 'rattray',
  'kopp': 'kohlhase kopp kg',
  'sailors pride': 'sailors pride',
  'smokers choice': 'smokers corner',
  'stanley': 'stanwell',
  'colts': 'colt',
  'barsdorfs bester': 'kaptn barsdorfs bester',
  'bakerstreet': 'baker street',
  'eastenders': 'the eastern company',
  'indian summer': 'indian summer',
  'astleys': 'astley s'
}

// Blend aliases: pb blend (normalized) -> tr blend (normalized)
// Keys can be global ('blend') or brand-qualified ('brand|blend') to avoid
// collisions when different brands share a blend name.
// Brand-qualified keys use the pb brand (before BRAND_ALIASES).
const BLEND_ALIASES = {
  'blau blend 369': '369 blue label',
  'gold blend 779': '779 english mixture',
  'rot blend 131': '131 red label',
  'n 1':'vanilla no 1',
  'caribbean blue drake':'drake',
  'caribbean blue bellamy':'bellamy',
  'caribbean blue graham':'graham',
  'caribbean blue rakham':'rackham',
  'chacom|n 1': 'chacom|1',
  'chacom|n 2': 'chacom|2',
  'chacom|n 3': 'chacom|3',
  'chacom|n 4': 'chacom|4',
  'chacom|no 5': 'chacom|5',
  'chacom|no 6': 'chacom|6',
  'waterloo 2':'waterloo no 2 mixture',
  'full':'amphora full aroma',
  'copper':'copper highland malt whisky',
  'bronze': 'mixture with bourbon whiskey bronze',
  'malt bronze': 'copper highland malt whisky',
  'sungold': 'vanilla cavendish sungold',
  'original navy cut': 'capstan original navy cut',
  'erinmore|flake lata': 'erinmore flake',
  'erinmore|mixture lata': 'erinmore mixture',
  'caporal': 'scaferlati caporal rouge',
  'skandinavik|navy': 'skandinavik navy',
  'skandinavik|mixture': 'skandinavik mixture',
  'amsterdamer|': 'mac baren|amsterdamer',
  'clan|': 'clan aromatic original',
  'half half|': 'half half',
  'indian summer|': 'indian summer',
  'kentucky bird|': 'kentucky bird',
  'st bruno|ready rubbed': 'st bruno ready rubbed',
  'british collection bagpiper s dream':'bagpiper s dream',
  'british collection black mallory tobacco': 'black mallory',
  'british collection brown clunee': 'brown clunee',
  'british collection hal o the wynd':'hal o the wynd',
  'british collection marlin flake':'marlin flake',
  'british collection 7 old gowrie':'old gowrie',
  'british collection red rapparee tobacco': 'red rapparee',
  'british collection 7 reserve': '7 reserve',
  'bob s ch flake':'bob s chocolate flake',
  'samuel gawith|hoggarth balkan mixture': 'gawith hoggarth co|balkan mixture',
  'speakeasy navy blend':'speakeasy',
  'odissey':'odyssey',
  'cabbie s roll cut': 'cabbie s mixture',
  'capstan|gold navy cut': 'capstan gold navy cut',
  'barsdorf s bester|bright virginia':'kapt n barsdorf s bester|bright virginia',
  'barsdorf s bester|red easy burn':'kapt n barsdorf s bester|red formerly cherry',
  'w o larsen|signature': 'w o larsen|signature vintage mixture',
  'davidoff|argentina pipe tobacco': 'davidoff|argentina cavendish',
  'davidoff|brazil pipe tobacco': 'davidoff|brazil virginia',
  'davidoff|malawi pipe tobacco': 'davidoff|malawi dark cavendish',
  'barsdorf s bester|mixture': 'von eicken|barsdorf aromatic mixture',
  'sailor s pride|blond virginia': 'sailor s pride blond virginia pipe tobacco',
  'condor|':'gallaher limited|condor ready rubbed green',
  'doctor pipe|dark diamond lata': 'doctor diamond|dark diamond',
  'gladora pesse canoe|tin blue pearl':'gladora tobacco|blue pearl',
  'cavendish braun brown': 'cavendish',
  'astleys|n 1 mixture': 'no 1 medium latakia mixture',
  'astleys|n 2 mixture': 'no 2 virginia mixture',
  'astleys|n 55 elisabethian': 'no 55 elizabethan',
  'astleys|n 99 royal tudor':'no 99 royal tudor full latakia mixture'
}

function norm(s) {
  if (!s) return ''
  let n = s.toLowerCase().normalize('NFD')
  // Strip combining marks (accents)
  n = n.replace(/[\u0300-\u036f]/g, '')
  // Remove punctuation
  n = n.replace(/[^a-z0-9\s]/g, ' ')
  // Collapse whitespace
  n = n.replace(/\s+/g, ' ').trim()
  return n
}

function normBlend(s) {
  let n = norm(s)
  // For bilingual names like "Blau/Blue", prefer the last part (usually English)
  if (n.includes('/')) {
    const parts = n.split('/').map(p => p.trim()).filter(Boolean)
    if (parts.length > 1) n = parts[parts.length - 1]
  }
  return n
}

function loadJSON(file) {
  const dataPath = path.join(__dirname, '..', 'data', file)
  const publicPath = path.join(__dirname, '..', 'public', file)
  if (fs.existsSync(dataPath)) return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  return JSON.parse(fs.readFileSync(publicPath, 'utf8'))
}

function saveJSON(file, data) {
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', file),
    JSON.stringify(data) + '\n'
  )
}

function buildTrIndexes(tr) {
  // Index 1: (normBrand, normBlend) -> entry
  const exact = new Map()
  // Index 2: normBlend -> entries[] (for blend-only matching)
  const byBlend = new Map()
  // Index 3: normBrand -> [(normBlend, entry)] (for fuzzy within brand)
  const byBrand = new Map()

  for (const e of tr) {
    const b = norm(e.brand)
    const bl = normBlend(e.blend)
    exact.set(`${b}\0${bl}`, e)
    if (!byBlend.has(bl)) byBlend.set(bl, [])
    byBlend.get(bl).push(e)
    if (!byBrand.has(b)) byBrand.set(b, [])
    byBrand.get(b).push([bl, e])
  }
  return { exact, byBlend, byBrand }
}

function tokenize(s) {
  return new Set(s.split(' ').filter(t => t.length > 1))
}

function fuzzyMatch(candidates, targetBlend) {
  const targetTokens = tokenize(targetBlend)
  let bestEntry = null
  let bestScore = 0
  for (const [candBlend, entry] of candidates) {
    const candTokens = tokenize(candBlend)
    let overlap = 0
    for (const t of targetTokens) {
      if (candTokens.has(t)) overlap++
    }
    const score = overlap / Math.max(targetTokens.size, candTokens.size)
    if (score > bestScore && score >= 0.5) {
      bestScore = score
      bestEntry = entry
    }
  }
  return bestEntry
}

function matchTobacco(tobacco, indexes) {
  const pbBrand = norm(tobacco.brand)
  const pbBlend = normBlend(tobacco.blend)
  const aliasBrand = BRAND_ALIASES[pbBrand] || pbBrand

  // Blend alias: check brand-qualified first (original + alias brand), then global
  // Value can be "trBlend" (blend only) or "trBrand|trBlend" (override both)
  const rawAlias =
    BLEND_ALIASES[`${pbBrand}|${pbBlend}`] ||
    BLEND_ALIASES[`${aliasBrand}|${pbBlend}`] ||
    BLEND_ALIASES[pbBlend]

  // Direct override: alias specifies both brand and blend
  if (rawAlias && rawAlias.includes('|')) {
    const [ovBrand, ovBlend] = rawAlias.split('|')
    const match = indexes.exact.get(`${ovBrand}\0${ovBlend}`)
    if (match) return match
  }

  const aliasBlend = rawAlias && !rawAlias.includes('|') ? rawAlias : pbBlend

  // 1. Exact (brand alias + blend alias)
  let match = indexes.exact.get(`${aliasBrand}\0${aliasBlend}`)
  if (match) return match

  // 1b. Exact (original brand + blend alias)
  match = indexes.exact.get(`${pbBrand}\0${aliasBlend}`)
  if (match) return match

  // 1c. Exact (brand alias + original blend)
  match = indexes.exact.get(`${aliasBrand}\0${pbBlend}`)
  if (match) return match

  // 1d. Exact (original brand + original blend)
  match = indexes.exact.get(`${pbBrand}\0${pbBlend}`)
  if (match) return match

  // 2. Blend-only match (if unique) — try alias first, then original
  const blendMatches = indexes.byBlend.get(aliasBlend)
  if (blendMatches && blendMatches.length === 1) return blendMatches[0]
  if (aliasBlend !== pbBlend) {
    const blendMatches2 = indexes.byBlend.get(pbBlend)
    if (blendMatches2 && blendMatches2.length === 1) return blendMatches2[0]
  }

  // 3. Fuzzy within brand (alias brand)
  const brandCandidates = indexes.byBrand.get(aliasBrand)
  if (brandCandidates) {
    match = fuzzyMatch(brandCandidates, pbBlend)
    if (match) return match
  }

  // 3b. Fuzzy within brand (original brand)
  const brandCandidates2 = indexes.byBrand.get(pbBrand)
  if (brandCandidates2 && brandCandidates2 !== brandCandidates) {
    match = fuzzyMatch(brandCandidates2, pbBlend)
    if (match) return match
  }

  return null
}

function enrichFile(file, indexes) {
  const tobaccos = loadJSON(file)
  let matched = 0
  let unmatched = 0

  for (const t of tobaccos) {
    const entry = matchTobacco(t, indexes)
    if (entry) {
      matched++
      for (const prop of PROPERTIES) {
        t[prop] = translate(prop, entry[prop] ?? null)
      }
    } else {
      unmatched++
      for (const prop of PROPERTIES) {
        if (!(prop in t)) t[prop] = null
      }
    }
  }

  console.log(`  ${file}: ${matched} matched, ${unmatched} unmatched (${Math.round(matched / (matched + unmatched) * 100)}%)`)
  saveJSON(file, tobaccos)
}

function main() {
  console.log('Loading tr.json...')
  const tr = loadJSON('tr.json')
  console.log(`  ${tr.length} entries in tr.json`)

  const indexes = buildTrIndexes(tr)

  console.log('Enriching pb.json...')
  enrichFile('pb.json', indexes)

  console.log('Enriching cm.json...')
  enrichFile('cm.json', indexes)

  console.log('Done.')
}

main()
