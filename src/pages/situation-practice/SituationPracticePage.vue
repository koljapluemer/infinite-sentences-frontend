<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { pickRandom, takeRandom } from '@/dumb/random'
import { usePracticeStore } from '@/entities/practice-tracking/practiceStore'
import { loadSentenceByIndex, loadSentenceIndexMax } from '@/entities/sentences/repository'
import { buildPartKey, buildSentenceKey } from '@/entities/sentences/keys'
import type { SentenceData, SentencePart } from '@/entities/sentences/types'
import MemorizeFromTargetTask from './tasks/MemorizeFromTarget/Task.vue'
import RecallFromTargetTask from './tasks/RecallFromTarget/Task.vue'
import UnderstandTargetFromSentenceTask from './tasks/UnderstandTargetFromSentence/Task.vue'
import ChallengeTryToUnderstandTask from './tasks/ChallengeTryToUnderstand/Task.vue'
import type { MemorizeFromTargetTask as MemorizeTask } from './tasks/MemorizeFromTarget/interface'
import type { RecallFromTargetTask as RecallTask } from './tasks/RecallFromTarget/interface'
import type { UnderstandTargetFromSentenceTask as UnderstandTask } from './tasks/UnderstandTargetFromSentence/interface'
import type { ChallengeTryToUnderstandTask as ChallengeTask } from './tasks/ChallengeTryToUnderstand/interface'
import type { TaskText } from './tasks/taskDisplayTypes'

type PartState = 'VOCAB-TO-INTRODUCE' | 'VOCAB-TO-PRACTICE' | 'DONE'

type PartEntry = SentencePart & {
  key: string
}

type ActiveSentence = {
  index: number
  key: string
  data: SentenceData
  partKeys: string[]
  finalQueued: boolean
}

type ActiveTask =
  | { kind: 'memorize'; partKey: string; data: MemorizeTask }
  | { kind: 'understand'; partKey: string; data: UnderstandTask }
  | { kind: 'recall'; partKey: string; data: RecallTask }
  | { kind: 'challenge'; sentenceKey: string; data: ChallengeTask }

const route = useRoute()
const practiceStore = usePracticeStore()

const nativeIso = computed(() => String(route.params.nativeIso ?? ''))
const targetIso = computed(() => String(route.params.targetIso ?? ''))

const basePath = computed(() => `/infinite-sentences-data/${nativeIso.value}/${targetIso.value}`)

const maxIndex = ref<number | null>(null)
const activeSentences = ref<ActiveSentence[]>([])
const partByKey = ref<Record<string, PartEntry>>({})
const partState = ref<Map<string, PartState>>(new Map())
const finalQueue = ref<string[]>([])
const currentTask = ref<ActiveTask | null>(null)
const lastPartKey = ref<string | null>(null)
const lastIntroTask = ref<'memorize' | 'understand' | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const toTaskText = (content: string, ref?: string): TaskText => ({ content, ref })

const resetSession = () => {
  maxIndex.value = null
  activeSentences.value = []
  partByKey.value = {}
  partState.value = new Map()
  finalQueue.value = []
  currentTask.value = null
  lastPartKey.value = null
  lastIntroTask.value = null
  errorMessage.value = null
}

const ensurePartEntry = (part: SentencePart): PartEntry => {
  const key = buildPartKey(targetIso.value, part.content)
  if (!partByKey.value[key]) {
    partByKey.value[key] = { ...part, key }
  }
  if (!partState.value.has(key)) {
    const seen = practiceStore.hasBeenSeen(key)
    partState.value.set(key, seen ? 'VOCAB-TO-PRACTICE' : 'VOCAB-TO-INTRODUCE')
  }
  return partByKey.value[key]
}

const addSentenceData = (index: number, data: SentenceData) => {
  const key = buildSentenceKey(nativeIso.value, targetIso.value, index)
  const partKeys = data.parts.map(part => ensurePartEntry(part).key)

  activeSentences.value.push({
    index,
    key,
    data,
    partKeys,
    finalQueued: false
  })

  queueFinalIfReady(key)
}

const getAvailableSentenceIndices = (): number[] => {
  if (maxIndex.value === null) return []
  const activeIndices = new Set(activeSentences.value.map(sentence => sentence.index))
  const candidates: number[] = []
  for (let i = 0; i <= maxIndex.value; i += 1) {
    const sentenceKey = buildSentenceKey(nativeIso.value, targetIso.value, i)
    if (activeIndices.has(i)) continue
    if (practiceStore.isSentenceLearned(sentenceKey)) continue
    candidates.push(i)
  }
  return candidates
}

const addRandomSentence = async (): Promise<boolean> => {
  const candidates = getAvailableSentenceIndices()
  const nextIndex = pickRandom(candidates)
  if (nextIndex === undefined) {
    return false
  }

  const data = await loadSentenceByIndex(basePath.value, nextIndex)
  addSentenceData(nextIndex, data)
  return true
}

const ensureTwoSentences = async () => {
  while (activeSentences.value.length < 2) {
    const added = await addRandomSentence()
    if (!added) break
  }
}

const queueFinalIfReady = (sentenceKey: string) => {
  const sentence = activeSentences.value.find(item => item.key === sentenceKey)
  if (!sentence || sentence.finalQueued) return
  const ready = sentence.partKeys.every(key => partState.value.get(key) === 'DONE')
  if (!ready) return
  sentence.finalQueued = true
  finalQueue.value.push(sentence.key)
}

const refreshFinalQueue = () => {
  activeSentences.value.forEach(sentence => queueFinalIfReady(sentence.key))
}

const buildTranslations = (translations: string[], limit = 3): TaskText[] => {
  return takeRandom(translations, Math.min(limit, translations.length))
    .map(text => toTaskText(text))
}

const buildMemorizeTask = (partKey: string, part: PartEntry): ActiveTask => ({
  kind: 'memorize',
  partKey,
  data: {
    gloss: toTaskText(part.content, partKey),
    translations: buildTranslations(part.translations)
  }
})

const buildRecallTask = (partKey: string, part: PartEntry): ActiveTask => ({
  kind: 'recall',
  partKey,
  data: {
    gloss: toTaskText(part.content, partKey),
    translations: buildTranslations(part.translations)
  }
})

const buildUnderstandTask = (partKey: string, part: PartEntry): ActiveTask | null => {
  if (!part.usageExamples || part.usageExamples.length < 2) return null

  const examples = takeRandom(part.usageExamples, Math.min(3, part.usageExamples.length))
    .map(([targetText, nativeText]) => ({
      example: toTaskText(targetText),
      translation: toTaskText(nativeText)
    }))

  if (examples.length < 2) return null

  return {
    kind: 'understand',
    partKey,
    data: {
      gloss: toTaskText(part.content, partKey),
      translations: buildTranslations(part.translations),
      examples
    }
  }
}

const buildChallengeTask = (sentence: ActiveSentence): ActiveTask => ({
  kind: 'challenge',
  sentenceKey: sentence.key,
  data: {
    gloss: toTaskText(sentence.data.sentence, sentence.key),
    translations: buildTranslations(sentence.data.translations)
  }
})

const requestNextTask = () => {
  if (finalQueue.value.length) {
    const sentenceKey = finalQueue.value[0]
    const sentence = activeSentences.value.find(item => item.key === sentenceKey)
    if (sentence) {
      currentTask.value = buildChallengeTask(sentence)
    }
    return
  }

  const eligible: string[] = []
  for (const [key, state] of partState.value.entries()) {
    if (state === 'VOCAB-TO-INTRODUCE' || state === 'VOCAB-TO-PRACTICE') {
      if (key !== lastPartKey.value) {
        eligible.push(key)
      }
    }
  }

  if (!eligible.length) {
    for (const [key, state] of partState.value.entries()) {
      if (state === 'VOCAB-TO-INTRODUCE' || state === 'VOCAB-TO-PRACTICE') {
        eligible.push(key)
      }
    }
  }

  const selectedKey = pickRandom(eligible)
  if (!selectedKey) return

  const part = partByKey.value[selectedKey]
  if (!part) return

  const state = partState.value.get(selectedKey)
  if (!state) return

  lastPartKey.value = selectedKey

  if (state === 'VOCAB-TO-INTRODUCE') {
    const preferredOrder = lastIntroTask.value === 'memorize'
      ? (['understand', 'memorize'] as const)
      : (['memorize', 'understand'] as const)
    for (const option of preferredOrder) {
      if (option === 'understand') {
        const understand = buildUnderstandTask(selectedKey, part)
        if (understand) {
          currentTask.value = understand
          lastIntroTask.value = 'understand'
          return
        }
      }
      if (option === 'memorize') {
        currentTask.value = buildMemorizeTask(selectedKey, part)
        lastIntroTask.value = 'memorize'
        return
      }
    }
  } else {
    currentTask.value = buildRecallTask(selectedKey, part)
  }
}

const handleTaskDone = (rememberedCorrectly?: boolean) => {
  if (!currentTask.value) return

  practiceStore.recordTaskCompleted()

  if (currentTask.value.kind === 'challenge') {
    const sentenceKey = currentTask.value.sentenceKey
    practiceStore.markSentenceLearned(sentenceKey)
    practiceStore.recordSentenceCompleted()
    finalQueue.value = finalQueue.value.filter(key => key !== sentenceKey)
    activeSentences.value = activeSentences.value.filter(sentence => sentence.key !== sentenceKey)
    currentTask.value = null

    ensureTwoSentences()
      .then(() => {
        refreshFinalQueue()
        requestNextTask()
      })
      .catch(error => {
        console.error('Failed to load new sentence:', error)
      })
    return
  }

  const partKey = currentTask.value.partKey
  practiceStore.markGlossSeen(partKey)

  if (currentTask.value.kind === 'memorize' || currentTask.value.kind === 'understand') {
    partState.value.set(partKey, 'VOCAB-TO-PRACTICE')
  } else if (currentTask.value.kind === 'recall') {
    if (rememberedCorrectly !== undefined) {
      practiceStore.updateGlossStreak(partKey, rememberedCorrectly)
    }
    if (rememberedCorrectly) {
      partState.value.set(partKey, 'DONE')
    }
  }

  currentTask.value = null
  refreshFinalQueue()
  requestNextTask()
}

const loadPractice = async () => {
  if (!nativeIso.value || !targetIso.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  resetSession()
  try {
    maxIndex.value = await loadSentenceIndexMax(basePath.value)
    await ensureTwoSentences()

    if (!activeSentences.value.length) {
      errorMessage.value = 'No sentences available for this language pair.'
      return
    }

    refreshFinalQueue()
    requestNextTask()
  } catch (error) {
    console.error('Failed to load practice data:', error)
    errorMessage.value = 'Failed to load practice data.'
  } finally {
    isLoading.value = false
  }
}

watch([nativeIso, targetIso], loadPractice, { immediate: true })
</script>

<template>
  <div class="w-full">

    <div
      v-if="isLoading"
      class="flex justify-center py-6"
    >
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div
      v-else-if="errorMessage"
      class="alert alert-warning"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else
      class="w-full flex justify-center"
    >
      <MemorizeFromTargetTask
        v-if="currentTask?.kind === 'memorize'"
        :task="currentTask.data"
        @task-done="handleTaskDone"
      />

      <UnderstandTargetFromSentenceTask
        v-else-if="currentTask?.kind === 'understand'"
        :task="currentTask.data"
        @task-done="handleTaskDone"
      />

      <RecallFromTargetTask
        v-else-if="currentTask?.kind === 'recall'"
        :task="currentTask.data"
        @task-done="handleTaskDone"
      />

      <ChallengeTryToUnderstandTask
        v-else-if="currentTask?.kind === 'challenge'"
        :task="currentTask.data"
        @task-done="handleTaskDone"
      />

      <div
        v-else
        class="flex justify-center py-6"
      >
        <span class="loading loading-spinner loading-lg" />
      </div>
    </div>
  </div>
</template>
