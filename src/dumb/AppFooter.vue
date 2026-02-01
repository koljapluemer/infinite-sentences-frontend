<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguagePreferencesStore } from '@/entities/language-preferences/languagePreferencesStore'
import { getLanguageInfo, type LanguageInfo } from '@/entities/language'

const router = useRouter()
const store = useLanguagePreferencesStore()

const nativeLanguage = ref<LanguageInfo | null>(null)
const targetLanguage = ref<LanguageInfo | null>(null)

watchEffect(async () => {
  if (store.nativeIso) {
    nativeLanguage.value = await getLanguageInfo(store.nativeIso)
  } else {
    nativeLanguage.value = null
  }
})

watchEffect(async () => {
  if (store.targetIso) {
    targetLanguage.value = await getLanguageInfo(store.targetIso)
  } else {
    targetLanguage.value = null
  }
})

const showFooter = computed(() => store.hasLanguagesSet)

const changeNativeLanguage = () => {
  store.clearLanguages()
  router.push('/learn')
}

const changeTargetLanguage = () => {
  const nativeIso = store.nativeIso
  store.targetIso = null
  router.push(`/learn/${nativeIso}`)
}
</script>

<template>
  <footer
    v-if="showFooter"
    class="text-center py-2 text-light text-sm mt-10"
  >
    <button
      class="hover:underline"
      :title="`Change native language (${nativeLanguage?.displayName})`"
      @click="changeNativeLanguage"
    >
      {{ nativeLanguage?.symbol || store.nativeIso }}
    </button>
    <span class="mx-1">&rarr;</span>
    <button
      class="hover:underline"
      :title="`Change target language (${targetLanguage?.displayName})`"
      @click="changeTargetLanguage"
    >
      {{ targetLanguage?.symbol || store.targetIso }}
    </button>
  </footer>
</template>
