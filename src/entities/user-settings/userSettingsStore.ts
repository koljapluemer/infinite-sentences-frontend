import { defineStore } from 'pinia'

export const useUserSettingsStore = defineStore('user-settings', {
  state: () => ({
    dailySentenceGoal: 10
  }),

  actions: {
    setDailySentenceGoal(goal: number) {
      this.dailySentenceGoal = Math.max(1, Math.floor(goal))
    }
  },

  persist: true
})
