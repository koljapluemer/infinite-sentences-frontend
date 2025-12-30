<script setup lang="ts">
import { computed } from 'vue'
import { usePracticeStore } from '@/entities/practice-tracking/practiceStore'
import DailyCountsChart from './DailyCountsChart.vue'
import StreakVisualization from './StreakVisualization.vue'

const practiceStore = usePracticeStore()

const taskChartData = computed(() => practiceStore.getLast14DaysTaskCounts())
const sentenceChartData = computed(() => practiceStore.getLast14DaysSentenceCounts())
</script>

<template>
  <div class="w-full max-w-full">
    <h1 class="text-3xl font-bold mb-6">
      Stats
    </h1>

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">
        Streak
      </h2>
      <StreakVisualization />
    </div>

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">
        Tasks Done
      </h2>
      <DailyCountsChart
        :data="taskChartData"
        label="Tasks"
      />
    </div>

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">
        Sentences Done
      </h2>
      <DailyCountsChart
        :data="sentenceChartData"
        label="Sentences"
      />
    </div>
  </div>
</template>
