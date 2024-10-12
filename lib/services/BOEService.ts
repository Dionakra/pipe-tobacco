import BOEEntry from "../models/BOEEntry"

export default class BOEService {
    async getNewEntries(lastBOE: string, pageNumber: number = 0): Promise<BOEEntry[]> {
        const entries: BOEEntry[] = []
        let found: boolean = false

        while (!found) {
            const page: string = await this.fetchBOESearchPage(pageNumber++)
            const pageEntries: BOEEntry[] = this.extractEntries(page)

            if (pageEntries.length == 0) break

            for (const entry of pageEntries) {
                if (entry.id != lastBOE) {
                    entries.push(entry)
                } else {
                    found = true
                    break;
                }
            }
        }

        return entries
    }

    async getBoePageContent(id: string): Promise<string> {
        return this.fetchBoePage(`https://www.boe.es/buscar/doc.php?id=${id}`)
    }

    private extractEntries(html: string): BOEEntry[] {
        const regex = /<h3>Ministerio.*?(\d{2})\/(\d{2})\/(\d{4}).*?<li class="puntoHTML">.*?href=".*?id=(.*?)"/gms;
        const entries: BOEEntry[] = []

        let m;
        while ((m = regex.exec(html)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            entries.push({
                id: m[4],
                year: m[3],
                month: m[2],
                day: m[1]
            })
        }

        return entries
    }

    private async fetchBOESearchPage(page: number): Promise<string> {
        return this.fetchBoePage(`https://www.boe.es/buscar/legislacion_ava.php?accion=Mas&id_busqueda=dVJYcytEemZtMUlYeERVUWtJQ3ltSngwbGtZekFCWEtxbzVmbnJTbVRrQ0hYTFVKcmhDVHd0Ym5OUHdqSkJ3dGlVRkFoNWNHeHdYZmhPN2pCemJvYVlMckFjWE41MVRNRGkvV1A0VmRLREs4bk5QRDkxMnBxWU5aOFFUalVzNEhzc0hiOEtoUlZzelc5eTV5Z1Nma2trbXRHY1VRcE9MQTlMcFY4Q2tsRndKbmQ3UUtHMlJsUkdpMzAvU1QrQzZDa3oveG5zUmhKUSt4OWhzdDYzUWxqblV1a3NNajR2SGRUK0xjUU9FVWFYUGloQ2Y4QWwyd3E3VWpCb1Q1T0dpNUFad0wyckduQjFiZUloWmhYeTRiK2c9PQ,,-${page * 50}-50`)
    }

    private async fetchBoePage(url: string): Promise<string> {
        return fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        }).then(x => x.text())
    }
}
