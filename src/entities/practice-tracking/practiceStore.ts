import { defineStore } from 'pinia'
import { format, parse } from 'date-fns'
import { createEmptyCard, fsrs } from 'ts-fsrs'
import type { Card, Grade } from 'ts-fsrs'

type DailyCountMap = Record<string, number>
const formatDay = (date: Date): string => format(date, 'yyyy-MM-dd')

// Serialized form of an FSRS Card (dates as ISO strings)
type SerializedCard = Omit<Card, 'due' | 'last_review'> & {
  due: string
  last_review?: string
}

const serializeCard = (card: Card): SerializedCard => ({
  ...card,
  due: card.due.toISOString(),
  last_review: card.last_review?.toISOString()
})

const deserializeCard = (s: SerializedCard): Card => ({
  ...s,
  due: new Date(s.due),
  last_review: s.last_review ? new Date(s.last_review) : undefined
})

const scheduler = fsrs()

export const usePracticeStore = defineStore('practice-tracking', {
  state: () => ({
    glossCards: {} as Record<string, SerializedCard>,
    learnedSentences: {} as Record<string, string>,
    dailySentenceCounts: {} as DailyCountMap,
    dailySentenceCountsByLanguage: {} as DailyCountMap // key: "yyyy-MM-dd:languageIso"
  }),

  actions: {
    getGlossCard(glossKey: string): Card | null {
      const s = this.glossCards[glossKey]
      if (!s) return null
      return deserializeCard(s)
    },

    isGlossDue(glossKey: string, now: Date = new Date()): boolean {
      const card = this.getGlossCard(glossKey)
      if (!card) return false
      return card.due <= now
    },

    getGlossDueDate(glossKey: string): Date | null {
      const card = this.getGlossCard(glossKey)
      return card ? card.due : null
    },

    recordGlossReview(glossKey: string, rating: Grade) {
      const now = new Date()
      const existing = this.getGlossCard(glossKey)
      const card: Card = existing ?? createEmptyCard(now)
      const result = scheduler.next(card, now, rating)
      this.glossCards[glossKey] = serializeCard(result.card)
    },

    markSentenceLearned(sentenceKey: string) {
      this.learnedSentences[sentenceKey] = new Date().toISOString()
    },

    isSentenceLearned(sentenceKey: string): boolean {
      return !!this.learnedSentences[sentenceKey]
    },

    recordSentenceCompleted(targetIso?: string) {
      const today = formatDay(new Date())
      this.dailySentenceCounts[today] = (this.dailySentenceCounts[today] ?? 0) + 1

      if (targetIso) {
        const key = `${today}:${targetIso}`
        this.dailySentenceCountsByLanguage[key] = (this.dailySentenceCountsByLanguage[key] ?? 0) + 1
      }
    },

    getLast14DaysSentenceCounts(): Array<{ date: string; count: number }> {
      const today = new Date()
      const fourteenDaysAgo = new Date(today)
      fourteenDaysAgo.setDate(today.getDate() - 13)

      const result = []
      for (let i = 0; i < 14; i++) {
        const date = new Date(fourteenDaysAgo)
        date.setDate(fourteenDaysAgo.getDate() + i)
        const dateStr = formatDay(date)

        result.push({
          date: dateStr,
          count: this.dailySentenceCounts[dateStr] || 0
        })
      }

      return result
    },

    getLast14DaysSentenceCountsByLanguage(): Array<{ date: string; counts: Record<string, number> }> {
      const today = new Date()
      const fourteenDaysAgo = new Date(today)
      fourteenDaysAgo.setDate(today.getDate() - 13)

      const result = []
      for (let i = 0; i < 14; i++) {
        const date = new Date(fourteenDaysAgo)
        date.setDate(fourteenDaysAgo.getDate() + i)
        const dateStr = formatDay(date)

        const counts: Record<string, number> = {}
        for (const [key, count] of Object.entries(this.dailySentenceCountsByLanguage)) {
          const [keyDate, lang] = key.split(':')
          if (keyDate === dateStr && lang) {
            counts[lang] = count
          }
        }

        result.push({ date: dateStr, counts })
      }

      return result
    },

    getAllPracticedLanguages(): string[] {
      const languages = new Set<string>()
      for (const key of Object.keys(this.dailySentenceCountsByLanguage)) {
        const lang = key.split(':')[1]
        if (lang) languages.add(lang)
      }
      return Array.from(languages).sort()
    },

    wasActiveToday(): boolean {
      const today = formatDay(new Date())
      return (this.dailySentenceCounts[today] || 0) > 0
    },

    wasActiveOnDate(dateString: string): boolean {
      const date = parse(dateString, 'yyyy-MM-dd', new Date())
      if (!date || Number.isNaN(date.getTime())) return false
      const day = formatDay(date)
      return (this.dailySentenceCounts[day] || 0) > 0
    },

    getCurrentStreak(): number {
      const today = new Date()
      let currentStreak = 0
      let missedOne = false

      for (let i = 0; i < 365 * 10; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateStr = formatDay(date)
        const practiced = (this.dailySentenceCounts[dateStr] || 0) > 0

        if (practiced) {
          currentStreak++
          missedOne = false
        } else {
          if (missedOne) {
            break
          } else {
            missedOne = true
          }
        }
      }

      return currentStreak
    }
  },

  persist: true
})
