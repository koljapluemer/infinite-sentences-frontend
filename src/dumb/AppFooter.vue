<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{ feedback: [] }>()
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
    class="text-center py-2 text-light mt-10 flex flex-col gap-2"
  >
    <div class="flex items-center justify-center gap-4">
      <div>
        <button
          class="link"
          :title="`Change native language (${nativeLanguage?.displayName})`"
          @click="changeNativeLanguage"
        >
          {{ nativeLanguage?.symbol || nativeLanguage?.displayName || store.nativeIso }}
        </button>
        <span class="mx-1">&rarr;</span>
        <button
          class="link"
          :title="`Change target language (${targetLanguage?.displayName})`"
          @click="changeTargetLanguage"
        >
          {{ targetLanguage?.symbol || targetLanguage?.displayName || store.targetIso }}
        </button>
      </div>
      <button
        class="link"
        @click="emit('feedback')"
      >
        Give feedback
      </button>
    </div>
    <hr>
    <div class="text-sm">
      <p>
        Made by
        <a
          class="link"
          href="https://koljasam.com/"
          target="_blank"
        >Kolja Sam</a>.
      </p>

      <p>
        All data stays on your device. <a
          href="https://github.com/koljapluemer/infinite-sentences-frontend"
          class="link"
        >Open Source</a>, no ads, no sign-up, no BS. I track page views with the privacy-friendly <a
          href="https://www.goatcounter.com/"
          class="underline"
          target="_blank"
        >goatcounter</a>, and nothing else.
      </p>

      <p>
        If you want to enable me to build more tool like this in the future, you can <a
          href="https://ko-fi.com/S6S81CWUVD"
          target="_blank"
          rel="noopener"
          class="underline"
        >
          support me on ko-fi
        </a>.
      </p>
    </div>
  </footer>
</template>
