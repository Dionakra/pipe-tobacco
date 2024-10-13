import fs from "fs"
import BOEEntry from "./models/BOEEntry"
import BOEDocumentExtractor from "./services/BOEDocumentExtractor"
import { Tobacco, TobaccoPrice } from "./models/Tobacco"
import { parseTobacco } from "./Utils"

const BASE_PATH = __dirname + "/../public"
const BOE_PATH = BASE_PATH + "/boe.json"
const HTML_PATH = BASE_PATH + "/html/"
const CSV_PATH = BASE_PATH + "/csv"

extract('pb')
extract('cm')

async function extract(region: 'pb' | 'cm') {
  const DB_PATH = `${BASE_PATH}/${region}.json`

  // Load BOE history
  let boes: BOEEntry[] = JSON.parse(fs.readFileSync(BOE_PATH, 'utf-8'))
  boes = boes.sort((a, b) => parseInt(`${b.year}${b.month}${b.day}`) - parseInt(`${a.year}${a.month}${a.day}`))

  // Load pipe tobaccos from snapshot
  const tobaccos: TobaccoPrice[] = getPipeTobaccos(region)
  const extractor: BOEDocumentExtractor = new BOEDocumentExtractor()

  let database: Tobacco[] = []

  // Loop through all boes
  for (const boe of boes) {
    // For Parse the BOE's HTML and get the tobaccos
    console.info(`Parsing BOE ${boe.id}`)
    const html = fs.readFileSync(`${HTML_PATH}/${boe.id}.html`, 'utf-8')
    let regionTobaccos: TobaccoPrice[] = extractor.getTobaccos(html, region)

    // Get only Tobacco Pipes, not Shisha Pipes
    regionTobaccos = regionTobaccos
      .filter(t => tobaccos.find(p => t.brand == p.brand && t.blend == p.blend && t.grams == p.grams) != undefined)

    // Update each database based on the new information
    database = updateTobaccos(database, regionTobaccos, boe)
  }

  console.info('Obteniendo tabacos que no han cambiado de precio pero aparecen en la lista de tabacos')
  database = fillMissingFromDB(tobaccos, database)

  console.log(`Guardando datos...`)
  fs.writeFileSync(DB_PATH, JSON.stringify(database))
}

function fillMissingFromDB(all: TobaccoPrice[], db: Tobacco[]): Tobacco[] {
  console.log()
  const missing = all.filter(ppt => {
    return db.find(p => p.brand == ppt.brand && p.blend == ppt.blend) == undefined
  })
  return updateTobaccos(db, missing)
}

function updateTobaccos(tobaccos: Tobacco[], tobaccoPrices: TobaccoPrice[], boe?: BOEEntry): Tobacco[] {
  const date = boe ? `${boe.day}/${boe.month}/${boe.year}` : '00/00/0000'
  tobaccoPrices.forEach(tp => {
    let tobaccoIndex = tobaccos.findIndex(t => t.brand == tp.brand && t.blend == tp.blend)
    if (tobaccoIndex == -1) {
      console.info(`  Adding new tobacco: ${tp.brand} ${tp.blend} ${tp.grams}`)
      const tobacco = {
        brand: tp.brand,
        blend: tp.blend,
        sizes: [{
          grams: tp.grams,
          currentPrice: tp.price,
          lastUpdate: date,
          priceHistory: [{ date: date, price: tp.price }]
        }]
      }
      tobaccos.push(tobacco)
    } else {
      const sizeIndex = tobaccos[tobaccoIndex].sizes.findIndex(s => s.grams == tp.grams)
      if (sizeIndex == -1) {
        console.info(`  Adding new size: ${tp.brand} ${tp.blend} ${tp.grams}`)
        tobaccos[tobaccoIndex].sizes.push({
          grams: tp.grams,
          currentPrice: tp.price,
          lastUpdate: date,
          priceHistory: [{ date: date, price: tp.price }]
        })
      } else {
        console.info(`  Updating Tobacco Price: ${tp.brand} ${tp.blend} ${tp.grams}`)
        tobaccos[tobaccoIndex].sizes[sizeIndex].priceHistory.push({ date: date, price: tp.price })
      }
    }
  })

  return tobaccos
}

function getPipeTobaccos(region: string): TobaccoPrice[] {
  const csv = fs.readFileSync(`${CSV_PATH}/${region}.csv`, 'utf-8')
  const tobaccos: TobaccoPrice[] = csv.split("\n")
    .filter((value, index) => index != 0)
    .filter(value => value.trim() != "")
    .flatMap(v => {
      const [name, price, _] = v.split(";")
      const tobacco = parseTobacco(name, true)
      if (tobacco == undefined) {
        // This means it is a Shisha tobacco, don't worry
        return []
      }

      return [{
        brand: tobacco.brand,
        blend: tobacco.blend,
        grams: tobacco.grams,
        price: parseFloat(price.replace(",", "."))
      }]
    })
  return [...new Set(tobaccos)]
}
