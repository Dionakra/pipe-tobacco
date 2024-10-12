import fs from "fs"
import BOEService from "./services/BOEService"
import BOEEntry from "./models/BOEEntry"


const BOES_PATH = __dirname + "/../public/boe.json"
const HTML_PATH = __dirname + "/../public/html/"

main()

async function main() {
  const db: BOEEntry[] = JSON.parse(fs.readFileSync(BOES_PATH, 'utf-8'))
  db.sort((a, b) => parseInt(`${b.year}${b.month}${b.day}`) - parseInt(`${a.year}${a.month}${a.day}`))
  const lastBoeId: string = db[0]?.id || ""
  console.info(`Ultimo BOE obtenido: ${lastBoeId}`)

  const boeService: BOEService = new BOEService()
  const boes = await boeService.getNewEntries(lastBoeId)

  for (const boe of boes) {
    console.info(`Nueva entrada del BOE obtenida: ${boe.id}`)
    const html: string = await boeService.getBoePageContent(boe.id);
    fs.writeFileSync(`${HTML_PATH}/${boe.id}.html`, html)
  }

  db.push(...boes)
  fs.writeFileSync(BOES_PATH, JSON.stringify(db))
}
