// Pure utility — no Firebase imports, safe to bundle with main app
export function tobaccoId(brand: string, blend: string): string {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '_').replace(/[\/#\.]/g, '-')
  return `${norm(brand)}__${norm(blend || '')}`
}
