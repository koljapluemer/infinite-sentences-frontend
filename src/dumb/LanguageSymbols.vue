<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { shuffleArray } from '@/dumb/random'

const props = defineProps<{
  symbols: string[]
}>()

const shuffledSymbols = ref<string[]>([])

watch(() => props.symbols, (newSymbols) => {
  shuffledSymbols.value = shuffleArray(newSymbols)
}, { immediate: true })

const count = computed(() => props.symbols.length)
</script>

<template>
  <div
    class="language-symbols"
    :class="`layout-${count}`"
  >
    <span
      v-for="(symbol, i) in shuffledSymbols"
      :key="i"
      class="symbol font-bold"
      :class="`symbol-${i + 1}`"
    >{{ symbol }}</span>
  </div>
</template>

<style scoped>
.language-symbols {
  display: grid;
  width: 4rem;
  height: 4rem;
  place-items: center;
  font-size: 1rem;
  line-height: 1;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.symbol {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 1 symbol: single large centered */
.layout-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
.layout-1 .symbol {
  font-size: 3.5rem;
}

/* 2 symbols: side by side */
.layout-2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: 0.125rem;
}
.layout-2 .symbol {
  font-size: 1.75rem;
}

/* 3 symbols: large left, two small stacked right */
.layout-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.125rem;
}
.layout-3 .symbol-1 {
  grid-row: 1 / 3;
  font-size: 2rem;
}
.layout-3 .symbol-2,
.layout-3 .symbol-3 {
  font-size: 1.25rem;
}

/* 4 symbols: 2x2 grid */
.layout-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.125rem;
}
.layout-4 .symbol {
  font-size: 1.5rem;
}
</style>
