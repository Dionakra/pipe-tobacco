import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Tobacco } from '../lib/models/Tobacco'
import { tobaccoId } from './tobacco-id'

export { tobaccoId }

export interface InventoryEntry {
  brand: string
  blend: string
  grams: number
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
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  const id = tobaccoId(tobacco.brand, tobacco.blend)
  const ref = doc(db, inventoryPath(user.uid), id)
  if (grams <= 0) {
    await deleteDoc(ref)
  } else {
    await setDoc(ref, {
      brand: tobacco.brand,
      blend: tobacco.blend || '',
      grams,
      updatedAt: Date.now(),
    })
  }
}
