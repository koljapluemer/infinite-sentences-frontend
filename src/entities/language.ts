export type LanguageInfo = {
  iso: string
  displayName: string
  symbol: string
  symbols: string[]
}

type LanguageDataMap = Record<string, { displayName: string, symbols: string[] }>

export async function getLanguageInfo(iso: string): Promise<LanguageInfo> {
  let languageData: LanguageDataMap = {}

  try {
    const response = await fetch('/infinite-sentences-data/out/languages.json')
    if (!response.ok) {
      throw new Error(`Failed to load language metadata: ${response.status}`)
    }
    languageData = await response.json() as LanguageDataMap
  } catch (error) {
    console.warn('Language metadata not available:', error)
  }

  const data = languageData[iso]
  const symbols = data?.symbols || []
  return {
    iso,
    displayName: data?.displayName || iso,
    symbol: symbols[0] || '',
    symbols
  }
}

export async function getLanguageDisplayName(iso: string): Promise<string> {
  const info = await getLanguageInfo(iso)
  return info.displayName
}
