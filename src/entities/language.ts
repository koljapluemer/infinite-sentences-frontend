export type LanguageInfo = {
  iso: string
  displayName: string
  symbol: string
}

let languageDataCache: Record<string, { displayName: string, symbols: string[] }> | null = null
let languageDataFailed = false

export async function getLanguageInfo(iso: string): Promise<LanguageInfo> {
  if (!languageDataCache && !languageDataFailed) {
    try {
      const response = await fetch('/glosses4learning-language-reference/glosses4learning-language-reference/languages.json')
      if (!response.ok) {
        throw new Error(`Failed to load language metadata: ${response.status}`)
      }
      languageDataCache = await response.json()
    } catch (error) {
      console.warn('Language metadata not available yet:', error)
      languageDataCache = {}
      languageDataFailed = true
    }
  }

  const data = languageDataCache?.[iso]
  return {
    iso,
    displayName: data?.displayName || iso,
    symbol: data?.symbols?.[0] || ''
  }
}

export async function getLanguageDisplayName(iso: string): Promise<string> {
  const info = await getLanguageInfo(iso)
  return info.displayName
}
