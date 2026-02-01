<script setup lang="ts">
import { usePracticeStore } from '@/entities/practice-tracking/practiceStore'
import DailyCountsChart from './DailyCountsChart.vue'
import StreakVisualization from './StreakVisualization.vue'

const practiceStore = usePracticeStore()
</script>

<template>
  <div class="w-full max-w-full">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">
        Streak
      </h2>
      <StreakVisualization />
    </div>

    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">
        Sentences Done
      </h2>
      <DailyCountsChart :practice-store="practiceStore" />
    </div>
  </div>
</template>
