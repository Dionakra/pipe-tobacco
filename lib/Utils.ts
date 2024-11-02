import { TobaccoBlendSize } from "./models/Tobacco"

const shishaBrands: string[] = ["187", "Adalya", "Afendi", "Al-Waha", "Al Fakher", "Al Andalus", "Al Rayan", "Al Sultan Molasses", "Al Waha", "Al-Katar", "Almassiva", "Aloha", "Alrayan", "Alwazir", "AQM",
    "Arábica Molasses", "Revoshi", "Social Smoke", "Ziggy", "Azure", "Anda", "Apocalypse", "Arabica Molasses", "Blackburn", "Blaze", "Blue Horse", "Zomo", "Zain", "Wazir", "Vipo Hookah Tobacco", "True Passion",
    "Trifecta", "Torres", "Titanium", "Tipsy", "Tarifa", "Tangiers", "Taboo", "Tabaco para pipa de agua Savacco", "Surfari", "Street Smoke", "Starline", "Starbuzz", "Springwater", "Shisha", "Serbetli", "Sebero",
    "SB Starbuzz", "Savacco", "Privilege", "Prestige", "Overdozz", "Os", "Neo", "Nash", "Nativo", "Natur", "Nameless", "Nakhla", "Musth", "Mr. Shisha", "Moe's", "Mazaya", "Marif", "Mammut", "Mala Vida", "Le Baron",
    "Layalina", "Kooliche", "Kismet", "Khaleej", "Kalout", "Kalam", "John Brooks", "Indian Summer", "Ibiza Essence", "Hookain", "Holster", "Haze", "Hater", "Fumari", "Forever", "Flame", "Eternal", "Ernest", "Erasmus",
    "Element", "Dumanji", "Duft", "Dschinni", "Drugoy", "Dozaj", "Delta", "Del Mar", "Darkside", "Dark Smoke", "Cornell & Diehl", "Cleopatra Molasses", "Chronos", "Chaos", "Chillma", "Capital", "Cannibal", "Candelas",
    "Camino", "Camel Vapeleaf Bolsa", "Sindbad Mint Water Pipe Tobacco", "Capìtal Bra Lecker Lecker", "Mayflower", "Tabacco Way - D'Ora", "Kaja"]
const pipeBrands: string[] = ["W.O. Larsen", "Wessex", "Van Dijck", "Trucco", "Troost", "Trébol", "Touareg", "Tilbury", "Texas Republic", "Thomas Radford", "Sweet Dublin", "Sting", "Stanwell", "Stanley", "Stanislaw",
    "St. Bruno", "Special Star", "Solani", "Smokers Freedom", "Smokers Choice", "Skull", "Skandinavik", "Sioux Original", "Sillem's", "Selesta", "Scottish Corner", "Scaferlati", "Savinelli", "Samuel Gawith", "Sailor´s Pride",
    "Sahara", "Sacramento", "Robert Lewis", "Retro", "Redfield", "Red Wolf", "Rattray's", "Planta", "El Abuelo", "Peterson", "Peter Clark", "Olsen", "Oboe", "Nording", "Moon Habana", "Missisipi", "Mcconnell", "Master Cut",
    "Mark Adams", "Macbaren", "Mac Lintock", "Mac Baren", "Look Out", "Lince", "La Tribu", "La Pinta", "La Oveja Negra", "Kiowa", "Kingston", "Keops", "Kentucky Bird", "Jockey", "Holger Danske", "Hampton", "Half & Half",
    "Golden Blend's", "Gladora Pesse Canoe", "G.L. Pease", "G. Hoggarth", "Fribourg & Treyer", "Frérot", "Exclusiv Mixture", "Erinmore", "Elixyr", "El Puerto", "El Burladero", "El Bruc", "Eastwood", "Dunhill", "Duende",
    "DJ Pipe Tobacco", "Davidoff", "Danske Club", "Danish Blend", "Dan Tobacco", "Cuzco", "Condor", "Comoys", "Colts", "Colonial Dan Tobacco", "Clan", "Chacom", "Cellini", "Capstan", "Calumé Pipa", "Bullbrand", "Brujito",
    "Brookfield", "Brigg", "Bravo", "Borkum Riff", "Black V.", "Black Jack", "Big Chief", "Big Ben", "Bentley", "Bellini", "Bayside", "Barsdorf's Bester", "Bakerstreet", "Backwoods", "Astleys", "Ashton",
    "Apache", "Amsterdamer", "Amphora", "American Street", "Alsbo", "Alpha", "Alonso", "Absolutely Special", "Eastenders", "Tabacco Way"]

const brandMaps: Map<string | RegExp, string> = new Map<string | RegExp, string>([
    ["&amp;", "&"],
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
    ["A.S. Absolutely Special", "Absolutely Special"],
    ["’", "'"],
    ["Tilbury N.º 1", "Tilbury Nº 1"],
    ["N.º", "Nº"],
    ["n.º", "Nº"],
    ["Life's a Gamble", ""],
    ["Life is a Gamble", ""],
    ["Life's a gamble", ""],
    ["W.O .Larsen", "W.O. Larsen"],
    ["Samuel Gawith Best Brown", "G. Hoggarth Best Brown"],
    [/^The London Carmine/g, "Bentley The London Carmine"],
    [/^The Classic One/g, "Bentley The Classic One"],
    [/^The Oriental Amber/g, "Bentley The Oriental Amber"],
    [/^The Planters Purpure/g, "Bentley The Planters Purpure"],
    [/^The Royal Gold/g, "Bentley The Royal Gold"],
    [/^The Virginia Ruby/g, "Bentley The Virginia Ruby"],
    [/CM$/g, ""],
    ["Peterson Surtido (5)", "Peterson Surtido"],
    [/ - Bolsa\.$/g, ""],
    [/ - Petaca\.$/g, ""],
    [/ - Lata\.$/g, ""]
])

export function parseTobacco(name: string, exhaustive: boolean = false): TobaccoBlendSize | undefined {
    name = name.replaceAll(/\s+/gms, " ")
    for (const toBeReplaced of brandMaps.keys()) {
        name = name.replaceAll(toBeReplaced, brandMaps.get(toBeReplaced) || "")
    }

    let brand = pipeBrands.find(b => name.startsWith(b))
    if (!brand) {
        brand = shishaBrands.find(b => name.startsWith(b))
        if (!brand && exhaustive) {
            console.error(`Brand not recognized. Please check: ${name}`)
            process.exit(-1)
        }
        return undefined
    }

    const blend = name.replace(brand, "").replace(/\(\d+.*?gr*\)*/i, "").trim()
    let maybeGrams = /\((\d+).*?gr*\)*/i.exec(name)
    let grams = 50 // By default
    if (maybeGrams == null) {
        if (!exhaustive) {
            return undefined
        }
    } else {
        grams = parseInt(maybeGrams[1])
    }

    return {
        brand: brand,
        blend: blend,
        grams: grams
    }
}