<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { computed, ref, watchEffect } from 'vue'
import { format, parse } from 'date-fns'
import { useUserSettingsStore } from '@/entities/user-settings/userSettingsStore'
import { getLanguageDisplayName } from '@/entities/language'
import type { usePracticeStore } from '@/entities/practice-tracking/practiceStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, annotationPlugin)

const generateColor = (index: number, total: number): string => {
  const hue = (index * 360 / Math.max(total, 1)) % 360
  return `hsl(${hue}, 70%, 50%)`
}

const props = defineProps<{
  practiceStore: ReturnType<typeof usePracticeStore>
}>()

const userSettings = useUserSettingsStore()

const formatDateLabel = (dateStr: string) => {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date())
  return format(date, 'MM/dd')
}

const languageNames = ref<Record<string, string>>({})

const rawData = computed(() => props.practiceStore.getLast14DaysSentenceCountsByLanguage())
const languages = computed(() => props.practiceStore.getAllPracticedLanguages())

watchEffect(async () => {
  for (const lang of languages.value) {
    if (!languageNames.value[lang]) {
      languageNames.value[lang] = await getLanguageDisplayName(lang)
    }
  }
})

const chartData = computed(() => {
  const labels = rawData.value.map(point => formatDateLabel(point.date))
  const langs = languages.value

  if (langs.length === 0) {
    const totals = props.practiceStore.getLast14DaysSentenceCounts()
    return {
      labels,
      datasets: [{
        label: 'Sentences',
        data: totals.map(d => d.count),
        backgroundColor: '#2563eb'
      }]
    }
  }

  const datasets = langs.map((lang, index) => ({
    label: languageNames.value[lang] || lang,
    data: rawData.value.map(point => point.counts[lang] || 0),
    backgroundColor: generateColor(index, langs.length)
  }))

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    },
    annotation: {
      annotations: {
        goalLine: {
          type: 'line' as const,
          yMin: userSettings.dailySentenceGoal,
          yMax: userSettings.dailySentenceGoal,
          borderColor: '#dc2626',
          borderWidth: 2,
          borderDash: [6, 6],
          label: {
            display: true,
            content: `Goal: ${userSettings.dailySentenceGoal}`,
            position: 'end' as const,
            backgroundColor: 'transparent',
            color: '#dc2626',
            font: { size: 11 }
          }
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}))
</script>

<template>
  <div
    class="w-full"
    style="height: 300px"
  >
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
