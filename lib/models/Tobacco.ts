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

export interface TobaccoPrice {
    name: string
    price: number
}

export interface TobaccoBlendPrice {
    brand: string
    blend: string
    grams: number
}