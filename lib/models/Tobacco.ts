export interface Tobacco {
    brand: string
    blend: string
    sizes: {
        grams: number
        currentPrice: number
        lastUpdate: string
        priceHistory: PriceHistory[]
    }[]
    blend_type: string | null
    contents: string[] | null
    flavoring: string[] | null
    cut: string | null
    country: string | null
    strength: string | null
    flavoring_profile: string | null
    room_note: string | null
    taste: string | null
}

export interface PriceHistory {
    date: string
    price: number
}

export interface TobaccoBlendSize {
    brand: string
    blend: string
    grams: number
}

export interface TobaccoPrice {
    brand: string
    blend: string
    grams: number
    price: number
}