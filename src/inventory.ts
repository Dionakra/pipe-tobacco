import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Tobacco } from '../lib/models/Tobacco'
import { tobaccoId } from './tobacco-id'

export { tobaccoId }

// Tobacco property fields stored alongside brand/blend/grams for tobaccos
// that don't exist in the Spanish catalog (so their properties persist and
// render without depending on tr.json being loaded at display time).
const TOBACCO_PROPERTIES = [
  'blend_type',
  'contents',
  'flavoring',
  'cut',
  'country',
  'strength',
  'flavoring_profile',
  'room_note',
  'taste',
] as const

export interface InventoryEntry {
  brand: string
  blend: string
  grams: number
  favourite?: boolean
  blend_type?: string | null
  contents?: string[] | null
  flavoring?: string[] | null
  cut?: string | null
  country?: string | null
  strength?: string | null
  flavoring_profile?: string | null
  room_note?: string | null
  taste?: string | null
}

export function inventoryPath(uid: string): string {
  return `users/${uid}/inventory`
}

// Load all inventory entries for a user (one-time)
export async function loadInventory(uid: string): Promise<Record<string, InventoryEntry>> {
  const snap = await getDocs(collection(db, inventoryPath(uid)))
  const result: Record<string, InventoryEntry> = {}
  snap.forEach(d => {
    result[d.id] = d.data() as InventoryEntry
  })
  return result
}

// Subscribe to inventory changes in real-time
export function subscribeInventory(
  uid: string,
  callback: (entries: Record<string, InventoryEntry>) => void
): () => void {
  return onSnapshot(collection(db, inventoryPath(uid)), (snap) => {
    const result: Record<string, InventoryEntry> = {}
    snap.forEach(d => {
      result[d.id] = d.data() as InventoryEntry
    })
    callback(result)
  })
}

// Set grams for a tobacco (0 or less deletes the entry)
export async function setGrams(tobacco: Tobacco, grams: number): Promise<void> {
  await setGramsByBrandBlend(tobacco.brand, tobacco.blend, grams)
}

// Set grams for a tobacco given by brand + blend (for tobaccos that may not
// exist in the Spanish catalog). 0 or less deletes the entry.
// `properties` (optional) stores the tobacco's descriptive properties so they
// render in Stock Mode without re-looking up tr.json. Only meaningful for
// tobaccos not present in the active region's catalog.
export async function setGramsByBrandBlend(
  brand: string,
  blend: string,
  grams: number,
  properties?: Partial<Pick<Tobacco, typeof TOBACCO_PROPERTIES[number]>>
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const id = tobaccoId(brand, blend)
  const ref = doc(db, inventoryPath(user.uid), id)
  if (grams <= 0) {
    await deleteDoc(ref)
    return
  }
  const data: Record<string, unknown> = {
    brand,
    blend: blend || '',
    grams,
    updatedAt: Date.now(),
  }
  if (properties) {
    for (const prop of TOBACCO_PROPERTIES) {
      data[prop] = (properties as Record<string, unknown>)[prop] ?? null
    }
  }
  await setDoc(ref, data)
}

// Toggle favourite status for a tobacco. Uses merge so it doesn't overwrite
// existing grams/properties. Creates the entry if it doesn't exist yet
// (grams defaults to 0), so users can favourite tobaccos they don't own yet.
export async function toggleFavourite(
  brand: string,
  blend: string,
  favourite: boolean
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const id = tobaccoId(brand, blend)
  const ref = doc(db, inventoryPath(user.uid), id)
  await setDoc(ref, {
    brand,
    blend: blend || '',
    grams: 0,
    favourite,
    updatedAt: Date.now(),
  }, { merge: true })
}
