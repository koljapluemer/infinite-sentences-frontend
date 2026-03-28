<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ShowInstruction from '../../elements/ShowInstruction.vue'
import IndexCard from '../../elements/IndexCard.vue'
import InteractionButtonRow from '../../elements/InteractionButtonRow.vue'
import type { IndexCardRow } from '../../elements/types'
import type { ChallengeTryToUnderstandTask } from './interface'

defineOptions({ name: 'ChallengeTryToUnderstandTask' })

const props = defineProps<{
  task: ChallengeTryToUnderstandTask
}>()

const emit = defineEmits<{
  (e: 'taskDone', rememberedCorrectly?: boolean): void
}>()

const flipped = ref(false)
const phase = ref<'prompt' | 'reveal'>('prompt')

const cardRows = computed<IndexCardRow[]>(() => {
  const glossRow: IndexCardRow = { type: 'text', text: props.task.gloss.content, size: 'auto', subtext: props.task.gloss.transcription }

  if (phase.value === 'prompt') return [glossRow]

  const translationRows = props.task.translations.map(translation => (
    { type: 'text', text: translation.content, size: 'auto' } as IndexCardRow
  ))

  return [glossRow, { type: 'divider' }, ...translationRows]
})

const flip = () => {
  flipped.value = true
  phase.value = 'reveal'
}

const finish = () => emit('taskDone', true)

const resetState = () => {
  flipped.value = false
  phase.value = 'prompt'
}

watch(() => props.task.gloss.content, () => resetState())
</script>

<template>
  <div class="w-full max-w-xl flex flex-col min-h-[70vh] gap-4">
    <div>
      <ShowInstruction
        v-if="phase === 'prompt'"
        content="Can you understand this? Try to translate, then reveal."
      />
    </div>

    <div class="flex-1 flex flex-col gap-4 items-center overflow-auto">
      <IndexCard
        :rows="cardRows"
        :flipped="flipped"
        fill
      />

      <div
        v-if="phase === 'reveal' && task.credits && task.credits.length > 0"
        class="text-xs text-base-content/60 text-center px-4"
      >
        <div
          v-for="(credit, idx) in task.credits"
          :key="idx"
        >
          {{ credit }}
        </div>
      </div>
    </div>

    <div class="mt-auto flex justify-center">
      <InteractionButtonRow
        v-if="phase === 'prompt'"
        :icons="['RefreshCw']"
        @select="flip"
      />

      <InteractionButtonRow
        v-else
        :icons="['CheckCheck']"
        @select="finish"
      />
    </div>
  </div>
</template>
