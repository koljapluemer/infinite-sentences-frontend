<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed } from 'vue'
import { format, parse } from 'date-fns'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

type ChartDataPoint = {
  date: string
  count: number
}

const props = defineProps<{
  data: ChartDataPoint[]
  label: string
}>()

const formatDateLabel = (dateStr: string) => {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date())
  return format(date, 'MM/dd')
}

const chartData = computed(() => ({
  labels: props.data.map(point => formatDateLabel(point.date)),
  datasets: [
    {
      label: props.label,
      data: props.data.map(point => point.count),
      backgroundColor: '#2563eb'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}
</script>

<template>
  <div
    class="w-full max-w-full"
    style="height: 300px"
  >
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
