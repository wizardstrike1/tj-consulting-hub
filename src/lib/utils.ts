import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Prefix a /public asset path with the deployment base path (e.g.
// "/tj-consulting-hub" on GitHub Pages). next/image does NOT apply basePath to
// hardcoded paths, so we do it ourselves. Empty locally, so paths stay at root.
export function assetPath(path: string) {
  const prefix = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return `${prefix}${path}`
}
