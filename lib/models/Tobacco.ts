export interface Tobacco {
    brand: string
    blend: string
    sizes: {
        grams: number
        currentPrice: number
        lastUpdate: string
        priceHistory: PriceHistory[]
    }[]
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