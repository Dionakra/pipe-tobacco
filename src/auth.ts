import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, appleProvider } from './firebase'
import type { User } from 'firebase/auth'

export type AuthUser = User

async function signIn(provider: any): Promise<void> {
  try {
    await signInWithPopup(auth, provider)
  } catch (err: any) {
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/popup-closed-by-user'
    ) {
      await signInWithRedirect(auth, provider)
    } else {
      throw err
    }
  }
}

export async function signInWithGoogle() {
  await signIn(googleProvider)
}

export async function signInWithApple() {
  await signIn(appleProvider)
}

export async function signOutUser() {
  await signOut(auth)
}

export async function handleRedirectResult() {
  const result = await getRedirectResult(auth)
  return result?.user ?? null
}

export function onAuthChange(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}
