import fs from "fs"
import BOEEntry from "./models/BOEEntry"
import BOEDocumentExtractor from "./services/BOEDocumentExtractor"
import { Tobacco, TobaccoBlendPrice, TobaccoPrice } from "./models/Tobacco"

const BASE_PATH = __dirname + "/../public"
const BOE_PATH = BASE_PATH + "/boe.json"
const HTML_PATH = BASE_PATH + "/html/"
const CSV_PATH = BASE_PATH + "/csv"
const PB_DB = BASE_PATH + "/pb.json" // Peninsula e Illes Balears
const CM_DB = BASE_PATH + "/cm.json" // Ceuta y Melilla

const shishaBrands: string[] = ["187", "Adalya", "Afendi", "Al-Waha", "Al Fakher", "Al Andalus", "Al Rayan", "Al Sultan Molasses", "Al Waha", "Al-Katar", "Almassiva", "Aloha", "Alrayan", "Alwazir", "AQM",
  "Arábica Molasses", "Revoshi", "Social Smoke", "Ziggy", "Azure", "Anda", "Apocalypse", "Arabica Molasses", "Blackburn", "Blaze", "Blue Horse", "Zomo", "Zain", "Wazir", "Vipo Hookah Tobacco", "True Passion",
  "Trifecta", "Torres", "Titanium", "Tipsy", "Tarifa", "Tangiers", "Taboo", "Tabaco para pipa de agua Savacco", "Surfari", "Street Smoke", "Starline", "Starbuzz", "Springwater", "Shisha", "Serbetli", "Sebero",
  "SB Starbuzz", "Savacco", "Privilege", "Prestige", "Overdozz", "Os", "Neo", "Nash", "Nativo", "Natur", "Nameless", "Nakhla", "Musth", "Mr. Shisha", "Moe's", "Mazaya", "Marif", "Mammut", "Mala Vida", "Le Baron",
  "Layalina", "Kooliche", "Kismet", "Khaleej", "Kalout", "Kalam", "John Brooks", "Indian Summer", "Ibiza Essence", "Hookain", "Holster", "Haze", "Hater", "Fumari", "Forever", "Flame", "Eternal", "Ernest", "Erasmus",
  "Element", "Dumanji", "Duft", "Dschinni", "Drugoy", "Dozaj", "Delta", "Del Mar", "Darkside", "Dark Smoke", "Cornell & Diehl", "Cleopatra Molasses", "Chronos", "Chaos", "Chillma", "Capital", "Cannibal", "Candelas",
  "Camino", "Camel Vapeleaf Bolsa", "Sindbad Mint Water Pipe Tobacco", "Capìtal Bra Lecker Lecker", "Black Jack Life is a Gamble", "Black Jack Life's a gamble"]
const pipeBrands: string[] = ["W.O. Larsen", "Wessex", "Van Dijck", "Trucco", "Troost", "Trébol", "Touareg", "Tilbury", "Texas Republic", "Thomas Radford", "Sweet Dublin", "Sting", "Stanwell", "Stanley", "Stanislaw",
  "St. Bruno", "Special Star", "Solani", "Smokers Freedom", "Smokers Choice", "Skull", "Skandinavik", "Sioux Original", "Sillem's", "Selesta", "Scottish Corner", "Scaferlati", "Savinelli", "Samuel Gawith", "Sailor´s Pride",
  "Sahara", "Sacramento", "Robert Lewis", "Retro", "Redfield", "Red Wolf", "Rattray's", "Planta", "El Abuelo", "Peterson", "Peter Clark", "Olsen", "Oboe", "Nording", "Moon Habana", "Missisipi", "Mcconnell", "Master Cut",
  "Mark Adams", "Macbaren", "Mac Lintock", "Mac Baren", "Look Out", "Lince", "La Tribu", "La Pinta", "La Oveja Negra", "Kiowa", "Kingston", "Keops", "Kentucky Bird", "Jockey", "Holger Danske", "Hampton", "Half & Half",
  "Golden Blend's", "Gladora Pesse Canoe", "G.L. Pease", "G. Hoggarth", "Fribourg & Treyer", "Frérot", "Exclusiv Mixture", "Erinmore", "Elixyr", "El Puerto", "El Burladero", "El Bruc", "Eastwood", "Dunhill", "Duende",
  "DJ Pipe Tobacco", "Davidoff", "Danske Club", "Danish Blend", "Dan Tobacco", "Cuzco", "Condor", "Comoys", "Colts", "Colonial Dan Tobacco", "Clan", "Chacom", "Cellini", "Capstan", "Calumé Pipa", "Bullbrand", "Brujito",
  "Brookfield", "Brigg", "Bravo", "Borkum Riff", "Black V.", "Black Jack Life's a Gamble", "Big Chief", "Big Ben", "Bentley", "Bellini", "Bayside", "Barsdorf's Bester", "Bakerstreet", "Backwoods", "Astleys", "Ashton",
  "Apache", "Amsterdamer", "Amphora", "American Street", "Alsbo", "Alpha", "Alonso", "Absolutely Special"]

const brandMaps: Map<string, string> = new Map<string, string>([
  ["WO Larsen Wøl", "W.O. Larsen"],
  ["WØL", "W.O. Larsen"],
  ["Wøl", "W.O. Larsen"],
  ["Smoker´s Choice", "Smokers Choice"],
  ["T.Radford Sunday S Fant.", "Thomas Radford Sunday's Fantasy"],
  ["Rodeo By Gawith, Hoggarth & Co", "G. Hoggarth Rodeo"],
  ["Picadura de pipa El Abuelo", "El Abuelo Picadura de Pipa"],
  ["Noth Star By Gawith, Hoggarth & Co", "G. Hoggarth North Star"],
  ["Macbaren", "Mac Baren"],
  ["Kendal Mixed By Gawith, Hoggarth & Co", "G. Hoggarth Kendal Mixed"],
  ["Kendal Gold By Gawith, Hoggarth & Co", "G. Hoggarth Kendal Gold"],
  ["Hampton's", "Hampton"],
  ["Golden Blend S", "Golden Blend's"],
  ["Gladora Tobacco Pesse", "Gladora Pesse Canoe"],
  ["G.Hoggarth", "G. Hoggarth"],
  ["Absolutely Special As Life's A Gamble", "Absolutely Special"],
  ["A.S. Absolutely Special", "Absolutely Special"]
])

main()

async function main() {
  // Load BOE history
  let boes: BOEEntry[] = JSON.parse(fs.readFileSync(BOE_PATH, 'utf-8'))
  boes = boes.sort((a, b) => parseInt(`${b.year}${b.month}${b.day}`) - parseInt(`${a.year}${a.month}${a.day}`))

  // Load pipe tobaccos from snapshot
  const pipeTobaccos: string[] = getPipeTobaccos()
  const extractor: BOEDocumentExtractor = new BOEDocumentExtractor()

  let peninsulaDB: Tobacco[] = []
  let ceutaDB: Tobacco[] = []

  // Loop through all boes
  for (const boe of boes) {

    // For Parse the BOE's HTML and get the tobaccos
    console.info(`Parsing BOE ${boe.id}`)
    const html = fs.readFileSync(`${HTML_PATH}/${boe.id}.html`, 'utf-8')
    let peninsulaTobaccos: TobaccoPrice[] = extractor.getTobaccos(html, false)
    let ceutaTobaccos: TobaccoPrice[] = extractor.getTobaccos(html, true)

    // If nothing is found, there is a problem with the extraction
    if (peninsulaTobaccos.length == 0 && ceutaTobaccos.length == 0) {
      console.error(`No tobaccos found for ${boe.id}`)
      process.exit(-1)
    }

    // Get only Tobacco Pipes, not Shisha Pipes
    peninsulaTobaccos = peninsulaTobaccos.filter(t => pipeTobaccos.find(p => t.name.startsWith(p)) != undefined)
    ceutaTobaccos = ceutaTobaccos.filter(t => pipeTobaccos.find(p => t.name.startsWith(p)) != undefined)

    // Update each database based on the new information
    peninsulaDB = updateTobaccos(peninsulaDB, peninsulaTobaccos, boe)
    ceutaDB = updateTobaccos(ceutaDB, ceutaTobaccos, boe)
  }

  peninsulaDB = fillMissingFromDB(peninsulaDB)
  ceutaDB = fillMissingFromDB(ceutaDB)

  fs.writeFileSync(PB_DB, JSON.stringify(peninsulaDB))
  fs.writeFileSync(CM_DB, JSON.stringify(ceutaDB))
}

function fillMissingFromDB(db: Tobacco[]): Tobacco[] {
  const missing = getParsedPipeTobaccos().filter(ppt => {
    const blend = parseTobacco(ppt.name);
    if (blend == undefined) {
      return false
    }
    return db.find(p => p.brand == blend.brand && p.blend == blend.blend) == undefined
  })
  return updateTobaccos(db, missing)
}

function updateTobaccos(tobaccos: Tobacco[], tobaccoPrices: TobaccoPrice[], boe?: BOEEntry): Tobacco[] {
  const date = boe ? `${boe.day}/${boe.month}/${boe.year}` : '12/09/2024'
  tobaccoPrices.forEach(tp => {
    const blendPrice = parseTobacco(tp.name)
    if (blendPrice == undefined) return
    let tobaccoIndex = tobaccos.findIndex(t => t.brand == blendPrice.brand && t.blend == blendPrice.blend)
    if (tobaccoIndex == -1) {
      console.info(`Adding new tobacco: ${blendPrice.brand} ${blendPrice.blend} ${blendPrice.grams}`)
      const tobacco = {
        brand: blendPrice.brand,
        blend: blendPrice.blend,
        sizes: [{
          grams: blendPrice.grams,
          currentPrice: tp.price,
          lastUpdate: date,
          priceHistory: [{ date: date, price: tp.price }]
        }]
      }
      tobaccos.push(tobacco)
    } else {
      const sizeIndex = tobaccos[tobaccoIndex].sizes.findIndex(s => s.grams == blendPrice.grams)
      if (sizeIndex == -1) {
        console.info(`Adding new size: ${blendPrice.brand} ${blendPrice.blend} ${blendPrice.grams}`)
        tobaccos[tobaccoIndex].sizes.push({
          grams: blendPrice.grams,
          currentPrice: tp.price,
          lastUpdate: date,
          priceHistory: [{ date: date, price: tp.price }]
        })
      } else {
        console.info(`Updating Tobacco Price: ${blendPrice.brand} ${blendPrice.blend} ${blendPrice.grams}`)
        tobaccos[tobaccoIndex].sizes[sizeIndex].priceHistory.push({ date: date, price: tp.price })
      }
    }
  })

  return tobaccos
}

function parseTobacco(name: string): TobaccoBlendPrice | undefined {

  for (const toBeReplaced of brandMaps.keys()) {
    name = name.replace(toBeReplaced, brandMaps.get(toBeReplaced) || "")
  }

  const brand = pipeBrands.find(b => name.startsWith(b))
  if (!brand) {
    console.warn(`Tobacco not currently selling: ${name}`)
    return undefined
  }

  const blend = name.replace(brand, "").replace(/\(\d+\s*gr*\)*/i, "").trim()
  let maybeGrams = /\((\d+)\s*gr*\)*/i.exec(name)
  let grams = 0
  if (maybeGrams == null) {
    return undefined
  } else {
    grams = parseInt(maybeGrams[1])
  }

  return {
    brand: brand,
    blend: blend,
    grams: grams
  }
}

function getPipeTobaccos(): string[] {
  const csv = fs.readFileSync(`${CSV_PATH}/pipa.csv`, 'utf-8')
  const tobaccos = csv.split("\n")
    .filter((value, index) => index != 0)
    .map(v => v.split(";")[0])
    .filter(t => shishaBrands.find(e => t.startsWith(e)) == undefined)
    .map(t => t.replace(/\(\d+\s*gr*\)/i, "").trim())
  return [...new Set(tobaccos)]
}

function getParsedPipeTobaccos(): TobaccoPrice[] {
  const csv = fs.readFileSync(`${CSV_PATH}/pipa.csv`, 'utf-8')
  const tobaccos: TobaccoPrice[] = csv.split("\n")
    .filter((value, index) => index != 0)
    .filter(t => shishaBrands.find(e => t.startsWith(e)) == undefined)
    .map(v => {
      const [name, price, _] = v.split(";")
      return {
        name: name,
        price: parseFloat(price)
      }
    })
  return [...new Set(tobaccos)]
}
