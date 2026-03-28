export type UsageExample = [string, string]

export type SentencePart = {
  content: string
  translations: string[]
  usageExamples?: UsageExample[]
  transcription?: string
}

export type SentenceData = {
  sentence: string
  credits?: string[]
  translations: string[]
  parts: SentencePart[]
  transcription?: string
}
