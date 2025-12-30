import type { SentenceData } from './types'

export const loadSentenceIndexMax = async (basePath: string): Promise<number> => {
  const response = await fetch(`${basePath}/index.txt`)
  if (!response.ok) {
    throw new Error(`Failed to load index.txt from ${basePath}`)
  }

  const text = await response.text()
  const parsed = parseInt(text.trim(), 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid index.txt value at ${basePath}`)
  }

  return parsed
}

export const loadSentenceByIndex = async (
  basePath: string,
  index: number
): Promise<SentenceData> => {
  const response = await fetch(`${basePath}/${index}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load sentence ${index} from ${basePath}`)
  }

  return response.json() as Promise<SentenceData>
}
