import { TobaccoPrice } from "../models/Tobacco";

export default class BOEDocumentExtractor {
    getTobaccos(html: string, ceuta: boolean): TobaccoPrice[] {
        const regionHtml = this.extractRegionHTML(html, ceuta)
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
            /<p class="cuerpo_tabla_izq">([^<]*)<.*?<p class="cuerpo_tabla_(?:coma|centro|der)">([^<]*)</gms
        ];
        const tobaccos: TobaccoPrice[] = []

        for (const regex of regexes) {
            let m;
            while ((m = regex.exec(html)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                tobaccos.push({
                    name: m[1].replace(/.$/gm, "").trim(),
                    price: parseFloat(m[2].replace(",", ".")),
                })
            }
            if (tobaccos.length > 0) break
        }
        return tobaccos
    }
}
