export const buildSentenceKey = (nativeIso: string, targetIso: string, index: number): string =>
  `${nativeIso}:${targetIso}:${index}`

export const buildPartKey = (targetIso: string, content: string): string =>
  `${targetIso}::${content}`
