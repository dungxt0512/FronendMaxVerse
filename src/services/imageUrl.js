const BACKEND_ORIGIN = 'http://localhost:5067'

export function resolveImageUrl(path, placeholder = 'https://placehold.co/400x400/161B26/6B7280?text=MaxVerse') {
  if (!path) return placeholder
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${BACKEND_ORIGIN}${path}`
}