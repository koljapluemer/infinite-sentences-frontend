<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
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
const animationKey = ref(0)
const canFlip = ref(false)

let delayTimer: ReturnType<typeof setTimeout> | null = null

const DELAY_MS = 2000
const CIRCUMFERENCE = 2 * Math.PI * 15

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

const startTimer = () => {
  canFlip.value = false
  if (delayTimer) clearTimeout(delayTimer)
  delayTimer = setTimeout(() => { canFlip.value = true }, DELAY_MS)
}

const resetState = () => {
  flipped.value = false
  phase.value = 'prompt'
  animationKey.value++
  startTimer()
}

onMounted(startTimer)
onUnmounted(() => { if (delayTimer) clearTimeout(delayTimer) })
watch(() => props.task.gloss.content, resetState)
</script>

<template>
  <div class="w-full max-w-xl flex flex-col min-h-[70vh] gap-4">
    <div>
      <ShowInstruction
        v-if="phase === 'prompt'"
        content="Can you understand this?"
      />
    </div>

    <div class="flex-1 flex flex-col gap-4 items-center overflow-auto">
      <IndexCard
        :rows="cardRows"
        :flipped="flipped"
        gold
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
      <template v-if="phase === 'prompt'">
        <svg
          v-if="!canFlip"
          :key="animationKey"
          class="w-10 h-10 -rotate-90 text-base-content/30"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            :stroke-dasharray="CIRCUMFERENCE"
            class="countdown-ring"
          />
        </svg>

        <InteractionButtonRow
          v-else
          :icons="['RefreshCw']"
          @select="flip"
        />
      </template>

      <InteractionButtonRow
        v-else
        :icons="['CheckCheck']"
        @select="finish"
      />
    </div>
  </div>
</template>

<style scoped>
.countdown-ring {
  stroke-dashoffset: 0;
  animation: v-bind('`${DELAY_MS}ms`') linear forwards countdown;
}

@keyframes countdown {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: v-bind(CIRCUMFERENCE); }
}
</style>
