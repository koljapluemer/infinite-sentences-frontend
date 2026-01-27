<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguagePreferencesStore } from '@/entities/language-preferences/languagePreferencesStore'
import { getLanguageInfo, type LanguageInfo } from '@/entities/language'

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
</script>

<template>
  <footer
    v-if="showFooter"
    class="text-center py-2 text-light text-sm"
  >
    <RouterLink
      to="/learn"
      class="hover:underline"
      :title="`Change native language (${nativeLanguage?.displayName})`"
    >
      {{ nativeLanguage?.symbol || store.nativeIso }}
    </RouterLink>
    <span class="mx-1">&rarr;</span>
    <RouterLink
      :to="`/learn/${store.nativeIso}`"
      class="hover:underline"
      :title="`Change target language (${targetLanguage?.displayName})`"
    >
      {{ targetLanguage?.symbol || store.targetIso }}
    </RouterLink>
  </footer>
</template>
