export type TaskText = {
  ref?: string
  content: string
  transcription?: string
}

export type TaskExample = {
  example: TaskText
  translation: TaskText
}
