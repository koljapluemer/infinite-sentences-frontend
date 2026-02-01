<script setup lang="ts">
import { computed } from 'vue'
import { Flame, Circle } from 'lucide-vue-next'
import { usePracticeStore } from '@/entities/practice-tracking/practiceStore'
import { format, subDays } from 'date-fns'

const practiceStore = usePracticeStore()

interface DayData {
  date: string
  practiced: boolean
}

const last14Days = computed<DayData[]>(() => {
  const today = new Date()
  const days: DayData[] = []

  for (let i = 13; i >= 0; i--) {
    const date = subDays(today, i)
    const dateStr = format(date, 'yyyy-MM-dd')

    const chartData = practiceStore.getLast14DaysSentenceCounts()
    const dayData = chartData.find(d => d.date === dateStr)
    const practiced = dayData ? dayData.count > 0 : false

    days.push({ date: dateStr, practiced })
  }

  return days
})

const streak = computed<number>(() => practiceStore.getCurrentStreak())
</script>

<template>
  <div class="flex items-center gap-4 overflow-x-auto">
    <div class="flex gap-1">
      <div
        v-for="(day, index) in last14Days"
        :key="index"
        class="text-light"
      >
        <Flame
          v-if="day.practiced"
          :size="16"
          class="text-orange-500"
        />
        <Circle
          v-else
          :size="16"
        />
      </div>
    </div>
    <div class="text-2xl font-bold">
      {{ streak }}
    </div>
  </div>
</template>
