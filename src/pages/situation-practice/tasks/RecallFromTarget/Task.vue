<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ShowInstruction from '../../elements/ShowInstruction.vue'
import IndexCard from '../../elements/IndexCard.vue'
import InteractionButtonRow from '../../elements/InteractionButtonRow.vue'
import type { IndexCardRow } from '../../elements/types'
import type { RecallFromTargetTask } from './interface'

defineOptions({ name: 'RecallFromTargetTask' })

const props = defineProps<{
  task: RecallFromTargetTask
}>()

const emit = defineEmits<{
  (e: 'taskDone', rememberedCorrectly?: boolean): void
}>()

const phase = ref<'prompt' | 'reveal'>('prompt')
const flipped = ref(false)

const cardRows = computed<IndexCardRow[]>(() => {
  const glossRow: IndexCardRow = { type: 'text', text: props.task.gloss.content, size: 'auto', subtext: props.task.gloss.transcription }

  if (phase.value === 'prompt') return [glossRow]

  const translationRows = props.task.translations.map(translation => (
    { type: 'text', text: translation.content, size: 'auto' } as IndexCardRow
  ))

  return [glossRow, { type: 'divider' }, ...translationRows]
})

const handleFlip = () => {
  flipped.value = true
  phase.value = 'reveal'
}

const handleDone = (icon: string) => emit('taskDone', icon === 'Check')

const resetState = () => {
  phase.value = 'prompt'
  flipped.value = false
}

watch(() => props.task.gloss.content, () => resetState())
</script>

<template>
  <div class="w-full max-w-xl flex flex-col min-h-[70vh] gap-4">
    <div>
      <ShowInstruction
        v-if="phase === 'prompt'"
        content="Do you remember what this means?"
      />
    </div>

    <div class="flex-1 flex flex-col gap-4 items-center overflow-auto">
      <IndexCard
        :rows="cardRows"
        :flipped="flipped"
        fill
      />
    </div>

    <div class="mt-auto flex justify-center">
      <InteractionButtonRow
        v-if="phase === 'prompt'"
        :icons="['RefreshCw']"
        @select="handleFlip"
      />

      <InteractionButtonRow
        v-else
        :icons="['Check', 'X']"
        @select="handleDone"
      />
    </div>
  </div>
</template>
