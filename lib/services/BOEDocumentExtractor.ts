import { TobaccoPrice } from "../models/Tobacco";
import { parseTobacco } from "../Utils";

export default class BOEDocumentExtractor {
    getTobaccos(html: string, region: 'pb' | 'cm'): TobaccoPrice[] {
        const regionHtml = this.extractRegionHTML(html, region == 'cm')
        if (regionHtml == undefined) {
            return []
        }
        return this.extractTobaccos(regionHtml)
    }

    private extractRegionHTML(html: string, ceuta: boolean): string | undefined {
        const peninsula = /parrafo.*?Península e Illes Balears,* serán los siguientes(.*?)parrafo/igms
        const ceutaMelilla = /parrafo.*?Ceuta(.*?)parrafo/igms

        const regex = ceuta ? ceutaMelilla : peninsula

        const result = regex.exec(html)
        if (result != null) {
            return result[1]
        } else {
            return undefined
        }
    }

    private extractTobaccos(html: string): TobaccoPrice[] {
        const regexes = [
            /<td class="cuerpo_tabla_izq">([^<]*)<[^<]*<td class="cuerpo_tabla_(?:coma|centro|der)">([^<]*)</gms,
            /<td>([^<]*)<[^<]*<td class="cuerpo_tabla_(?:coma|centro|der)">([^<]*)</gms,
            /<p class="cuerpo_tabla_izq">([^<]*)<.*?<p class="cuerpo_tabla_(?:coma|centro|der|izq)">([^<]*)</gms
        ];
        const tobaccos: TobaccoPrice[] = []

        for (const regex of regexes) {
            let m;
            while ((m = regex.exec(html)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                const tobacco = parseTobacco(m[1].replace(/.$/, ""))
                if (tobacco != undefined) {
                    tobaccos.push({
                        brand: tobacco.brand,
                        blend: tobacco.blend,
                        grams: tobacco.grams,
                        price: parseFloat(m[2].replace(",", "."))
                    })
                }
            }
            if (tobaccos.length > 0) break
        }
        return tobaccos
    }
}
