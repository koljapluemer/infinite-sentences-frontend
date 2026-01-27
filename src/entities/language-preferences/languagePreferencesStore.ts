import { defineStore } from 'pinia'

export const useLanguagePreferencesStore = defineStore('language-preferences', {
  state: () => ({
    nativeIso: null as string | null,
    targetIso: null as string | null
  }),

  getters: {
    hasLanguagesSet: (state) => !!state.nativeIso && !!state.targetIso
  },

  actions: {
    setLanguages(native: string, target: string) {
      this.nativeIso = native
      this.targetIso = target
    },
    clearLanguages() {
      this.nativeIso = null
      this.targetIso = null
    }
  },

  persist: true
})
