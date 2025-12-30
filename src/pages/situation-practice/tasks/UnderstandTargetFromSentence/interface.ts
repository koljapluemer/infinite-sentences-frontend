import type { TaskExample, TaskText } from '../taskDisplayTypes'

export type UnderstandTargetFromSentenceTask = {
  gloss: TaskText
  translations: TaskText[]
  examples: TaskExample[]
}
