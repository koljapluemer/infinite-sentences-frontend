<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserSettingsStore } from '@/entities/user-settings/userSettingsStore'
import { useLanguagePreferencesStore } from '@/entities/language-preferences/languagePreferencesStore'
import { getLanguageInfo } from '@/entities/language'

const router = useRouter()
const userSettingsStore = useUserSettingsStore()
const languageStore = useLanguagePreferencesStore()

const dailyGoal = ref(userSettingsStore.dailySentenceGoal)
const nativeDisplayName = ref('')
const targetDisplayName = ref('')

watch(dailyGoal, (value) => {
  userSettingsStore.setDailySentenceGoal(value)
})

onMounted(async () => {
  if (languageStore.nativeIso) {
    const info = await getLanguageInfo(languageStore.nativeIso)
    nativeDisplayName.value = info.displayName
  }
  if (languageStore.targetIso) {
    const info = await getLanguageInfo(languageStore.targetIso)
    targetDisplayName.value = info.displayName
  }
})

const changeNativeLanguage = () => {
  languageStore.clearLanguages()
  router.push('/learn')
}

const changeTargetLanguage = () => {
  const nativeIso = languageStore.nativeIso
  languageStore.targetIso = null
  router.push(`/learn/${nativeIso}`)
}
</script>

<template>
  <div class="w-full max-w-md">
    <h1 class="text-3xl font-bold mb-6">
      Settings
    </h1>

    <fieldset class="fieldset">
      <label
        for="daily-goal"
        class="label"
      >
        Daily sentence goal
      </label>
      <input
        id="daily-goal"
        v-model.number="dailyGoal"
        type="number"
        name="daily-goal"
        class="input"
        min="1"
        placeholder="10"
      >
    </fieldset>

    <div
      v-if="languageStore.hasLanguagesSet"
      class="mt-6"
    >
      <h2 class="text-xl font-semibold mb-3">
        Languages
      </h2>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-base-content/70">Native language</span>
          <button
            class="link"
            @click="changeNativeLanguage"
          >
            {{ nativeDisplayName || languageStore.nativeIso }}
          </button>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-base-content/70">Target language</span>
          <button
            class="link"
            @click="changeTargetLanguage"
          >
            {{ targetDisplayName || languageStore.targetIso }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
