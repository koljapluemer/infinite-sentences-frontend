import { defineStore } from 'pinia'
import { format, parse } from 'date-fns'

type TimestampMap = Record<string, string>
type DailyCountMap = Record<string, number>

const formatTimestamp = (date: Date): string => format(date, "yy-MM-dd'T'HH:mm")
const formatDay = (date: Date): string => format(date, 'yyyy-MM-dd')

const parseDateString = (dateString: string): Date | null => {
  try {
    return parse(dateString, "yy-MM-dd'T'HH:mm", new Date())
  } catch {
    return null
  }
}

const parseStreakRecord = (value: string): { streak: number, datetime: string } | null => {
  const parts = value.split(':')
  if (parts.length < 2) return null
  const streakStr = parts[0]
  if (!streakStr) return null
  const streak = parseInt(streakStr, 10)
  const datetime = parts.slice(1).join(':')
  if (isNaN(streak)) return null
  return { streak, datetime }
}

export const usePracticeStore = defineStore('practice-tracking', {
  state: () => ({
    seenGlosses: {} as TimestampMap,
    glossStreaks: {} as Record<string, string>, // "streak:datetime"
    learnedSentences: {} as TimestampMap,
    dailySentenceCounts: {} as DailyCountMap,
    dailySentenceCountsByLanguage: {} as DailyCountMap // key: "yyyy-MM-dd:languageIso"
  }),

  actions: {
    markGlossSeen(glossKey: string) {
      this.seenGlosses[glossKey] = formatTimestamp(new Date())
    },

    hasBeenSeen(glossKey: string): boolean {
      return !!this.seenGlosses[glossKey]
    },

    updateGlossStreak(glossRef: string, rememberedCorrectly: boolean) {
      const now = new Date()
      const nowString = formatTimestamp(now)

      const existing = this.glossStreaks[glossRef]

      if (!existing) {
        // First time practicing this gloss
        this.glossStreaks[glossRef] = rememberedCorrectly
          ? `1:${nowString}`
          : `-1:${nowString}`
      } else {
        const parsed = parseStreakRecord(existing)
        if (!parsed) {
          // Invalid format, reset
          this.glossStreaks[glossRef] = rememberedCorrectly
            ? `1:${nowString}`
            : `-1:${nowString}`
        } else {
          const currentStreak = parsed.streak

          if (rememberedCorrectly) {
            // Correct answer: increment positive streak or reset from negative
            const newStreak = currentStreak > 0 ? currentStreak + 1 : 1
            this.glossStreaks[glossRef] = `${newStreak}:${nowString}`
          } else {
            // Incorrect answer: decrement negative streak or reset from positive
            const newStreak = currentStreak < 0 ? currentStreak - 1 : -1
            this.glossStreaks[glossRef] = `${newStreak}:${nowString}`
          }
        }
      }
    },

    getGlossStreak(glossRef: string): { streak: number, datetime: Date } | null {
      const value = this.glossStreaks[glossRef]
      if (!value) return null
      const parsed = parseStreakRecord(value)
      if (!parsed) return null
      const date = parseDateString(parsed.datetime)
      if (!date) return null
      return { streak: parsed.streak, datetime: date }
    },

    hasBeenPracticed(glossRef: string): boolean {
      return this.hasBeenSeen(glossRef)
    },

    markSentenceLearned(sentenceKey: string) {
      this.learnedSentences[sentenceKey] = formatTimestamp(new Date())
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

      // Start from today and go backwards through all recorded history
      for (let i = 0; i < 365 * 10; i++) { // Check up to 10 years back
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateStr = formatDay(date)
        const practiced = (this.dailySentenceCounts[dateStr] || 0) > 0

        if (practiced) {
          currentStreak++
          missedOne = false
        } else {
          if (missedOne) {
            // Already missed one day, this breaks the streak
            break
          } else {
            // First miss, allow it but don't count it
            missedOne = true
          }
        }
      }

      return currentStreak
    }
  },

  persist: true
})
